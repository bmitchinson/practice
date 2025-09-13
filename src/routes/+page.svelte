<script lang="ts">
	import AudioPlayer from '$lib/components/AudioPlayer.svelte';
	import SectionNotes from '$lib/components/SectionNotes.svelte';
	import SavedSectionsList from '$lib/components/SavedSectionsList.svelte';
	import ExportImport from '$lib/components/ExportImport.svelte';

	let selectedFile: File | null = $state(null);
</script>

<svelte:head>
	<title>Audio Player</title>
	<meta name="description" content="Audio player application" />
</svelte:head>

<main class="min-h-screen overflow-x-hidden py-8">
	<div class="container mx-auto max-w-7xl px-4">
		<div class="grid grid-cols-1 gap-6 lg:grid-cols-4">
			<!-- Main Audio Player -->
			<div class="lg:col-span-2">
				<AudioPlayer bind:selectedFile />
			</div>

			<!-- Right Side Components -->
			<div class="space-y-6 lg:col-span-2">
				<!-- Section Notes Input -->
				<SectionNotes />

				<!-- Saved Sections List -->
				<SavedSectionsList />

				<!-- Export/Import -->
				<ExportImport />
			</div>
		</div>
	</div>

	<!-- Width Control Slider - Fixed position and width - Only show if file selected -->
	<!-- NOTE: Leaving this commented on purpose, might add back later if I add a waveform visualization --
	<!-- {#if selectedFile}
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
	{/if} -->
</main>
