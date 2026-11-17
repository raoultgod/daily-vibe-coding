import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
CLI = ROOT / 'vlog.py'


def run(*args, check=True):
    return subprocess.run([str(x) for x in args], text=True, capture_output=True, check=check)


class VlogIntegration(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='vlog-test-', dir=os.environ.get('TMPDIR'))
        self.base = Path(self.temp.name)
        self.video = self.base / 'source clip.mp4'
        run('ffmpeg', '-v', 'error', '-f', 'lavfi', '-i', 'color=c=blue:s=320x240:r=10:d=3', '-c:v', 'mpeg4', '-y', self.video)

    def tearDown(self):
        self.temp.cleanup()

    def test_prepare_extracts_frames_and_manifest(self):
        out = self.base / 'prepared'
        run(sys.executable, CLI, 'prepare', self.video, '--out', out, '--interval', '1')
        manifest = json.loads((out / 'manifest.json').read_text())
        self.assertAlmostEqual(manifest['duration'], 3, places=1)
        self.assertEqual([f['time'] for f in manifest['frames']], [0, 1, 2])
        for frame in manifest['frames']:
            self.assertTrue((out / frame['file']).is_file())

    def test_real_render_with_supplied_narration_audio(self):
        audio = self.base / 'voice.wav'
        run('ffmpeg', '-v', 'error', '-f', 'lavfi', '-i', 'sine=frequency=500:duration=1', '-y', audio)
        script = self.base / 'script.json'
        script.write_text(json.dumps({'segments': [
            {'start': 0, 'end': 1.5, 'english': 'A quiet blue moment.', 'korean': '조용한 파란 순간.', 'audio': str(audio)},
            {'start': 1.5, 'end': 3, 'english': 'And on we go.', 'korean': '그리고 계속 갑니다.', 'audio': str(audio)}
        ]}, ensure_ascii=False))
        out = self.base / 'finished video.mp4'
        run(sys.executable, CLI, 'render', self.video, '--script', script, '--out', out)
        info = json.loads(run('ffprobe', '-v', 'error', '-show_entries', 'format=duration:stream=codec_type', '-of', 'json', out).stdout)
        self.assertEqual({s['codec_type'] for s in info['streams']}, {'audio', 'video'})
        self.assertAlmostEqual(float(info['format']['duration']), 3, delta=.3)

    def test_multiple_sources_prepare_and_render_in_plan_order(self):
        other = self.base / 'other.mp4'
        run('ffmpeg', '-v', 'error', '-f', 'lavfi', '-i', 'color=c=red:s=160x120:r=10:d=2', '-c:v', 'mpeg4', '-y', other)
        audio = self.base / 'voice.wav'
        run('ffmpeg', '-v', 'error', '-f', 'lavfi', '-i', 'sine=frequency=500:duration=1', '-y', audio)
        prepared = self.base / 'prepared'
        run(sys.executable, CLI, 'prepare', self.video, other, '--out', prepared, '--interval', '1')
        manifest = json.loads((prepared / 'manifest.json').read_text())
        self.assertEqual([v['id'] for v in manifest['videos']], ['video-0001', 'video-0002'])
        self.assertEqual([f['video_id'] for f in manifest['frames']], ['video-0001'] * 3 + ['video-0002'] * 2)
        self.assertEqual(len({f['file'] for f in manifest['frames']}), 5)
        self.assertTrue(all((prepared / f['file']).is_file() for f in manifest['frames']))
        script = self.base / 'plan.json'
        script.write_text(json.dumps({'segments': [
            {'video_id': 'video-0002', 'start': 0, 'end': 1, 'english': 'Red', 'korean': '빨강', 'audio': str(audio)},
            {'video_id': 'video-0001', 'start': 0, 'end': 1, 'english': 'Blue', 'korean': '파랑', 'audio': str(audio)},
        ]}, ensure_ascii=False))
        out = self.base / 'multi.mp4'
        run(sys.executable, CLI, 'render', self.video, other, '--script', script, '--out', out)
        for time, dominant in [('0.4', 0), ('1.4', 2)]:
            result = subprocess.run(['ffmpeg', '-v', 'error', '-ss', time, '-i', str(out), '-vf', 'crop=1:1:300:100,format=rgb24', '-frames:v', '1', '-f', 'rawvideo', '-'], capture_output=True, check=True)
            self.assertEqual(max(range(3), key=lambda i: result.stdout[i]), dominant)

    def test_multi_source_rejects_missing_unknown_and_out_of_range_ids(self):
        other = self.base / 'short.mp4'
        run('ffmpeg', '-v', 'error', '-f', 'lavfi', '-i', 'color=c=red:s=160x120:r=10:d=1', '-c:v', 'mpeg4', '-y', other)
        script = self.base / 'bad.json'
        for video_id, end in [(None, 0.5), ('video-9999', 0.5), ('video-0002', 2)]:
            segment = {'start': 0, 'end': end, 'english': 'Hi', 'korean': '안녕'}
            if video_id is not None:
                segment['video_id'] = video_id
            script.write_text(json.dumps({'segments': [segment]}))
            result = run(sys.executable, CLI, 'render', self.video, other, '--script', script, '--out', self.base / 'out.mp4', check=False)
            self.assertNotEqual(result.returncode, 0)
            self.assertIn('segment 1', result.stderr)

    def test_generated_narration_invokes_current_python_module(self):
        from unittest.mock import patch
        from argparse import Namespace
        sys.path.insert(0, str(ROOT))
        import vlog
        script = self.base / 'voice-plan.json'
        script.write_text(json.dumps({'segments': [{'start': 0, 'end': 1, 'english': 'Hello', 'korean': '안녕'}]}))
        original = vlog.command
        calls = []
        def command(args, **kwargs):
            if '--write-media' in args:
                calls.append(args)
                original(['ffmpeg', '-v', 'error', '-f', 'lavfi', '-i', 'sine=duration=1', '-y', args[-1]])
            else:
                return original(args, **kwargs)
        with patch.object(vlog, 'command', side_effect=command):
            vlog.render(Namespace(video=[self.video], script=script, out=self.base / 'render.mp4', voice='en-GB-SoniaNeural'))
        self.assertEqual(calls[0][:3], [sys.executable, '-m', 'edge_tts'])

    def test_subtitle_timeline_uses_cut_duration_and_escapes_tags(self):
        sys.path.insert(0, str(ROOT))
        import vlog
        path = self.base / 'captions.ass'
        vlog.subtitles([
            {'start': 1, 'end': 2.5, 'english': 'First {test}', 'korean': '첫 번째'},
            {'start': 8, 'end': 9, 'english': 'Second', 'korean': '두 번째'},
        ], path)
        text = path.read_text(encoding='utf-8')
        self.assertIn('0:00:01.50,0:00:02.50,English', text)
        self.assertIn('First ｛test｝', text)
        self.assertIn('Style: English,DejaVu Sans,44', text)
        self.assertIn('Style: Korean,Noto Sans CJK KR,27', text)

    def test_rejects_invalid_segment(self):
        script = self.base / 'bad.json'
        script.write_text(json.dumps({'segments': [{'start': 2, 'end': 1, 'english': 'Hi', 'korean': '안녕'}]}))
        result = run(sys.executable, CLI, 'render', self.video, '--script', script, '--out', self.base / 'out.mp4', check=False)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('segment', result.stderr.lower())


if __name__ == '__main__':
    unittest.main()
