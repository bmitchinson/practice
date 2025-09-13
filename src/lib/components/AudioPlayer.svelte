<script lang="ts">
	import { onMount } from 'svelte';
	import { audioPlayerStore, getLoopStartTime, getLoopEndTime } from '$lib/stores/audioPlayer';

	let audioElement: HTMLAudioElement = $state(null!);
	let fileInput: HTMLInputElement;
	let { selectedFile = $bindable(null) }: { selectedFile?: File | null } = $props();
	let animationFrameId: number | null = null;

	// Subscribe to store
	let audioState = $derived($audioPlayerStore);

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
		if (audioState.isEditingPosition) return;

		const minutes = Math.floor(audioState.currentTime / 60);
		const secs = Math.floor(audioState.currentTime % 60);
		const ms = Math.floor((audioState.currentTime % 1) * 1000);

		audioPlayerStore.update((state) => ({
			...state,
			positionMinutes: minutes.toString(),
			positionSeconds: secs.toString(),
			positionMilliseconds: ms.toString()
		}));
	}

	function handlePositionChange() {
		if (!audioElement || !audioState.isLoaded) return;

		const minutes = parseInt(audioState.positionMinutes) || 0;
		const seconds = parseInt(audioState.positionSeconds) || 0;
		const ms = parseInt(audioState.positionMilliseconds) || 0;

		// Validate inputs
		if (seconds >= 60 || ms >= 1000) return;

		const totalSeconds = minutes * 60 + seconds + ms / 1000;

		// Don't allow seeking beyond duration
		if (totalSeconds > audioState.duration) return;

		audioElement.currentTime = totalSeconds;
	}

	function handlePositionInput(event: Event, field: 'minutes' | 'seconds' | 'milliseconds') {
		const target = event.target as HTMLInputElement;
		const value = target.value;

		audioPlayerStore.update((state) => ({
			...state,
			[`position${field.charAt(0).toUpperCase() + field.slice(1)}`]: value
		}));

		handlePositionChange();
	}

	function handlePositionFocus() {
		audioPlayerStore.update((state) => ({
			...state,
			isEditingPosition: true
		}));
	}

	function handlePositionBlur() {
		audioPlayerStore.update((state) => ({
			...state,
			isEditingPosition: false
		}));
		updatePositionFields();
	}

	function handleLoopInput(
		event: Event,
		field: 'minutes' | 'seconds' | 'milliseconds',
		type: 'start' | 'end'
	) {
		const target = event.target as HTMLInputElement;
		const value = target.value;

		const fieldName = `loop${type.charAt(0).toUpperCase() + type.slice(1)}${field.charAt(0).toUpperCase() + field.slice(1)}`;

		audioPlayerStore.update((state) => ({
			...state,
			[fieldName]: value
		}));
	}

	function setLoopStart() {
		if (!audioElement || !audioState.isLoaded) return;

		const current = audioElement.currentTime;
		const minutes = Math.floor(current / 60);
		const secs = Math.floor(current % 60);
		const ms = Math.floor((current % 1) * 1000);

		audioPlayerStore.update((state) => ({
			...state,
			loopStartMinutes: minutes.toString(),
			loopStartSeconds: secs.toString(),
			loopStartMilliseconds: ms.toString()
		}));
	}

	function setLoopEnd() {
		if (!audioElement || !audioState.isLoaded) return;

		const current = audioElement.currentTime;
		const minutes = Math.floor(current / 60);
		const secs = Math.floor(current % 60);
		const ms = Math.floor((current % 1) * 1000);

		audioPlayerStore.update((state) => ({
			...state,
			loopEndMinutes: minutes.toString(),
			loopEndSeconds: secs.toString(),
			loopEndMilliseconds: ms.toString()
		}));
	}

	function updateTimestamps() {
		if (audioElement) {
			const current = audioElement.currentTime;

			// Update progress bar and position fields
			audioPlayerStore.update((state) => ({
				...state,
				currentTime: current
			}));
			updatePositionFields();

			// Handle looping
			if (audioState.loopEnabled && audioElement && audioState.isLoaded) {
				const loopEnd = getLoopEndTime(audioState);
				const loopStart = getLoopStartTime(audioState);

				if (loopEnd > 0 && current >= loopEnd) {
					audioElement.currentTime = loopStart;
				}
			}
		}

		if (audioState.isPlaying && audioElement && !audioElement.ended) {
			animationFrameId = requestAnimationFrame(updateTimestamps);
		}
	}

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];

		if (file && file.type.startsWith('audio/')) {
			selectedFile = file;

			// Clean up previous URL
			if (audioState.audioUrl) {
				URL.revokeObjectURL(audioState.audioUrl);
			}

			// Create new object URL and update store
			const audioUrl = URL.createObjectURL(file);
			audioPlayerStore.update((state) => ({
				...state,
				selectedFile: file,
				audioUrl,
				isLoaded: false,
				isPlaying: false,
				currentTime: 0,
				duration: 0
			}));
		} else {
			alert('Please select a valid audio file.');
		}
	}

	function togglePlayPause() {
		if (!audioElement || !audioState.isLoaded) return;

		if (audioState.isPlaying) {
			audioElement.pause();
		} else {
			audioElement.play();
		}
	}

	function handleLoadedMetadata() {
		audioPlayerStore.update((state) => ({
			...state,
			duration: audioElement.duration,
			isLoaded: true
		}));
		audioElement.preservesPitch = true;
		audioElement.playbackRate = audioState.playbackRate;
	}

	function handleTimeUpdate() {
		audioPlayerStore.update((state) => ({
			...state,
			currentTime: audioElement.currentTime
		}));
		updatePositionFields();

		// Handle looping
		if (audioState.loopEnabled && audioElement && audioState.isLoaded) {
			const loopEnd = getLoopEndTime(audioState);
			const loopStart = getLoopStartTime(audioState);

			if (loopEnd > 0 && audioState.currentTime >= loopEnd) {
				audioElement.currentTime = loopStart;
			}
		}
	}

	function handlePlay() {
		audioPlayerStore.update((state) => ({
			...state,
			isPlaying: true
		}));
		updateTimestamps();
	}

	function handlePause() {
		audioPlayerStore.update((state) => ({
			...state,
			isPlaying: false
		}));
		if (animationFrameId) {
			cancelAnimationFrame(animationFrameId);
			animationFrameId = null;
		}
	}

	function handleEnded() {
		audioPlayerStore.update((state) => ({
			...state,
			isPlaying: false,
			currentTime: 0
		}));
		if (animationFrameId) {
			cancelAnimationFrame(animationFrameId);
			animationFrameId = null;
		}
	}

	function selectFile() {
		fileInput.click();
	}

	function handlePlaybackRateChange() {
		if (audioElement && audioState.isLoaded) {
			audioElement.playbackRate = audioState.playbackRate;
		}
	}

	function updatePlaybackRate(event: Event) {
		const target = event.target as HTMLInputElement;
		const rate = parseFloat(target.value);

		audioPlayerStore.update((state) => ({
			...state,
			playbackRate: rate
		}));

		handlePlaybackRateChange();
	}

	function updateLoopEnabled(event: Event) {
		const target = event.target as HTMLInputElement;

		audioPlayerStore.update((state) => ({
			...state,
			loopEnabled: target.checked
		}));
	}

	onMount(() => {
		return () => {
			// Clean up object URL and animation frame on component destroy
			if (audioState.audioUrl) {
				URL.revokeObjectURL(audioState.audioUrl);
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
			select audio file
		</button>
	</div>

	<div class="border-theme mb-4 flex flex-col items-center rounded border p-3 text-center">
		<p class="text-sm">selected file:</p>
		<p class="max-w-[15em] truncate">{selectedFile?.name || '...'}</p>
	</div>

	<!-- End Time Display -->
	<div class="mb-4 flex justify-center text-sm">
		<span>length: {formatTime(audioState.duration)}</span>
	</div>

	{#if audioState.audioUrl}
		<audio
			bind:this={audioElement}
			src={audioState.audioUrl}
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
			disabled={!audioState.isLoaded}
		>
			{audioState.isPlaying ? 'pause' : 'play'}
		</button>
	</div>

	<!-- Playback Speed Control -->
	<div class="mb-4 flex justify-center">
		<div class="flex items-center gap-2">
			<label for="playback-rate" class="text-sm">speed:</label>
			<input
				id="playback-rate"
				type="range"
				min="0.25"
				max="2"
				step="0.05"
				value={audioState.playbackRate}
				oninput={updatePlaybackRate}
				class="flex-1"
				disabled={!audioState.isLoaded}
			/>
			<span class="w-12 text-sm">{audioState.playbackRate.toFixed(2)}x</span>
		</div>
	</div>

	<!-- Progress Bar -->
	<div class="mb-4 flex justify-center">
		<div class="border-theme h-2 w-full rounded-full border">
			<div
				class="h-2 rounded-full"
				style="width: {audioState.duration > 0
					? (audioState.currentTime / audioState.duration) * 100
					: 0}%; background: currentColor;"
			></div>
		</div>
	</div>

	<!-- Position Control -->
	<div class="mb-4 flex justify-center">
		<div class="flex items-center gap-2 text-sm">
			<span>position:</span>
			<input
				type="text"
				value={audioState.positionMinutes}
				oninput={(e) => handlePositionInput(e, 'minutes')}
				onfocus={handlePositionFocus}
				onblur={handlePositionBlur}
				class="w-8 rounded border px-1 text-center"
				disabled={!audioState.isLoaded}
			/>
			<span>:</span>
			<input
				type="text"
				value={audioState.positionSeconds}
				oninput={(e) => handlePositionInput(e, 'seconds')}
				onfocus={handlePositionFocus}
				onblur={handlePositionBlur}
				class="w-8 rounded border px-1 text-center"
				disabled={!audioState.isLoaded}
			/>
			<span>:</span>
			<input
				type="text"
				value={audioState.positionMilliseconds}
				oninput={(e) => handlePositionInput(e, 'milliseconds')}
				onfocus={handlePositionFocus}
				onblur={handlePositionBlur}
				class="w-12 rounded border px-1 text-center"
				disabled={!audioState.isLoaded}
			/>
		</div>
	</div>

	<!-- Separator -->
	<hr class="my-4" />

	<!-- Loop Start Control -->
	<div class="mb-4 flex justify-end">
		<div class="flex items-center gap-2 text-sm">
			<span>loop start:</span>
			<input
				type="text"
				value={audioState.loopStartMinutes}
				oninput={(e) => handleLoopInput(e, 'minutes', 'start')}
				class="w-8 rounded border px-1 text-center"
				maxlength="2"
				disabled={!audioState.isLoaded}
			/>
			<span>:</span>
			<input
				type="text"
				value={audioState.loopStartSeconds}
				oninput={(e) => handleLoopInput(e, 'seconds', 'start')}
				class="w-8 rounded border px-1 text-center"
				maxlength="2"
				disabled={!audioState.isLoaded}
			/>
			<span>:</span>
			<input
				type="text"
				value={audioState.loopStartMilliseconds}
				oninput={(e) => handleLoopInput(e, 'milliseconds', 'start')}
				class="w-12 rounded border px-1 text-center"
				maxlength="3"
				disabled={!audioState.isLoaded}
			/>
			<button
				onclick={setLoopStart}
				class="ml-2 rounded border px-2 py-1 text-xs disabled:opacity-50"
				disabled={!audioState.isLoaded}
			>
				set
			</button>
		</div>
	</div>

	<!-- Loop End Control -->
	<div class="mb-4 flex justify-end">
		<div class="flex items-center gap-2 text-sm">
			<span>loop end:</span>
			<input
				type="text"
				value={audioState.loopEndMinutes}
				oninput={(e) => handleLoopInput(e, 'minutes', 'end')}
				class="w-8 rounded border px-1 text-center"
				maxlength="2"
				disabled={!audioState.isLoaded}
			/>
			<span>:</span>
			<input
				type="text"
				value={audioState.loopEndSeconds}
				oninput={(e) => handleLoopInput(e, 'seconds', 'end')}
				class="w-8 rounded border px-1 text-center"
				maxlength="2"
				disabled={!audioState.isLoaded}
			/>
			<span>:</span>
			<input
				type="text"
				value={audioState.loopEndMilliseconds}
				oninput={(e) => handleLoopInput(e, 'milliseconds', 'end')}
				class="w-12 rounded border px-1 text-center"
				maxlength="3"
				disabled={!audioState.isLoaded}
			/>
			<button
				onclick={setLoopEnd}
				class="ml-2 rounded border px-2 py-1 text-xs disabled:opacity-50"
				disabled={!audioState.isLoaded}
			>
				set
			</button>
		</div>
	</div>

	<!-- Loop Controls -->
	<div class="mr-3 flex justify-end">
		<div class="flex items-center gap-2">
			<label for="loop-enabled" class="text-sm">enable loop</label>
			<input
				type="checkbox"
				id="loop-enabled"
				checked={audioState.loopEnabled}
				onchange={updateLoopEnabled}
				disabled={!audioState.isLoaded}
			/>
		</div>
	</div>
</div>
