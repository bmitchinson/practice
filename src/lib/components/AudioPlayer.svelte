<script lang="ts">
	import { onMount } from 'svelte';

	let audioElement: HTMLAudioElement = $state(null!);
	let fileInput: HTMLInputElement;
	let { selectedFile = $bindable(null) }: { selectedFile?: File | null } = $props();
	let audioUrl: string | null = $state(null);
	let isPlaying: boolean = $state(false);
	let currentTime: number = $state(0);
	let duration: number = $state(0);
	let isLoaded: boolean = $state(false);
	let animationFrameId: number | null = null;
	let endTimeElement: HTMLElement;
	let positionMinutes: string = $state('00');
	let positionSeconds: string = $state('00');
	let positionMilliseconds: string = $state('000');
	let playbackRate: number = $state(1.0);

	function formatTime(seconds: number): string {
		if (isNaN(seconds) || seconds === 0) {
			return '00:00:000';
		}

		const minutes = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		const ms = Math.floor((seconds % 1) * 1000);

		return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${ms.toString().padStart(3, '0')}`;
	}

	function updatePositionFields() {
		const minutes = Math.floor(currentTime / 60);
		const secs = Math.floor(currentTime % 60);
		const ms = Math.floor((currentTime % 1) * 1000);

		positionMinutes = minutes.toString().padStart(2, '0');
		positionSeconds = secs.toString().padStart(2, '0');
		positionMilliseconds = ms.toString().padStart(3, '0');
	}

	function handlePositionChange() {
		if (!audioElement || !isLoaded) return;

		const minutes = parseInt(positionMinutes) || 0;
		const seconds = parseInt(positionSeconds) || 0;
		const ms = parseInt(positionMilliseconds) || 0;

		// Validate inputs
		if (seconds >= 60 || ms >= 1000) return;

		const totalSeconds = minutes * 60 + seconds + ms / 1000;

		// Don't allow seeking beyond duration
		if (totalSeconds > duration) return;

		audioElement.currentTime = totalSeconds;
	}

	function handlePositionInput(event: Event, field: 'minutes' | 'seconds' | 'milliseconds') {
		const target = event.target as HTMLInputElement;
		let value = target.value.replace(/\D/g, ''); // Only allow digits

		// Apply field-specific validation
		if (field === 'minutes') {
			positionMinutes = value.padStart(2, '0').slice(-2);
			positionSeconds = '00';
			positionMilliseconds = '000';
		} else if (field === 'seconds') {
			value = Math.min(parseInt(value) || 0, 59).toString();
			positionSeconds = value.padStart(2, '0');
			positionMilliseconds = '000';
		} else if (field === 'milliseconds') {
			value = Math.min(parseInt(value) || 0, 999).toString();
			positionMilliseconds = value.padStart(3, '0');
		}

		handlePositionChange();
	}

	function updateTimestamps() {
		if (audioElement && endTimeElement) {
			const current = audioElement.currentTime;
			const total = audioElement.duration || 0;

			endTimeElement.textContent = `End: ${formatTime(total)}`;

			// Update progress bar and position fields
			currentTime = current;
			updatePositionFields();
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
		audioElement.preservesPitch = true;
		audioElement.playbackRate = playbackRate;
	}

	function handleTimeUpdate() {
		currentTime = audioElement.currentTime;
		updatePositionFields();
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

	function handlePlaybackRateChange() {
		if (audioElement && isLoaded) {
			audioElement.playbackRate = playbackRate;
		}
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

<div class="audio-player border-theme mx-auto w-full rounded border p-6 text-center">
	<!-- File Input (Hidden) -->
	<input
		bind:this={fileInput}
		type="file"
		accept="audio/*"
		onchange={handleFileSelect}
		class="hidden"
	/>

	<!-- File Selection Button -->
	<div class="flex justify-center">
		<button onclick={selectFile} class="border-theme mb-4 rounded border px-4 py-2">
			Select Audio File
		</button>
	</div>

	<div class="border-theme mb-4 rounded border p-3 text-center">
		<p class="text-sm">Selected file:</p>
		<p class="truncate">{selectedFile?.name || '...'}</p>
	</div>

	{#if audioUrl}
		<audio
			bind:this={audioElement}
			src={audioUrl}
			onloadedmetadata={handleLoadedMetadata}
			ontimeupdate={handleTimeUpdate}
			onplay={handlePlay}
			onpause={handlePause}
			onended={handleEnded}
			class="hidden"
		>
			<track kind="captions" />
		</audio>
	{/if}

	<!-- Playback Controls -->
	<div class="mb-4 flex justify-center">
		<button
			onclick={togglePlayPause}
			class="border-theme rounded border px-6 py-2 disabled:opacity-50"
			disabled={!isLoaded}
		>
			{isPlaying ? 'Pause' : 'Play'}
		</button>
	</div>

	<!-- Playback Speed Control -->
	<div class="mb-4 flex justify-center">
		<div class="flex items-center gap-2">
			<label for="playback-rate" class="text-sm">Speed:</label>
			<input
				id="playback-rate"
				type="range"
				min="0.25"
				max="2"
				step="0.05"
				bind:value={playbackRate}
				oninput={handlePlaybackRateChange}
				class="flex-1"
				disabled={!isLoaded}
			/>
			<span class="w-12 font-mono text-sm">{playbackRate.toFixed(2)}x</span>
		</div>
	</div>

	<!-- Progress Bar -->
	<div class="mb-4 flex justify-center">
		<div class="border-theme h-2 w-full rounded-full border">
			<div
				class="h-2 rounded-full"
				style="width: {duration > 0
					? (currentTime / duration) * 100
					: 0}%; background: currentColor;"
			></div>
		</div>
	</div>

	<!-- Position Control -->
	<div class="mb-4 flex justify-center">
		<div class="flex items-center gap-2 font-mono text-sm">
			<span>Position:</span>
			<input
				type="text"
				bind:value={positionMinutes}
				oninput={(e) => handlePositionInput(e, 'minutes')}
				class="w-8 rounded border px-1 text-center"
				maxlength="2"
				disabled={!isLoaded}
			/>
			<span>:</span>
			<input
				type="text"
				bind:value={positionSeconds}
				oninput={(e) => handlePositionInput(e, 'seconds')}
				class="w-8 rounded border px-1 text-center"
				maxlength="2"
				disabled={!isLoaded}
			/>
			<span>:</span>
			<input
				type="text"
				bind:value={positionMilliseconds}
				oninput={(e) => handlePositionInput(e, 'milliseconds')}
				class="w-12 rounded border px-1 text-center"
				maxlength="3"
				disabled={!isLoaded}
			/>
		</div>
	</div>

	<!-- End Time Display -->
	<div class="flex justify-center font-mono text-sm">
		<span bind:this={endTimeElement}>End: {formatTime(duration)}</span>
	</div>
</div>
