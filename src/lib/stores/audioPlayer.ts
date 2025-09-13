import { writable } from 'svelte/store';

export interface SavedSection {
	id: string;
	name: string;
	note: string;
	startTime: number;
	endTime: number;
	createdAt: Date;
}

export interface AudioPlayerState {
	// Audio file state
	selectedFile: File | null;
	audioUrl: string | null;
	isLoaded: boolean;

	// Playback state
	isPlaying: boolean;
	currentTime: number;
	duration: number;
	playbackRate: number;

	// Position state
	positionMinutes: string;
	positionSeconds: string;
	positionMilliseconds: string;
	isEditingPosition: boolean;

	// Loop state
	loopEnabled: boolean;
	loopStartMinutes: string;
	loopStartSeconds: string;
	loopStartMilliseconds: string;
	loopEndMinutes: string;
	loopEndSeconds: string;
	loopEndMilliseconds: string;

	// Notes and sections
	currentSectionName: string;
	currentNote: string;
	savedSections: SavedSection[];
}

const initialState: AudioPlayerState = {
	selectedFile: null,
	audioUrl: null,
	isLoaded: false,

	isPlaying: false,
	currentTime: 0,
	duration: 0,
	playbackRate: 1.0,

	positionMinutes: '00',
	positionSeconds: '00',
	positionMilliseconds: '000',
	isEditingPosition: false,

	loopEnabled: false,
	loopStartMinutes: '00',
	loopStartSeconds: '00',
	loopStartMilliseconds: '000',
	loopEndMinutes: '00',
	loopEndSeconds: '00',
	loopEndMilliseconds: '000',

	currentSectionName: '',
	currentNote: '',
	savedSections: []
};

export const audioPlayerStore = writable<AudioPlayerState>(initialState);

// Helper functions
export function getLoopStartTime(state: AudioPlayerState): number {
	const minutes = parseInt(state.loopStartMinutes) || 0;
	const seconds = parseInt(state.loopStartSeconds) || 0;
	const ms = parseInt(state.loopStartMilliseconds) || 0;
	return minutes * 60 + seconds + ms / 1000;
}

export function getLoopEndTime(state: AudioPlayerState): number {
	const minutes = parseInt(state.loopEndMinutes) || 0;
	const seconds = parseInt(state.loopEndSeconds) || 0;
	const ms = parseInt(state.loopEndMilliseconds) || 0;
	return minutes * 60 + seconds + ms / 1000;
}

export function saveSection(sectionName: string, note: string, startTime: number, endTime: number): void {
	audioPlayerStore.update(state => {
		const newSection: SavedSection = {
			id: crypto.randomUUID(),
			name: sectionName || `Section ${state.savedSections.length + 1}`,
			note,
			startTime,
			endTime,
			createdAt: new Date()
		};

		const updatedSections = [...state.savedSections, newSection]
			.sort((a, b) => a.startTime - b.startTime);

		return {
			...state,
			savedSections: updatedSections,
			currentSectionName: '',
			currentNote: ''
		};
	});
}

export function loadSection(section: SavedSection): void {
	audioPlayerStore.update(state => {
		const startMinutes = Math.floor(section.startTime / 60);
		const startSecs = Math.floor(section.startTime % 60);
		const startMs = Math.floor((section.startTime % 1) * 1000);

		const endMinutes = Math.floor(section.endTime / 60);
		const endSecs = Math.floor(section.endTime % 60);
		const endMs = Math.floor((section.endTime % 1) * 1000);

		return {
			...state,
			loopStartMinutes: startMinutes.toString(),
			loopStartSeconds: startSecs.toString(),
			loopStartMilliseconds: startMs.toString(),
			loopEndMinutes: endMinutes.toString(),
			loopEndSeconds: endSecs.toString(),
			loopEndMilliseconds: endMs.toString()
		};
	});
}
