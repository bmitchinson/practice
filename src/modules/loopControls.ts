// Loop Controls Module
import { state, updateState } from './state.ts';
import { elements } from './elements.ts';
import { parseTimeInputs, timeToComponents } from './utils.ts';

export function handleLoopInput(event: Event, field: string, type: string): void {
	const target = event.target as HTMLInputElement;
	const value = target.value;
	const fieldKey = `loop${type.charAt(0).toUpperCase() + type.slice(1)}${field.charAt(0).toUpperCase() + field.slice(1)}`;
	updateState({ [fieldKey]: value });
}

export function getLoopTime(type: string): number {
	const prefix = `loop${type.charAt(0).toUpperCase() + type.slice(1)}`;
	const minutes = state[`${prefix}Minutes` as keyof typeof state] as string;
	const seconds = state[`${prefix}Seconds` as keyof typeof state] as string;
	const milliseconds = state[`${prefix}Milliseconds` as keyof typeof state] as string;
	return parseTimeInputs(minutes, seconds, milliseconds);
}

export function setLoopStart(): void {
	if (!state.audioElement || !state.isLoaded) return;

	const current = state.audioElement.currentTime;
	const { minutes, seconds, milliseconds } = timeToComponents(current);

	updateState({
		loopStartMinutes: minutes,
		loopStartSeconds: seconds,
		loopStartMilliseconds: milliseconds
	});

	elements.loopStartMinutes.value = state.loopStartMinutes;
	elements.loopStartSeconds.value = state.loopStartSeconds;
	elements.loopStartMilliseconds.value = state.loopStartMilliseconds;
}

export function setLoopEnd(): void {
	if (!state.audioElement || !state.isLoaded) return;

	const current = state.audioElement.currentTime;
	const { minutes, seconds, milliseconds } = timeToComponents(current);

	updateState({
		loopEndMinutes: minutes,
		loopEndSeconds: seconds,
		loopEndMilliseconds: milliseconds
	});

	elements.loopEndMinutes.value = state.loopEndMinutes;
	elements.loopEndSeconds.value = state.loopEndSeconds;
	elements.loopEndMilliseconds.value = state.loopEndMilliseconds;
}

export function handleLoopEnabledChange(): void {
	updateState({ loopEnabled: elements.loopEnabled.checked });
}

export function checkLoop(): void {
	if (state.loopEnabled && state.audioElement && state.isLoaded) {
		const loopEnd = getLoopTime('end');
		const loopStart = getLoopTime('start');

		if (loopEnd > 0 && state.currentTime >= loopEnd) {
			state.audioElement.currentTime = loopStart;
		}
	}
}

export function setupLoopEventListeners(): void {
	// Loop input event listeners
	elements.loopStartMinutes.addEventListener('input', (e) =>
		handleLoopInput(e, 'minutes', 'start')
	);
	elements.loopStartSeconds.addEventListener('input', (e) =>
		handleLoopInput(e, 'seconds', 'start')
	);
	elements.loopStartMilliseconds.addEventListener('input', (e) =>
		handleLoopInput(e, 'milliseconds', 'start')
	);

	elements.loopEndMinutes.addEventListener('input', (e) => handleLoopInput(e, 'minutes', 'end'));
	elements.loopEndSeconds.addEventListener('input', (e) => handleLoopInput(e, 'seconds', 'end'));
	elements.loopEndMilliseconds.addEventListener('input', (e) =>
		handleLoopInput(e, 'milliseconds', 'end')
	);

	// Loop control event listeners
	elements.setLoopStartBtn.addEventListener('click', setLoopStart);
	elements.setLoopEndBtn.addEventListener('click', setLoopEnd);
	elements.loopEnabled.addEventListener('change', handleLoopEnabledChange);
}
