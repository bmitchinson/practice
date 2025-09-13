<script lang="ts">
	import { audioPlayerStore, loadSection, type SavedSection } from '$lib/stores/audioPlayer';

	// Subscribe to store
	let audioState = $derived($audioPlayerStore);

	function handleSectionClick(section: SavedSection) {
		loadSection(section);
	}

	function formatTime(seconds: number): string {
		const minutes = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		const ms = Math.floor((seconds % 1) * 1000);
		return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${ms.toString().padStart(3, '0')}`;
	}

	function deleteSection(sectionId: string, event: Event) {
		event.stopPropagation();

		audioPlayerStore.update((state) => ({
			...state,
			savedSections: state.savedSections.filter((s) => s.id !== sectionId)
		}));
	}
</script>

<div class="rounded border p-4">
	<h3 class="text-lg font-medium">Saved Sections</h3>

	{#if audioState.savedSections.length === 0}
		<p class="text-sm opacity-60">No saved sections yet</p>
	{:else}
		<p class="mb-4 text-sm">Click to load into player</p>
		<div class="space-y-2">
			{#each audioState.savedSections as section (section.id)}
				<div
					class="cursor-pointer rounded border p-3 transition-colors hover:border-gray-400"
					onclick={() => handleSectionClick(section)}
				>
					<div class="mb-2 flex items-start justify-between">
						<div class="min-w-0 flex-1">
							<h4 class="truncate font-medium">{section.name}</h4>
							<div class="text-xs opacity-70">
								{formatTime(section.startTime)} - {formatTime(section.endTime)}
							</div>
						</div>
						<button
							onclick={(e) => deleteSection(section.id, e)}
							class="ml-2 rounded border px-2 py-1 text-xs hover:bg-gray-50"
							title="Delete section"
						>
							×
						</button>
					</div>

					{#if section.note}
						<p class="line-clamp-2 text-sm opacity-80">{section.note}</p>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
