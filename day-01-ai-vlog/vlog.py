#!/usr/bin/env python3
"""Local frame extraction and narrated bilingual vlog rendering."""
import argparse
import json
import math
import os
from pathlib import Path
import subprocess
import sys
import tempfile


def command(args, **kwargs):
    try:
        return subprocess.run([str(a) for a in args], check=True, capture_output=True, text=True, **kwargs)
    except FileNotFoundError as exc:
        raise ValueError(f'Missing executable: {exc.filename}') from exc
    except subprocess.CalledProcessError as exc:
        raise ValueError(f'{args[0]} failed: {exc.stderr.strip()}') from exc


def duration(path):
    result = command(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'json', path])
    try:
        value = float(json.loads(result.stdout)['format']['duration'])
    except (ValueError, KeyError, TypeError) as exc:
        raise ValueError(f'Cannot determine duration of {path}') from exc
    if not math.isfinite(value) or value <= 0:
        raise ValueError(f'Invalid media duration: {path}')
    return value


def prepare(args):
    videos = [path.resolve() for path in args.video]
    lengths = [duration(video) for video in videos]
    if not math.isfinite(args.interval) or args.interval <= 0:
        raise ValueError('interval must be positive and finite')
    out = args.out.resolve()
    out.mkdir(parents=True, exist_ok=True)
    (out / 'frames').mkdir(exist_ok=True)
    frames = []
    sources = []
    for index, (video, length) in enumerate(zip(videos, lengths), 1):
        video_id = f'video-{index:04d}'
        sources.append({'id': video_id, 'path': str(video), 'duration': length})
        for i in range(math.ceil(length / args.interval)):
            time = round(i * args.interval, 6)
            name = f'frames/{video_id}-frame-{i:05d}.jpg'
            command(['ffmpeg', '-v', 'error', '-ss', str(time), '-i', video, '-frames:v', '1', '-q:v', '2', '-y', out / name])
            if not (out / name).exists():
                raise ValueError(f'No frame decoded in {video_id} at {time}s')
            frames.append({'video_id': video_id, 'time': time, 'file': name})
    manifest = {'videos': sources, 'interval': args.interval, 'frames': frames,
                'agent_instructions': 'Inspect the sampled frames, not user notes. Write a friendly observer narration in British English, with natural Korean translations. Return JSON segments with video_id, source start/end seconds, english, and korean; use only what the frames support.'}
    if len(videos) == 1:
        manifest.update(video=str(videos[0]), duration=lengths[0])
    (out / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(out / 'manifest.json')


def load_segments(path, lengths):
    data = json.loads(path.read_text(encoding='utf-8'))
    segments = data.get('segments') if isinstance(data, dict) else None
    if not isinstance(segments, list) or not segments:
        raise ValueError('script must contain a non-empty segments array')
    for i, item in enumerate(segments):
        if not isinstance(item, dict):
            raise ValueError(f'segment {i+1} must be an object')
        video_id = item.get('video_id')
        if video_id is None and len(lengths) == 1:
            video_id = next(iter(lengths))
        if not isinstance(video_id, str) or video_id not in lengths:
            raise ValueError(f'segment {i+1}: unknown or missing video_id')
        item['video_id'] = video_id
        length = lengths[video_id]
        start, end = item.get('start'), item.get('end')
        if (isinstance(start, bool) or isinstance(end, bool) or not isinstance(start, (int, float))
                or not isinstance(end, (int, float)) or not math.isfinite(start) or not math.isfinite(end)
                or start < 0 or end <= start or end > length + 0.001):
            raise ValueError(f'segment {i+1}: invalid source start/end')
        for key in ('english', 'korean'):
            if not isinstance(item.get(key), str) or not item[key].strip():
                raise ValueError(f'segment {i+1}: {key} must be non-empty text')
        if 'audio' in item and (not isinstance(item['audio'], str) or not item['audio']):
            raise ValueError(f'segment {i+1}: audio must be a path')
    return segments


def ass_time(seconds):
    centis = round(seconds * 100)
    return f'{centis // 360000}:{centis // 6000 % 60:02d}:{centis // 100 % 60:02d}.{centis % 100:02d}'


def ass_text(text):
    # Prevent ASS override tags from allowing content to alter subtitle styling.
    return text.replace('\\', '／').replace('{', '｛').replace('}', '｝').replace('\r', '').replace('\n', r'\N')


def subtitles(segments, path):
    header = '''[Script Info]
ScriptType: v4.00+
PlayResX: 1280
PlayResY: 720
ScaledBorderAndShadow: yes
WrapStyle: 0
[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: English,DejaVu Sans,44,&H00FFFFFF,&H00FFFFFF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,3,1,2,40,40,82,1
Style: Korean,Noto Sans CJK KR,27,&H00FFFFFF,&H00FFFFFF,&H00000000,&H80000000,0,0,0,0,100,100,0,0,1,2,1,2,40,40,42,1
[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
'''
    events = []
    elapsed = 0.0
    for segment in segments:
        end = elapsed + segment['end'] - segment['start']
        for style, key in [('English', 'english'), ('Korean', 'korean')]:
            events.append(f'Dialogue: 0,{ass_time(elapsed)},{ass_time(end)},{style},,0,0,0,,{ass_text(segment[key])}')
        elapsed = end
    path.write_text(header + '\n'.join(events) + '\n', encoding='utf-8')


def render(args):
    videos = {f'video-{i:04d}': path.resolve() for i, path in enumerate(args.video, 1)}
    script = args.script.resolve()
    segments = load_segments(script, {key: duration(path) for key, path in videos.items()})
    output = args.out.resolve()
    if output in videos.values() or output == script:
        raise ValueError('output must not overwrite source video or script')
    output.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='vlog-', dir=os.environ.get('TMPDIR')) as temp:
        work = Path(temp)
        subtitles(segments, work / 'captions.ass')
        clips = []
        for i, segment in enumerate(segments):
            segment_duration = segment['end'] - segment['start']
            if 'audio' in segment:
                audio = (script.parent / segment['audio']).resolve()
                if not audio.is_file():
                    raise ValueError(f'segment {i+1}: audio file not found: {audio}')
            else:
                audio = work / f'voice-{i}.mp3'
                command([sys.executable, '-m', 'edge_tts', '--voice', args.voice, '--text', segment['english'], '--write-media', audio])
            audio_length = duration(audio)
            speed = max(1, audio_length / segment_duration)
            # FFmpeg atempo supports 0.5–2.0 reliably; chain for larger factors.
            factors = []
            while speed > 2:
                factors.append('atempo=2')
                speed /= 2
            factors.append(f'atempo={speed:.8f}')
            audio_filter = ','.join(factors) + f',apad,atrim=duration={segment_duration:.6f},asetpts=PTS-STARTPTS'
            clip = work / f'clip-{i:05d}.mp4'
            command(['ffmpeg', '-v', 'error', '-ss', str(segment['start']), '-i', videos[segment['video_id']], '-i', audio,
                     '-filter_complex', f'[0:v]trim=duration={segment_duration:.6f},setpts=PTS-STARTPTS,scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30[v];[1:a]{audio_filter}[a]',
                     '-map', '[v]', '-map', '[a]', '-c:v', 'libx264', '-preset', 'veryfast', '-pix_fmt', 'yuv420p',
                     '-c:a', 'aac', '-ar', '48000', '-ac', '2', '-t', str(segment_duration), '-y', clip])
            clips.append(clip)
        (work / 'clips.txt').write_text(''.join(f"file '{clip.name}'\n" for clip in clips), encoding='utf-8')
        # Relative paths in a private working directory avoid FFmpeg filter escaping issues.
        command(['ffmpeg', '-v', 'error', '-f', 'concat', '-safe', '1', '-i', 'clips.txt', '-vf', 'ass=captions.ass',
                 '-c:v', 'libx264', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', '-c:a', 'aac',
                 '-movflags', '+faststart', '-y', output], cwd=work)
    print(output)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest='action', required=True)
    prep = sub.add_parser('prepare', help='extract timestamped frames for an agent to inspect')
    prep.add_argument('video', type=Path, nargs='+')
    prep.add_argument('--out', type=Path, required=True)
    prep.add_argument('--interval', type=float, default=5)
    prep.set_defaults(func=prepare)
    rend = sub.add_parser('render', help='render selected clips with bilingual subtitles and voiceover')
    rend.add_argument('video', type=Path, nargs='+')
    rend.add_argument('--script', type=Path, required=True)
    rend.add_argument('--out', type=Path, required=True)
    rend.add_argument('--voice', default='en-GB-SoniaNeural', help='edge-tts voice (default: en-GB-SoniaNeural)')
    rend.set_defaults(func=render)
    args = parser.parse_args()
    try:
        args.func(args)
    except (ValueError, OSError, json.JSONDecodeError) as exc:
        print(f'Error: {exc}', file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main())
