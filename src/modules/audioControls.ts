// Audio Controls Module - Core audio playback functionality
import { state, updateState } from './state.ts';
import { elements, enableControls } from './elements.ts';
import { formatTime } from './utils.ts';
import { updatePositionFields } from './positionControls.ts';
import { checkLoop } from './loopControls.ts';

export function handleFileSelect(event: Event): void {
	const target = event.target as HTMLInputElement;
	const file = target.files?.[0];

	if (file && file.type.startsWith('audio/')) {
		updateState({ selectedFile: file });
		elements.selectedFileName.textContent = file.name;

		// Clean up previous URL
		if (state.audioUrl) {
			URL.revokeObjectURL(state.audioUrl);
		}

		// Create new object URL
		const audioUrl = URL.createObjectURL(file);
		updateState({
			audioUrl: audioUrl,
			isLoaded: false,
			isPlaying: false,
			currentTime: 0,
			duration: 0
		});

		// Set the audio source
		state.audioElement!.src = state.audioUrl!;
	} else {
		alert('Please select a valid audio file.');
	}
}

export function togglePlayPause(): void {
	if (!state.audioElement || !state.isLoaded) return;

	if (state.isPlaying) {
		state.audioElement.pause();
	} else {
		state.audioElement.play();
	}
}

export function selectFile(): void {
	elements.fileInput.click();
}

export function handlePlaybackRateChange(): void {
	const playbackRate = parseFloat(elements.playbackRate.value);
	updateState({ playbackRate });
	elements.playbackRateDisplay.textContent = `${playbackRate.toFixed(2)}x`;

	if (state.audioElement && state.isLoaded) {
		state.audioElement.playbackRate = state.playbackRate;
	}
}

export function updateTimestamps(): void {
	if (state.audioElement && elements.endTime) {
		const current = state.audioElement.currentTime;
		const total = state.audioElement.duration || 0;

		elements.endTime.textContent = `length: ${formatTime(total)}`;

		// Update progress bar and position fields
		updateState({ currentTime: current });
		updatePositionFields();

		// Update progress bar
		const progressPercent = state.duration > 0 ? (current / state.duration) * 100 : 0;
		elements.progressBar.style.width = `${progressPercent}%`;

		// Handle looping
		checkLoop();
	}

	if (state.isPlaying && state.audioElement && !state.audioElement.ended) {
		const animationFrameId = requestAnimationFrame(updateTimestamps);
		updateState({ animationFrameId });
	}
}

// Audio Event Handlers
export function handleLoadedMetadata(): void {
	updateState({
		duration: state.audioElement!.duration,
		isLoaded: true
	});

	state.audioElement!.preservesPitch = true;
	state.audioElement!.playbackRate = state.playbackRate;

	// Enable controls
	enableControls();

	// Update end time display
	elements.endTime.textContent = `length: ${formatTime(state.duration)}`;
}

export function handleTimeUpdate(): void {
	updateState({ currentTime: state.audioElement!.currentTime });
	updatePositionFields();

	// Update progress bar
	const progressPercent = state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0;
	elements.progressBar.style.width = `${progressPercent}%`;

	// Handle looping
	checkLoop();
}

export function handlePlay(): void {
	updateState({ isPlaying: true });
	elements.playPauseBtn.textContent = 'pause';
	updateTimestamps();
}

export function handlePause(): void {
	updateState({ isPlaying: false });
	elements.playPauseBtn.textContent = 'play';
	if (state.animationFrameId) {
		cancelAnimationFrame(state.animationFrameId);
		updateState({ animationFrameId: null });
	}
}

export function handleEnded(): void {
	updateState({
		isPlaying: false,
		currentTime: 0
	});
	elements.playPauseBtn.textContent = 'play';
	if (state.animationFrameId) {
		cancelAnimationFrame(state.animationFrameId);
		updateState({ animationFrameId: null });
	}
}

export function setupAudioEventListeners(): void {
	elements.fileInput.addEventListener('change', handleFileSelect);
	elements.selectFileBtn.addEventListener('click', selectFile);
	elements.playPauseBtn.addEventListener('click', togglePlayPause);
	elements.playbackRate.addEventListener('input', handlePlaybackRateChange);

	// Audio element event listeners
	elements.audioElement.addEventListener('loadedmetadata', handleLoadedMetadata);
	elements.audioElement.addEventListener('timeupdate', handleTimeUpdate);
	elements.audioElement.addEventListener('play', handlePlay);
	elements.audioElement.addEventListener('pause', handlePause);
	elements.audioElement.addEventListener('ended', handleEnded);
}
