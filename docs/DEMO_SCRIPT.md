# Demo video script (3 to 5 minutes)

Record your screen with voice-over (OBS or Windows Game Bar). Speak in English. Upload as unlisted YouTube
or a Google Drive link with view access. Only show things that actually work; record the real-model segment
after the endpoint is running.

**0:00 - 0:30 Problem.** "N-ATLAS is Nigeria's open language model, but using it means solving serving,
streaming, retries, voice and UI from scratch. We're Telnora Technologies. We built a toolkit that removes that work."

**0:30 - 1:15 Zero to first call.** Show the docs page. Run the one-command `docker compose up` (or show the
already-running endpoint). In a terminal, run the 5-line TypeScript example. Show the real reply. Say the elapsed time.

**1:15 - 2:00 Streaming and errors.** Run the streaming example so text appears token by token. Then stop the
server briefly to show the typed error and automatic retry.

**2:00 - 3:00 Playground and voice.** Open the playground, choose "My N-ATLAS endpoint", paste the URL.
Type a prompt and show streaming. Click Record, say a sentence in Nigerian English, show the transcript
appear, send it.

**3:00 - 3:40 Python.** Show the same call in Python with `telnora-natlas`.

**3:40 - 4:20 Validation.** Show the beta testers' feedback summary and one change you made because of it.
State clearly what limitations remain (30s ASR limit, GPU required for the LLM).

**4:20 - 4:50 Impact and next steps.** "Any Nigerian developer or agency can add N-ATLAS to a product in
minutes. Next: npm/PyPI packages, React Native, an EdTech sample app." End with the repo and demo URLs on screen.
