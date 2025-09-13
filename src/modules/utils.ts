// Utility Functions

export function formatTime(seconds: number): string {
	if (isNaN(seconds) || seconds === 0) {
		return '00:00:000';
	}

	const minutes = Math.floor(seconds / 60);
	const secs = Math.floor(seconds % 60);
	const ms = Math.floor((seconds % 1) * 1000);

	return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${ms.toString().padStart(3, '0')}`;
}

export function parseTimeInputs(minutes: string, seconds: string, milliseconds: string): number {
	const mins = parseInt(minutes) || 0;
	const secs = parseInt(seconds) || 0;
	const ms = parseInt(milliseconds) || 0;

	return mins * 60 + secs + ms / 1000;
}

export function validateTimeInputs(seconds: number, milliseconds: number): boolean {
	return seconds < 60 && milliseconds < 1000;
}

export function timeToComponents(totalSeconds: number): {
	minutes: string;
	seconds: string;
	milliseconds: string;
} {
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = Math.floor(totalSeconds % 60);
	const ms = Math.floor((totalSeconds % 1) * 1000);

	return {
		minutes: minutes.toString(),
		seconds: seconds.toString(),
		milliseconds: ms.toString()
	};
}
