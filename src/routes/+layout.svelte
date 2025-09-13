<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.ico';
	import { linkClasses } from '$lib/cssUtils';
	import Footer from '$lib/components/Footer.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<header class="mx-8 my-4 flex flex-row items-center justify-between space-x-4 text-2xl">
	practice
	<a href="https://mitchinson.dev" class={linkClasses}>my work</a>
</header>

<hr class="border-theme mt-4 mb-4 w-full border-t" />

<div class="flex min-h-screen flex-col items-center justify-between">
	<main class="w-full flex-1">
		{@render children?.()}
	</main>
	<Footer />
</div>
