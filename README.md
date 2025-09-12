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

### learnings:

- Svelte isn't js free, not really sure how that got in my head:

```md
The Svelte "Myth" vs Reality

**The Marketing Promise**: "Svelte compiles away" - suggesting the framework disappears entirely.

**The Reality**: Svelte compiles away the *virtual DOM* and *component abstraction*, but still needs runtime code for:
- Reactivity system (`$state`, `$derived`, etc.)
- Event handling
- DOM manipulation utilities
- Component lifecycle management
- Hydration (even for static sites)

## What's Actually in Your Bundle

Looking at your 32KB chunk, it likely contains:
- **Svelte runtime** (~15-20KB) - reactivity, DOM utilities, lifecycle
- **SvelteKit runtime** (~10-15KB) - routing, page management, hydration
- **Your component logic** (~5-10KB)

## Why This Happens Even for Static Sites

Even with `export const prerender = true`, SvelteKit still includes client-side JavaScript for:
- **Hydration** - Making the static HTML interactive
- **Client-side navigation** - Between pages (even if you only have one)
- **Component reactivity** - Your `$state` variables, event handlers
```
