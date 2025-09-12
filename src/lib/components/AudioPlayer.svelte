<script lang="ts">
	import { onMount } from 'svelte';

	let audioElement: HTMLAudioElement;
	let fileInput: HTMLInputElement;
	let selectedFile: File | null = $state(null);
	let audioUrl: string | null = $state(null);
	let isPlaying: boolean = $state(false);
	let currentTime: number = $state(0);
	let duration: number = $state(0);
	let isLoaded: boolean = $state(false);
	let animationFrameId: number | null = null;
	let startTimeElement: HTMLElement;
	let endTimeElement: HTMLElement;

	function formatTime(seconds: number): string {
		if (isNaN(seconds) || seconds === 0) {
			return '00:00:000';
		}

		const minutes = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		const ms = Math.floor((seconds % 1) * 1000);

		return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${ms.toString().padStart(3, '0')}`;
	}

	function updateTimestamps() {
		if (audioElement && startTimeElement && endTimeElement) {
			const current = audioElement.currentTime;
			const total = audioElement.duration || 0;

			startTimeElement.textContent = `Start: ${formatTime(current)}`;
			endTimeElement.textContent = `End: ${formatTime(total)}`;

			// Update progress bar
			currentTime = current;
		}

		if (isPlaying && audioElement && !audioElement.ended) {
			animationFrameId = requestAnimationFrame(updateTimestamps);
		}
	}

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];

		if (file && file.type.startsWith('audio/')) {
			selectedFile = file;

			// Clean up previous URL
			if (audioUrl) {
				URL.revokeObjectURL(audioUrl);
			}

			// Create new object URL
			audioUrl = URL.createObjectURL(file);
			isLoaded = false;
			isPlaying = false;
			currentTime = 0;
			duration = 0;
		} else {
			alert('Please select a valid audio file.');
		}
	}

	function togglePlayPause() {
		if (!audioElement || !isLoaded) return;

		if (isPlaying) {
			audioElement.pause();
		} else {
			audioElement.play();
		}
	}

	function handleLoadedMetadata() {
		duration = audioElement.duration;
		isLoaded = true;
	}

	function handleTimeUpdate() {
		currentTime = audioElement.currentTime;
	}

	function handlePlay() {
		isPlaying = true;
		updateTimestamps();
	}

	function handlePause() {
		isPlaying = false;
		if (animationFrameId) {
			cancelAnimationFrame(animationFrameId);
			animationFrameId = null;
		}
	}

	function handleEnded() {
		isPlaying = false;
		currentTime = 0;
		if (animationFrameId) {
			cancelAnimationFrame(animationFrameId);
			animationFrameId = null;
		}
	}

	function selectFile() {
		fileInput.click();
	}

	onMount(() => {
		return () => {
			// Clean up object URL and animation frame on component destroy
			if (audioUrl) {
				URL.revokeObjectURL(audioUrl);
			}
			if (animationFrameId) {
				cancelAnimationFrame(animationFrameId);
			}
		};
	});
</script>

<div class="audio-player mx-auto w-full max-w-md rounded border p-6">
	<!-- File Input (Hidden) -->
	<input
		bind:this={fileInput}
		type="file"
		accept="audio/*"
		on:change={handleFileSelect}
		class="hidden"
	/>

	<!-- File Selection Button -->
	<button on:click={selectFile} class="mb-4 w-full rounded border px-4 py-2">
		Select Audio File
	</button>

	<!-- Selected File Info -->
	{#if selectedFile}
		<div class="mb-4 rounded border p-3">
			<p class="text-sm">Selected file:</p>
			<p class="truncate">{selectedFile.name}</p>
		</div>
	{/if}

	<!-- Audio Element -->
	{#if audioUrl}
		<audio
			bind:this={audioElement}
			src={audioUrl}
			on:loadedmetadata={handleLoadedMetadata}
			on:timeupdate={handleTimeUpdate}
			on:play={handlePlay}
			on:pause={handlePause}
			on:ended={handleEnded}
			class="hidden"
		>
			<track kind="captions" />
		</audio>
	{/if}

	<!-- Playback Controls -->
	{#if isLoaded}
		<div class="mb-4">
			<button
				on:click={togglePlayPause}
				class="rounded border px-6 py-2 disabled:opacity-50"
				disabled={!isLoaded}
			>
				{isPlaying ? 'Pause' : 'Play'}
			</button>
		</div>

		<!-- Progress Bar -->
		<div class="mb-4">
			<div class="h-2 w-full rounded-full border">
				<div
					class="h-2 rounded-full"
					style="width: {duration > 0
						? (currentTime / duration) * 100
						: 0}%; background: currentColor;"
				></div>
			</div>
		</div>

		<!-- Timestamp Display -->
		<div class="flex flex-col justify-between font-mono text-sm">
			<span bind:this={startTimeElement}>Start: {formatTime(currentTime)}</span>
			<span bind:this={endTimeElement}>End: {formatTime(duration)}</span>
		</div>
	{:else if selectedFile}
		<div class="py-4 text-center">Loading audio file...</div>
	{:else}
		<div class="py-8 text-center">Select an audio file to begin</div>
	{/if}
</div>
