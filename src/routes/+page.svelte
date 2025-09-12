<script lang="ts">
	import AudioPlayer from '$lib/components/AudioPlayer.svelte';

	let selectedFile: File | null = $state(null);
	let playerWidth = $state(25); // Default width in em
	const minWidth = 25;
	const maxWidth = 400;
</script>

<svelte:head>
	<title>Audio Player</title>
	<meta name="description" content="Audio player application" />
</svelte:head>

<main class="min-h-screen py-8">
	<!-- AudioPlayer with dynamic width and centering -->
	<div class="flex justify-center overflow-hidden">
		<div style="width: {playerWidth}em;">
			<AudioPlayer bind:selectedFile />
		</div>
	</div>

	<!-- Width Control Slider - Fixed position and width - Only show if file selected -->
	{#if selectedFile}
		<div class="mx-auto mt-8 w-80 px-4">
			<label for="width-slider" class="mb-2 block text-sm"> Zoom Level </label>
			<input
				id="width-slider"
				type="range"
				min={minWidth}
				max={maxWidth}
				bind:value={playerWidth}
				class="h-2 w-full cursor-pointer rounded-lg border"
			/>
		</div>
	{/if}
</main>
