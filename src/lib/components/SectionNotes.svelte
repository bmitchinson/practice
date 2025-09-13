<script lang="ts">
	import {
		audioPlayerStore,
		saveSection,
		getLoopStartTime,
		getLoopEndTime
	} from '$lib/stores/audioPlayer';

	let sectionName = $state('');
	let note = $state('');

	// Subscribe to store
	let audioState = $derived($audioPlayerStore);

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

		saveSection(sectionName, note, startTime, endTime);

		// Clear inputs
		sectionName = '';
		note = '';
	}

	let canSave = $derived(() => {
		const state = audioState;
		if (!state.isLoaded) return false;

		const startTime = getLoopStartTime(state);
		const endTime = getLoopEndTime(state);

		return endTime > startTime && (sectionName.trim() || note.trim());
	});
</script>

<div class="space-y-4 rounded border p-4">
	<h3 class="text-lg font-medium">Section Notes</h3>

	<!-- Section Name Input -->
	<div>
		<label for="section-name" class="mb-1 block text-sm">Section Name:</label>
		<input
			id="section-name"
			type="text"
			bind:value={sectionName}
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
			bind:value={note}
			placeholder="Enter your notes about this section..."
			rows="4"
			class="w-full resize-none rounded border px-3 py-2"
			disabled={!audioState.isLoaded}
		></textarea>
	</div>

	<!-- Save Button -->
	<div class="flex justify-end">
		<button
			onclick={handleSave}
			class="rounded border px-4 py-2 disabled:opacity-50"
			disabled={!canSave}
		>
			Save Section
		</button>
	</div>
</div>
