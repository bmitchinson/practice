LLM Notes:

- do not run npm or node run commands, this repo uses bun.
- If you try to validate changes made to the sveltekit app and run `bun run dev` or `bun run preview` the terminal will hang because that's a held process. Don't run those commands, I already have the app running on 5173
- before running any commands confirm my permission one command at a time

Strive for the following:

- Introduce no asthetic (colors, fonts, etc) related css styles to the application at all unless explicitly instructed. Only css that is regards to basic should be utilized.
- Use tailwind css classes whenever possible
- This is a static website using the static sveltekit adapter that will be hosted on github pages.
- TypeScript Support: Full type safety with proper API declarations
- Modern Svelte: Use Svelte 5 syntax with `$state` runes
- Responsive Design: Better styling that works on different screen sizes. You're free to use tailwind.
- Component Architecture: Reusable component that can be easily imported elsewhere. Feel free to create additional components and ensure the Page.svelte files stay reasonably small.
