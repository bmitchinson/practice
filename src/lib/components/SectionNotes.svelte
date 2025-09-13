<script lang="ts">
	import {
		audioPlayerStore,
		saveSection,
		updateSection,
		getLoopStartTime,
		getLoopEndTime
	} from '$lib/stores/audioPlayer';

	// Subscribe to store
	let audioState = $derived($audioPlayerStore);

	// Bind to store values for editing
	let sectionName = $derived.by(() => audioState.currentSectionName);
	let note = $derived.by(() => audioState.currentNote);

	function handleSave() {
		const state = audioState;

		if (!state.isLoaded) return;

		const startTime = getLoopStartTime(state);
		const endTime = getLoopEndTime(state);

		// Validate that we have valid times
		if (endTime <= startTime) {
			alert('Loop end time must be greater than start time');
			return;
		}

		// Check if we're editing an existing section
		if (state.currentSectionId) {
			updateSection(state.currentSectionId, sectionName, note, startTime, endTime);
		} else {
			saveSection(sectionName, note, startTime, endTime);
		}
	}

	function handleCancel() {
		audioPlayerStore.update((state) => ({
			...state,
			currentSectionName: '',
			currentNote: '',
			currentSectionId: null
		}));
	}

	function updateSectionName(value: string) {
		audioPlayerStore.update((state) => ({
			...state,
			currentSectionName: value
		}));
	}

	function updateNote(value: string) {
		audioPlayerStore.update((state) => ({
			...state,
			currentNote: value
		}));
	}

	let canSave = $derived(() => {
		const state = audioState;
		if (!state.isLoaded) return false;

		const startTime = getLoopStartTime(state);
		const endTime = getLoopEndTime(state);

		return endTime > startTime && (state.currentSectionName.trim() || state.currentNote.trim());
	});

	let isEditing = $derived(audioState.currentSectionId !== null);
</script>

<div class="space-y-4 rounded border p-4">
	<h3 class="text-lg font-medium">
		{isEditing ? 'Edit Section' : 'Section Notes'}
	</h3>

	<!-- Section Name Input -->
	<div>
		<label for="section-name" class="mb-1 block text-sm">Section Name:</label>
		<input
			id="section-name"
			type="text"
			value={sectionName}
			oninput={(e) => updateSectionName((e.target as HTMLInputElement).value)}
			placeholder="Enter section name..."
			class="w-full rounded border px-3 py-2"
			disabled={!audioState.isLoaded}
		/>
	</div>

	<!-- Note Textarea -->
	<div>
		<label for="note" class="mb-1 block text-sm">Note:</label>
		<textarea
			id="note"
			value={note}
			oninput={(e) => updateNote((e.target as HTMLTextAreaElement).value)}
			placeholder="Enter your notes about this section..."
			rows="4"
			class="w-full resize-none rounded border px-3 py-2"
			disabled={!audioState.isLoaded}
		></textarea>
	</div>

	<!-- Buttons -->
	<div class="flex justify-between">
		<button onclick={handleCancel} class="rounded border px-4 py-2" disabled={!audioState.isLoaded}>
			New Section
		</button>
		<div class="flex gap-2">
			{#if isEditing}
				<button onclick={handleCancel} class="rounded border px-4 py-2"> Cancel </button>
			{/if}
			<button
				onclick={handleSave}
				class="rounded border px-4 py-2 disabled:opacity-50"
				disabled={!canSave}
			>
				{isEditing ? 'Update Section' : 'Save Section'}
			</button>
		</div>
	</div>
</div>
