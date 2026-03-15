LLM Notes:

- do not run npm or node run commands, this repo uses bun.
- If you try to validate changes made to the sveltekit app and run `bun run dev` or `bun run preview` the terminal will hang because that's a held process. Don't run those commands, I already have the app running on 5173

Strive for the following:

- Introduce no asthetic (colors, fonts, etc) related css styles to the application at all unless explicitly instructed. Only css that is regards to basic should be utilized.
  - NO color classes: Avoid bg-[color], text-[color], border-[color] classes unless explicitly requested
  - NO hover/focus color effects: Avoid hover:bg-[color], focus:ring-[color] etc.
  - NO aesthetic backgrounds: Avoid colored backgrounds like bg-blue-500, bg-gray-50, etc.
  - ONLY functional/layout Tailwind: Use only spacing (p-, m-, gap-), sizing (w-, h-), layout (flex, grid), and structural classes
  - When styling is needed: Use neutral classes like border, rounded, shadow without color specifications
  - Default to unstyled elements: Let the browser defaults handle appearance unless layout/spacing is needed

- Use tailwind css classes whenever possible
- This is a static website using the static sveltekit adapter that will be hosted on github pages.
- TypeScript Support: Full type safety with proper API declarations
- Modern Svelte: Use Svelte 5 syntax with `$state` runes
- Responsive Design: Better styling that works on different screen sizes. You're free to use tailwind.
- Component Architecture: Reusable component that can be easily imported elsewhere. Feel free to create additional components and ensure the Page.svelte files stay reasonably small.

- When adding any user visable text, ensure it's lowercase

Application-specific notes:

- The main active app is the SvelteKit UI under `src/lib/components` and `src/routes`. The old `src/modules/*` files look legacy and should not be treated as the primary implementation unless the user explicitly asks about them.
- `SavedSection` includes an explicit `order` field in `src/lib/stores/audioPlayer.ts`. Preserve it on export/import and use it for display and drag/drop ordering.
- Legacy `.practice.json` files without `order` must remain supported. Import should backfill sequential order values.
- Saved sections are intentionally order-driven now, not start-time-driven.
- The saved sections list supports drag and drop reordering and displays section labels like `#1) verse`.
- The section editor title is `section editor`, and when editing an existing section it shows `editing #n` directly under the title.
- In the section editor:
  - when editing, show `cancel` and `updated section`
  - when not editing, show only `new section`
  - creating a new section does not require `loop end > loop start`
  - updating an existing section still validates that `loop end > loop start`
- Section name and note editing must not be gated on audio load state.
- Import/export of saved sections must not be gated on audio load state. Export should work with saved sections alone, even if no audio file is loaded.
- Loading an audio file should not clear `currentSectionName`, `currentNote`, `currentSectionId`, or `savedSections`.
- Remaining `isLoaded` gating inside `AudioPlayer.svelte` is intentional when it is strictly about actual audio playback or audio-only controls.
- The tuning section uses toggle buttons, not auto-stop timers. Clicking a note toggles it on/off, and active notes get an obvious light-blue pressed state.
