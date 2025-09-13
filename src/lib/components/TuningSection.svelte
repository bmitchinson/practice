<script lang="ts">
	let activeNotes: Set<string> = $state(new Set());
	let audioContext: AudioContext | null = $state(null);
	let oscillators: Map<string, OscillatorNode> = $state(new Map());

	// Bass guitar frequencies (in Hz) - one octave higher
	const primaryNotes = {
		E: 82.4, // E2
		A: 110.0, // A2
		D: 146.8, // D3
		G: 196.0 // G3
	};

	const secondaryNotes = {
		C: 130.8, // C3
		F: 174.6, // F3
		B: 247.0 // B3
	};

	function initAudioContext() {
		if (!audioContext) {
			audioContext = new AudioContext();
		}
	}

	function playNote(note: string, frequency: number) {
		initAudioContext();
		if (!audioContext) return;

		// Stop existing oscillator for this note if playing
		stopNote(note);

		// Create oscillator and gain node
		const oscillator = audioContext.createOscillator();
		const gainNode = audioContext.createGain();

		oscillator.type = 'sine';
		oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

		// Set up constant volume (no ramping)
		gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);

		// Connect audio nodes
		oscillator.connect(gainNode);
		gainNode.connect(audioContext.destination);

		// Start playing
		oscillator.start();

		// Store oscillator reference
		oscillators.set(note, oscillator);
		activeNotes.add(note);

		// Auto-stop after 8 seconds
		setTimeout(() => {
			stopNote(note);
		}, 8000);

		// Handle oscillator end
		oscillator.onended = () => {
			oscillators.delete(note);
			activeNotes.delete(note);
		};
	}

	function stopNote(note: string) {
		const oscillator = oscillators.get(note);
		if (oscillator && audioContext) {
			try {
				oscillator.stop();
			} catch {
				// Oscillator may already be stopped
			}
			oscillators.delete(note);
			activeNotes.delete(note);
		} else {
			oscillators.delete(note);
			activeNotes.delete(note);
		}
	}

	function stopAllNotes() {
		for (const note of activeNotes) {
			stopNote(note);
		}
	}

	function handleNoteClick(note: string, frequency: number) {
		// Always stop all notes first
		stopAllNotes();

		// Then play the new note (unless it was the same note that was already playing)
		if (!activeNotes.has(note)) {
			playNote(note, frequency);
		}
	}
</script>

<div class="tuning-section border-theme w-full rounded border p-6">
	<h3 class="mb-4 text-center text-lg">bass tuning</h3>

	<!-- Primary tuning notes (E A D G) -->
	<div class="mb-4">
		<div class="mb-2 text-center text-sm">standard tuning</div>
		<div class="flex justify-center gap-3">
			{#each Object.entries(primaryNotes) as [note, frequency] (note)}
				<button
					onclick={() => handleNoteClick(note, frequency)}
					class="border-theme flex h-12 w-12 items-center justify-center rounded border text-sm"
				>
					{note}
				</button>
			{/each}
		</div>
	</div>

	<!-- Secondary tuning notes (C D F G B) -->
	<div>
		<div class="mb-2 text-center text-sm">additional notes</div>
		<div class="flex justify-center gap-2">
			{#each Object.entries(secondaryNotes) as [note, frequency] (note)}
				<button
					onclick={() => handleNoteClick(`${note}-secondary`, frequency)}
					class="border-theme flex h-10 w-10 items-center justify-center rounded border text-xs"
				>
					{note}
				</button>
			{/each}
		</div>
	</div>

	<div class="mt-3 text-center text-xs opacity-75">click to play note for 8 seconds</div>
</div>
