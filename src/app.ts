// Main Application Module
import {
	state,
	initializeElements,
	setupPositionEventListeners,
	setupLoopEventListeners,
	setupAudioEventListeners
} from './modules/index.ts';

// Initialize the application
function init(): void {
	// Initialize DOM elements
	initializeElements();

	// Store audio element reference in state
	state.audioElement = document.getElementById('audio-element') as HTMLAudioElement;
	state.fileInput = document.getElementById('file-input') as HTMLInputElement;

	// Setup all event listeners
	setupAudioEventListeners();
	setupPositionEventListeners();
	setupLoopEventListeners();

	// Cleanup on page unload
	window.addEventListener('beforeunload', () => {
		if (state.audioUrl) {
			URL.revokeObjectURL(state.audioUrl);
		}
		if (state.animationFrameId) {
			cancelAnimationFrame(state.animationFrameId);
		}
	});
}

// Start the application when the DOM is loaded
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', init);
} else {
	init();
}
