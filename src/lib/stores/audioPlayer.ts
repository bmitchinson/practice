import { writable } from 'svelte/store';

export interface SavedSection {
	id: string;
	order: number;
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
	exportTitle: string;
	currentSectionName: string;
	currentNote: string;
	currentSectionId: string | null;
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

	exportTitle: 'song',
	currentSectionName: '',
	currentNote: '',
	currentSectionId: null,
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

export function normalizeSavedSections(sections: SavedSection[]): SavedSection[] {
	return [...sections]
		.sort((a, b) => {
			const orderA = typeof a.order === 'number' ? a.order : Number.MAX_SAFE_INTEGER;
			const orderB = typeof b.order === 'number' ? b.order : Number.MAX_SAFE_INTEGER;

			if (orderA !== orderB) return orderA - orderB;
			if (a.startTime !== b.startTime) return a.startTime - b.startTime;
			return a.createdAt.getTime() - b.createdAt.getTime();
		})
		.map((section, index) => ({
			...section,
			order: index + 1
		}));
}

export function reorderSavedSections(
	sections: SavedSection[],
	fromSectionId: string,
	toSectionId: string
): SavedSection[] {
	const orderedSections = normalizeSavedSections(sections);
	const fromIndex = orderedSections.findIndex((section) => section.id === fromSectionId);
	const toIndex = orderedSections.findIndex((section) => section.id === toSectionId);

	if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
		return orderedSections;
	}

	const nextSections = [...orderedSections];
	const [movedSection] = nextSections.splice(fromIndex, 1);
	nextSections.splice(toIndex, 0, movedSection);

	return nextSections.map((section, index) => ({
		...section,
		order: index + 1
	}));
}

export function saveSection(
	sectionName: string,
	note: string,
	startTime: number,
	endTime: number
): void {
	audioPlayerStore.update((state) => {
		const newSection: SavedSection = {
			id: crypto.randomUUID(),
			order: state.savedSections.length + 1,
			name: sectionName || `section ${state.savedSections.length + 1}`,
			note,
			startTime,
			endTime,
			createdAt: new Date()
		};

		const updatedSections = normalizeSavedSections([...state.savedSections, newSection]);

		return {
			...state,
			savedSections: updatedSections,
			currentSectionName: '',
			currentNote: ''
		};
	});
}

export function loadSection(section: SavedSection): void {
	audioPlayerStore.update((state) => {
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
			loopEndMilliseconds: endMs.toString(),
			currentSectionName: section.name,
			currentNote: section.note,
			currentSectionId: section.id
		};
	});
}

export function updateSection(
	sectionId: string,
	sectionName: string,
	note: string,
	startTime: number,
	endTime: number
): void {
	audioPlayerStore.update((state) => {
		const updatedSections = normalizeSavedSections(
			state.savedSections.map((section) => {
				if (section.id === sectionId) {
					return {
						...section,
						name: sectionName || `section ${state.savedSections.length + 1}`,
						note,
						startTime,
						endTime
					};
				}
				return section;
			})
		);

		return {
			...state,
			savedSections: updatedSections,
			currentSectionName: '',
			currentNote: '',
			currentSectionId: null
		};
	});
}
