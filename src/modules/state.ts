// Audio Player State Management
interface AudioPlayerState {
	audioElement: HTMLAudioElement | null;
	fileInput: HTMLInputElement | null;
	selectedFile: File | null;
	audioUrl: string | null;
	isPlaying: boolean;
	currentTime: number;
	duration: number;
	isLoaded: boolean;
	animationFrameId: number | null;
	playbackRate: number;
	isEditingPosition: boolean;

	// Loop controls
	loopEnabled: boolean;
	loopStartMinutes: string;
	loopStartSeconds: string;
	loopStartMilliseconds: string;
	loopEndMinutes: string;
	loopEndSeconds: string;
	loopEndMilliseconds: string;

	// Position display
	positionMinutes: string;
	positionSeconds: string;
	positionMilliseconds: string;
}

export const state: AudioPlayerState = {
	audioElement: null,
	fileInput: null,
	selectedFile: null,
	audioUrl: null,
	isPlaying: false,
	currentTime: 0,
	duration: 0,
	isLoaded: false,
	animationFrameId: null,
	playbackRate: 1.0,
	isEditingPosition: false,

	// Loop controls
	loopEnabled: false,
	loopStartMinutes: '00',
	loopStartSeconds: '00',
	loopStartMilliseconds: '000',
	loopEndMinutes: '00',
	loopEndSeconds: '00',
	loopEndMilliseconds: '000',

	// Position display
	positionMinutes: '00',
	positionSeconds: '00',
	positionMilliseconds: '000'
};

export function updateState(updates: Partial<AudioPlayerState>): void {
	Object.assign(state, updates);
}

export function resetState(): void {
	state.selectedFile = null;
	state.audioUrl = null;
	state.isPlaying = false;
	state.currentTime = 0;
	state.duration = 0;
	state.isLoaded = false;
	state.animationFrameId = null;
	state.playbackRate = 1.0;
	state.isEditingPosition = false;
	state.loopEnabled = false;
	state.loopStartMinutes = '00';
	state.loopStartSeconds = '00';
	state.loopStartMilliseconds = '000';
	state.loopEndMinutes = '00';
	state.loopEndSeconds = '00';
	state.loopEndMilliseconds = '000';
	state.positionMinutes = '00';
	state.positionSeconds = '00';
	state.positionMilliseconds = '000';
}
