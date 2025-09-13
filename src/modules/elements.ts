// DOM Elements Management

interface AudioPlayerElements {
	fileInput: HTMLInputElement;
	selectFileBtn: HTMLButtonElement;
	selectedFileName: HTMLElement;
	audioElement: HTMLAudioElement;
	endTime: HTMLElement;
	playPauseBtn: HTMLButtonElement;
	playbackRate: HTMLInputElement;
	playbackRateDisplay: HTMLElement;
	progressBar: HTMLElement;
	positionMinutes: HTMLInputElement;
	positionSeconds: HTMLInputElement;
	positionMilliseconds: HTMLInputElement;
	loopStartMinutes: HTMLInputElement;
	loopStartSeconds: HTMLInputElement;
	loopStartMilliseconds: HTMLInputElement;
	loopEndMinutes: HTMLInputElement;
	loopEndSeconds: HTMLInputElement;
	loopEndMilliseconds: HTMLInputElement;
	setLoopStartBtn: HTMLButtonElement;
	setLoopEndBtn: HTMLButtonElement;
	loopEnabled: HTMLInputElement;
}

export let elements: AudioPlayerElements = {} as AudioPlayerElements;

export function initializeElements(): void {
	elements = {
		fileInput: document.getElementById('file-input') as HTMLInputElement,
		selectFileBtn: document.getElementById('select-file-btn') as HTMLButtonElement,
		selectedFileName: document.getElementById('selected-file-name') as HTMLElement,
		audioElement: document.getElementById('audio-element') as HTMLAudioElement,
		endTime: document.getElementById('end-time') as HTMLElement,
		playPauseBtn: document.getElementById('play-pause-btn') as HTMLButtonElement,
		playbackRate: document.getElementById('playback-rate') as HTMLInputElement,
		playbackRateDisplay: document.getElementById('playback-rate-display') as HTMLElement,
		progressBar: document.getElementById('progress-bar') as HTMLElement,
		positionMinutes: document.getElementById('position-minutes') as HTMLInputElement,
		positionSeconds: document.getElementById('position-seconds') as HTMLInputElement,
		positionMilliseconds: document.getElementById('position-milliseconds') as HTMLInputElement,
		loopStartMinutes: document.getElementById('loop-start-minutes') as HTMLInputElement,
		loopStartSeconds: document.getElementById('loop-start-seconds') as HTMLInputElement,
		loopStartMilliseconds: document.getElementById('loop-start-milliseconds') as HTMLInputElement,
		loopEndMinutes: document.getElementById('loop-end-minutes') as HTMLInputElement,
		loopEndSeconds: document.getElementById('loop-end-seconds') as HTMLInputElement,
		loopEndMilliseconds: document.getElementById('loop-end-milliseconds') as HTMLInputElement,
		setLoopStartBtn: document.getElementById('set-loop-start-btn') as HTMLButtonElement,
		setLoopEndBtn: document.getElementById('set-loop-end-btn') as HTMLButtonElement,
		loopEnabled: document.getElementById('loop-enabled') as HTMLInputElement
	};
}

export function enableControls(): void {
	elements.playPauseBtn.disabled = false;
	elements.playbackRate.disabled = false;
	elements.positionMinutes.disabled = false;
	elements.positionSeconds.disabled = false;
	elements.positionMilliseconds.disabled = false;
	elements.loopStartMinutes.disabled = false;
	elements.loopStartSeconds.disabled = false;
	elements.loopStartMilliseconds.disabled = false;
	elements.loopEndMinutes.disabled = false;
	elements.loopEndSeconds.disabled = false;
	elements.loopEndMilliseconds.disabled = false;
	elements.setLoopStartBtn.disabled = false;
	elements.setLoopEndBtn.disabled = false;
	elements.loopEnabled.disabled = false;
}

export function disableControls(): void {
	elements.playPauseBtn.disabled = true;
	elements.playbackRate.disabled = true;
	elements.positionMinutes.disabled = true;
	elements.positionSeconds.disabled = true;
	elements.positionMilliseconds.disabled = true;
	elements.loopStartMinutes.disabled = true;
	elements.loopStartSeconds.disabled = true;
	elements.loopStartMilliseconds.disabled = true;
	elements.loopEndMinutes.disabled = true;
	elements.loopEndSeconds.disabled = true;
	elements.loopEndMilliseconds.disabled = true;
	elements.setLoopStartBtn.disabled = true;
	elements.setLoopEndBtn.disabled = true;
	elements.loopEnabled.disabled = true;
}
