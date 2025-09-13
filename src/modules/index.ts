// Modules Index - Centralized exports for cleaner imports
// Re-exports all public functions from audio player modules

export { state, updateState, resetState } from './state.ts';
export { formatTime, parseTimeInputs, validateTimeInputs, timeToComponents } from './utils.ts';
export { elements, initializeElements, enableControls, disableControls } from './elements.ts';
export {
	updatePositionFields,
	handlePositionChange,
	handlePositionInput,
	handlePositionFocus,
	handlePositionBlur,
	setupPositionEventListeners
} from './positionControls.ts';
export {
	handleLoopInput,
	getLoopTime,
	setLoopStart,
	setLoopEnd,
	handleLoopEnabledChange,
	checkLoop,
	setupLoopEventListeners
} from './loopControls.ts';
export {
	handleFileSelect,
	togglePlayPause,
	selectFile,
	handlePlaybackRateChange,
	updateTimestamps,
	handleLoadedMetadata,
	handleTimeUpdate,
	handlePlay,
	handlePause,
	handleEnded,
	setupAudioEventListeners
} from './audioControls.ts';
