# AI vlog

Turn one or more **local video files** into a short edited vlog with friendly, third-person British English narration and burned-in English/Korean captions. The CLI extracts frames and renders; a vision-capable agent must actually inspect those frames and write the plan. This is not automatic video understanding, transcription or a guarantee that anything between sampled frames was seen.

## Requirements

- Python 3, FFmpeg and ffprobe on `PATH`. FFmpeg needs `libx264` and the `ass` filter (libass).
- A Korean-capable font such as Noto Sans CJK KR for readable Hangul. Font availability and subtitle appearance vary by system.
- A vision-capable agent with access to the images, or a person to inspect them and author the plan.
- For generated voice only: install `edge-tts` in the same Python environment used to run the CLI (for example, `python3 -m pip install edge-tts`); the CLI invokes it as `python3 -m edge_tts`, so its executable need not be on `PATH`, network access and a working service. The default is `en-GB-SoniaNeural`; use `--voice` for another supported Edge voice. Alternatively provide an audio file for **every** segment and no `edge-tts` call is needed. Supplied audio must be intelligible and in the desired accent; the program does not verify this.

## Quick start

From this directory, using your own paths:

```sh
python3 vlog.py prepare "my-video.mp4" "another-video.mp4" --out "work" --interval 2
# Have your agent inspect work/manifest.json and the actual frame images,
# then write work/plan.json using the format below.
python3 vlog.py render "my-video.mp4" "another-video.mp4" --script "work/plan.json" --out "vlog.mp4"
```

Pass the same videos in the same order to both commands: their positional order assigns IDs `video-0001`, `video-0002`, and so on. Each manifest `videos` entry records its ID, path, and duration; each frame has its `video_id` and a timestamp local to that video. `prepare` samples source timestamps (default interval 5 seconds) and writes JPEGs and `manifest.json`. A smaller interval costs more time and storage, and still cannot capture everything. Existing generated frame names and the manifest may be overwritten; use a fresh work directory. A successful render can overwrite an existing output file; choose a fresh output path. The renderer concatenates the selected source intervals **in plan order**, drops unselected intervals and original audio, adds narration, and burns both caption languages into the video. Speech longer than its interval is sped up to fit; listen for unnatural speed. Captions are not separate editable tracks.

## Plan format

The agent creates UTF-8 JSON, with non-empty English and Korean strings and source-video times in seconds. This example illustrates the schema only; replace its observations and timings with ones supported by your actual video:

```json
{
  "segments": [
    {
      "video_id": "video-0001",
      "start": 0,
      "end": 3,
      "english": "A quiet moment unfolds.",
      "korean": "고요한 순간이 펼쳐집니다.",
      "audio": "voice-01.wav"
    }
  ]
}
```

`video_id` is required for every segment when multiple videos are supplied; for a single video it may be omitted for compatibility. Start/end refer to the selected video, not a combined timeline. Rendering normalizes clips to 1280×720 at 30 fps with padding to preserve aspect ratio. `audio` is optional per segment; paths are relative to the plan file (absolute paths also work). If omitted, `edge-tts` generates that segment's speech online. Each `start` must be non-negative and each `end` later than `start` and within the source duration. For a coherent chronological edit, order intervals and avoid overlaps; the CLI concatenates them as provided rather than enforcing that editorial rule. Keep words short enough for the interval; review translations and captions manually.

## Using the portable skill

The source is [`skills/ai-vlog/SKILL.md`](skills/ai-vlog/SKILL.md). In any of Claude Code, Codex or Hermes, an explicit and portable way to use it is to open the project and ask the agent: “Read `skills/ai-vlog/SKILL.md` and follow it for my local video at …”. Grant access only to the files and operations you intend. Agent image-tool availability, provider capabilities, permissions and automatic skill discovery vary; the instruction file alone does not install or enable those features. You may also copy the skill directory into your agent's documented skill location if you want automatic discovery; consult that agent's current documentation for the applicable scope.

The skill directs the agent to inspect frame images rather than infer content from filenames or user notes, write an evidence-grounded plan, and verify the rendered output. If no image capability is available, provide observations manually or use a capable agent; do not fabricate a frame analysis.

## Privacy and review

The CLI operates on local video files, but **local input does not imply an offline workflow**. A hosted vision model may receive frames or prompts, and `edge-tts` sends narration text to an external service. Check your agent/provider's data handling and obtain appropriate consent before sending images or text; supply local audio for every segment and use local vision or human review if you need an offline workflow. Frames, manifests, plans and outputs can contain personal information and remain on disk; manage them as sensitive files. Review faces, screens and other identifying details before sharing. Do not publish automatically.

Inspect the rendered video yourself for factual accuracy, timing, voice, Korean glyphs and translations. Sparse samples cannot establish identity, location, thoughts, dialogue or events between frames. No particular video, accent or visual quality is guaranteed.

For options, run `python3 vlog.py prepare --help` and `python3 vlog.py render --help`. Run the local integration tests with `python3 -m unittest discover -s tests -v` when FFmpeg is available.
