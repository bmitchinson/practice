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

		const startTime = getLoopStartTime(state);
		const endTime = getLoopEndTime(state);

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
		return Boolean(state.currentSectionName.trim() || state.currentNote.trim());
	});

	let isEditing = $derived(audioState.currentSectionId !== null);
	let editingOrder = $derived.by(() => {
		if (!audioState.currentSectionId) return null;

		return (
			audioState.savedSections.find((section) => section.id === audioState.currentSectionId)
				?.order ?? null
		);
	});
</script>

<div class="space-y-4 rounded border p-4">
	<div>
		<h3 class="text-lg font-medium">section editor</h3>
		{#if editingOrder !== null}
			<p class="text-sm opacity-70">editing #{editingOrder}</p>
		{/if}
	</div>

	<!-- Section Name Input -->
	<div>
		<label for="section-name" class="mb-1 block text-sm">section name:</label>
		<input
			id="section-name"
			type="text"
			value={sectionName}
			oninput={(e) => updateSectionName((e.target as HTMLInputElement).value)}
			placeholder="enter section name..."
			class="w-full rounded border px-3 py-2"
		/>
	</div>

	<!-- Note Textarea -->
	<div>
		<label for="note" class="mb-1 block text-sm">note:</label>
		<textarea
			id="note"
			value={note}
			oninput={(e) => updateNote((e.target as HTMLTextAreaElement).value)}
			placeholder="enter your notes about this section..."
			rows="4"
			class="w-full resize-none rounded border px-3 py-2"
		></textarea>
	</div>

	<!-- Buttons -->
	<div class="flex justify-end">
		{#if isEditing}
			<div class="flex gap-2">
				<button onclick={handleCancel} class="rounded border px-4 py-2"> cancel </button>
				<button
					onclick={handleSave}
					class="rounded border px-4 py-2 disabled:opacity-50"
					disabled={!canSave}
				>
					update section
				</button>
			</div>
		{:else}
			<button
				onclick={handleSave}
				class="rounded border px-4 py-2 disabled:opacity-50"
				disabled={!canSave}
			>
				new section
			</button>
		{/if}
	</div>
</div>
