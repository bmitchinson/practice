<script lang="ts">
	import AudioPlayer from '$lib/components/AudioPlayer.svelte';
</script>

<svelte:head>
	<title>Audio Player</title>
	<meta name="description" content="Audio player application" />
</svelte:head>

<main class="min-h-screen py-8">
	<div class="container mx-auto px-4">
		<AudioPlayer />
	</div>
</main>
