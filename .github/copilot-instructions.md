LLM Notes:

- do not run npm or node run commands, this repo uses bun.
- If you try to validate changes made to the sveltekit app and run `bun run dev` or `bun run preview` the terminal will hang because that's a held process. Don't run those commands, I already have the app running on 5173
- before running any commands confirm my permission one command at a time

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
