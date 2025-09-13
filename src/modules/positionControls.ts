// Position Controls Module
import { state, updateState } from './state.ts';
import { elements } from './elements.ts';
import { parseTimeInputs, validateTimeInputs, timeToComponents } from './utils.ts';

export function updatePositionFields(): void {
	if (state.isEditingPosition) return;

	const { minutes, seconds, milliseconds } = timeToComponents(state.currentTime);

	updateState({
		positionMinutes: minutes,
		positionSeconds: seconds,
		positionMilliseconds: milliseconds
	});

	elements.positionMinutes.value = state.positionMinutes;
	elements.positionSeconds.value = state.positionSeconds;
	elements.positionMilliseconds.value = state.positionMilliseconds;
}

export function handlePositionChange(): void {
	if (!state.audioElement || !state.isLoaded) return;

	const minutes = parseInt(state.positionMinutes) || 0;
	const seconds = parseInt(state.positionSeconds) || 0;
	const ms = parseInt(state.positionMilliseconds) || 0;

	// Validate inputs
	if (!validateTimeInputs(seconds, ms)) return;

	const totalSeconds = parseTimeInputs(minutes.toString(), seconds.toString(), ms.toString());

	// Don't allow seeking beyond duration
	if (totalSeconds > state.duration) return;

	state.audioElement.currentTime = totalSeconds;
}

export function handlePositionInput(event: Event, field: string): void {
	const target = event.target as HTMLInputElement;
	const value = target.value;

	// Update the specific field in state
	const fieldKey = `position${field.charAt(0).toUpperCase() + field.slice(1)}`;
	updateState({ [fieldKey]: value });

	handlePositionChange();
}

export function handlePositionFocus(): void {
	updateState({ isEditingPosition: true });
}

export function handlePositionBlur(): void {
	updateState({ isEditingPosition: false });
	updatePositionFields();
}

export function setupPositionEventListeners(): void {
	// Position input event listeners
	elements.positionMinutes.addEventListener('input', (e) => handlePositionInput(e, 'minutes'));
	elements.positionMinutes.addEventListener('focus', handlePositionFocus);
	elements.positionMinutes.addEventListener('blur', handlePositionBlur);

	elements.positionSeconds.addEventListener('input', (e) => handlePositionInput(e, 'seconds'));
	elements.positionSeconds.addEventListener('focus', handlePositionFocus);
	elements.positionSeconds.addEventListener('blur', handlePositionBlur);

	elements.positionMilliseconds.addEventListener('input', (e) =>
		handlePositionInput(e, 'milliseconds')
	);
	elements.positionMilliseconds.addEventListener('focus', handlePositionFocus);
	elements.positionMilliseconds.addEventListener('blur', handlePositionBlur);
}
