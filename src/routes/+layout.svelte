<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { linkClasses } from '$lib/cssUtils';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<header class="mx-8 my-4 flex flex-row items-center justify-between space-x-4 text-2xl">
	practice
	<a href="https://mitchinson.dev" class={linkClasses}>my work</a>
</header>

<hr class="mt-4 mb-4 w-full border-t border-gray-300" />

<div class="flex flex-col items-center justify-between">
	{@render children?.()}
</div>
