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
	let isEditingPosition: boolean = $state(false);

	// Loop controls
	let loopEnabled: boolean = $state(false);
	let loopStartMinutes: string = $state('00');
	let loopStartSeconds: string = $state('00');
	let loopStartMilliseconds: string = $state('000');
	let loopEndMinutes: string = $state('00');
	let loopEndSeconds: string = $state('00');
	let loopEndMilliseconds: string = $state('000');

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
		if (isEditingPosition) return;

		const minutes = Math.floor(currentTime / 60);
		const secs = Math.floor(currentTime % 60);
		const ms = Math.floor((currentTime % 1) * 1000);

		positionMinutes = minutes.toString();
		positionSeconds = secs.toString();
		positionMilliseconds = ms.toString();
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
		const value = target.value;

		// Update the specific field without any validation or manipulation
		if (field === 'minutes') {
			positionMinutes = value;
		} else if (field === 'seconds') {
			positionSeconds = value;
		} else if (field === 'milliseconds') {
			positionMilliseconds = value;
		}

		handlePositionChange();
	}

	function handlePositionFocus() {
		isEditingPosition = true;
	}

	function handlePositionBlur() {
		isEditingPosition = false;
		updatePositionFields();
	}

	function handleLoopInput(
		event: Event,
		field: 'minutes' | 'seconds' | 'milliseconds',
		type: 'start' | 'end'
	) {
		const target = event.target as HTMLInputElement;
		const value = target.value;

		// Update the specific field without any validation or manipulation
		if (field === 'minutes') {
			if (type === 'start') {
				loopStartMinutes = value;
			} else {
				loopEndMinutes = value;
			}
		} else if (field === 'seconds') {
			if (type === 'start') {
				loopStartSeconds = value;
			} else {
				loopEndSeconds = value;
			}
		} else if (field === 'milliseconds') {
			if (type === 'start') {
				loopStartMilliseconds = value;
			} else {
				loopEndMilliseconds = value;
			}
		}
	}

	function getLoopTime(type: 'start' | 'end'): number {
		if (type === 'start') {
			const minutes = parseInt(loopStartMinutes) || 0;
			const seconds = parseInt(loopStartSeconds) || 0;
			const ms = parseInt(loopStartMilliseconds) || 0;
			return minutes * 60 + seconds + ms / 1000;
		} else {
			const minutes = parseInt(loopEndMinutes) || 0;
			const seconds = parseInt(loopEndSeconds) || 0;
			const ms = parseInt(loopEndMilliseconds) || 0;
			return minutes * 60 + seconds + ms / 1000;
		}
	}

	function setLoopStart() {
		if (!audioElement || !isLoaded) return;

		const current = audioElement.currentTime;
		const minutes = Math.floor(current / 60);
		const secs = Math.floor(current % 60);
		const ms = Math.floor((current % 1) * 1000);

		loopStartMinutes = minutes.toString();
		loopStartSeconds = secs.toString();
		loopStartMilliseconds = ms.toString();
	}

	function setLoopEnd() {
		if (!audioElement || !isLoaded) return;

		const current = audioElement.currentTime;
		const minutes = Math.floor(current / 60);
		const secs = Math.floor(current % 60);
		const ms = Math.floor((current % 1) * 1000);

		loopEndMinutes = minutes.toString();
		loopEndSeconds = secs.toString();
		loopEndMilliseconds = ms.toString();
	}

	function updateTimestamps() {
		if (audioElement && endTimeElement) {
			const current = audioElement.currentTime;
			const total = audioElement.duration || 0;

			endTimeElement.textContent = `End: ${formatTime(total)}`;

			// Update progress bar and position fields
			currentTime = current;
			updatePositionFields();

			// Handle looping
			if (loopEnabled && audioElement && isLoaded) {
				const loopEnd = getLoopTime('end');
				const loopStart = getLoopTime('start');

				if (loopEnd > 0 && current >= loopEnd) {
					audioElement.currentTime = loopStart;
				}
			}
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

		// Handle looping
		if (loopEnabled && audioElement && isLoaded) {
			const loopEnd = getLoopTime('end');
			const loopStart = getLoopTime('start');

			if (loopEnd > 0 && currentTime >= loopEnd) {
				audioElement.currentTime = loopStart;
			}
		}
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
			select audio file
		</button>
	</div>

	<div class="border-theme mb-4 rounded border p-3 text-center">
		<p class="text-sm">selected file:</p>
		<p class="truncate">{selectedFile?.name || '...'}</p>
	</div>

	<!-- End Time Display -->
	<div class="mb-4 flex justify-center font-mono text-sm">
		<span bind:this={endTimeElement}>length: {formatTime(duration)}</span>
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
			{isPlaying ? 'pause' : 'play'}
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
			<span>position:</span>
			<input
				type="text"
				bind:value={positionMinutes}
				oninput={(e) => handlePositionInput(e, 'minutes')}
				onfocus={handlePositionFocus}
				onblur={handlePositionBlur}
				class="w-8 rounded border px-1 text-center"
				disabled={!isLoaded}
			/>
			<span>:</span>
			<input
				type="text"
				bind:value={positionSeconds}
				oninput={(e) => handlePositionInput(e, 'seconds')}
				onfocus={handlePositionFocus}
				onblur={handlePositionBlur}
				class="w-8 rounded border px-1 text-center"
				disabled={!isLoaded}
			/>
			<span>:</span>
			<input
				type="text"
				bind:value={positionMilliseconds}
				oninput={(e) => handlePositionInput(e, 'milliseconds')}
				onfocus={handlePositionFocus}
				onblur={handlePositionBlur}
				class="w-12 rounded border px-1 text-center"
				disabled={!isLoaded}
			/>
		</div>
	</div>

	<!-- Separator -->
	<hr class="my-4" />

	<!-- Loop Start Control -->
	<div class="mb-4 flex justify-end">
		<div class="flex items-center gap-2 font-mono text-sm">
			<span>loop start:</span>
			<input
				type="text"
				bind:value={loopStartMinutes}
				oninput={(e) => handleLoopInput(e, 'minutes', 'start')}
				class="w-8 rounded border px-1 text-center"
				maxlength="2"
				disabled={!isLoaded}
			/>
			<span>:</span>
			<input
				type="text"
				bind:value={loopStartSeconds}
				oninput={(e) => handleLoopInput(e, 'seconds', 'start')}
				class="w-8 rounded border px-1 text-center"
				maxlength="2"
				disabled={!isLoaded}
			/>
			<span>:</span>
			<input
				type="text"
				bind:value={loopStartMilliseconds}
				oninput={(e) => handleLoopInput(e, 'milliseconds', 'start')}
				class="w-12 rounded border px-1 text-center"
				maxlength="3"
				disabled={!isLoaded}
			/>
			<button
				onclick={setLoopStart}
				class="ml-2 rounded border px-2 py-1 text-xs disabled:opacity-50"
				disabled={!isLoaded}
			>
				Set
			</button>
		</div>
	</div>

	<!-- Loop End Control -->
	<div class="mb-4 flex justify-end">
		<div class="flex items-center gap-2 font-mono text-sm">
			<span>loop end:</span>
			<input
				type="text"
				bind:value={loopEndMinutes}
				oninput={(e) => handleLoopInput(e, 'minutes', 'end')}
				class="w-8 rounded border px-1 text-center"
				maxlength="2"
				disabled={!isLoaded}
			/>
			<span>:</span>
			<input
				type="text"
				bind:value={loopEndSeconds}
				oninput={(e) => handleLoopInput(e, 'seconds', 'end')}
				class="w-8 rounded border px-1 text-center"
				maxlength="2"
				disabled={!isLoaded}
			/>
			<span>:</span>
			<input
				type="text"
				bind:value={loopEndMilliseconds}
				oninput={(e) => handleLoopInput(e, 'milliseconds', 'end')}
				class="w-12 rounded border px-1 text-center"
				maxlength="3"
				disabled={!isLoaded}
			/>
			<button
				onclick={setLoopEnd}
				class="ml-2 rounded border px-2 py-1 text-xs disabled:opacity-50"
				disabled={!isLoaded}
			>
				Set
			</button>
		</div>
	</div>

	<!-- Loop Controls -->
	<div class="mr-3 flex justify-end">
		<div class="flex items-center gap-2">
			<label for="loop-enabled" class="text-sm">enable loop</label>
			<input type="checkbox" id="loop-enabled" bind:checked={loopEnabled} disabled={!isLoaded} />
		</div>
	</div>
</div>
