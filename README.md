A site to playback sections of an mp3 file for practicing / transcribing !

A ripoff of [this windows program "BestPractice"](https://bestpractice.sourceforge.net/#contact) that I used as a 14 year old trumpet player for 100s of hours to learn songs on piano etc.

### features:
- load mp3 files from filesystem
- set playback minute/second/milliseconds
- set loop start / end
- set playback speed with pitch preservation
- audio files stay on your machine and no data is uploaded to a server. this is a static site.

### neat:

- TIL; https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/preservesPitch
  - I thought this was gonna be way harder. Web rules.
- Got from initial idea to commit 2d0222a5289f in about 1.5 hours w Claude Sonnet 4 through gh copilot in Zed. Pretty amazing.

### future ideas:

- Waveform: Would help me more quickly find the milliseconds accuracy beginning of a measure / downbeat.
  - Replace seek bar with visual waveform of loaded audio.
  - Clicking on waveform portion to set playback position.
  - Waveform zoom in/out functionality
  - Postion | tracking is always center on the waveform as the wave form moves left to right
  - Clicking and dragging waveform

- There's a bit of a chop when the loop navigates the position to the beginning. An advanced loop that utilizes a dedicated audio buffer would be interesting to attempt to avoid that hiccup in playback
