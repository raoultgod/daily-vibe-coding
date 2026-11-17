---
name: ai-vlog
description: Create an observed bilingual vlog from local video.
---

# AI vlog

Turn a user-provided local video into a friendly observer-style vlog with British English narration and English/Korean captions. The agent interprets sampled frames; the local CLI prepares and renders. Never imply that sparse frames show every event, speech, sound, intention or identity.

## Procedure

1. Obtain all video paths and consent to process it. Work in this project's directory; inspect `python3 vlog.py prepare --help` and `python3 vlog.py render --help` for current options. Do not use external video URLs or upload video by default.
2. Run `python3 vlog.py prepare "VIDEO" --out "WORKDIR" --interval 2`. For multiple videos pass each path in order: `python3 vlog.py prepare "VIDEO1" "VIDEO2" --out "WORKDIR" --interval 2`. Read `WORKDIR/manifest.json` and actually inspect the listed frame images using the agent's image/vision tool. Each frame has a `video_id`; timestamps are seconds local to that source. If vision is unavailable, stop and ask for observations rather than inventing them. Inspect additional frames if sampling misses important moments.
3. Write a UTF-8 JSON file with a top-level `segments` array. Each segment has the manifest `video_id` (required for multiple sources), numeric `start` and `end` seconds, `english` and `korean` strings, and optionally `audio` pointing to a local narration recording. Order segments chronologically; do not overlap, exceed its selected video duration, or make `end` less than or equal to `start`. Use concise matching English/Korean meanings. Use third-person observational language, natural British English spelling, a warm tone and only evidence actually seen; do not invent dialogue, identities, locations or feelings. Avoid reading sensitive details on screen aloud. Keep narration short enough to fit each interval.
4. Review the draft with the user when factual or privacy uncertainty matters. For offline speech, supply an `audio` file for every segment, relative to the plan file (or an absolute path). Otherwise the renderer invokes the installed `edge_tts` module using the CLI Python interpreter for each missing audio file, sends narration text to its online service, and defaults to `en-GB-SoniaNeural`; obtain permission before that network use. Render with `python3 vlog.py render "VIDEO" --script "PLAN.json" --out "OUTPUT.mp4"` For multiple inputs pass the same paths in the same order used for prepare, then inspect the result. Do not claim narration exists if rendering fails. The renderer concatenates selected source intervals in plan order, discards original audio, burns in captions, and may speed up long speech to fit.
5. Verify the output exists, play or inspect it, and check caption timing, translations, intelligibility and privacy. Report the output path, what was actually verified, and any missing voice or unchecked elements.

## Privacy and limits

Local input does not guarantee local inference: image tools and AI providers may transmit frames, transcripts or prompts externally. Obtain informed permission before sending sensitive content to a remote model. Extracted frames, scripts, audio and rendered files may persist in the work directory; do not publish, upload, delete or overwrite user files without permission. Sparse frames cannot establish what happened between them. Do not claim a final result if rendering or review fails.
