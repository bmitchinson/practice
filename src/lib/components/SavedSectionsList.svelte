<script lang="ts">
	import { flip } from 'svelte/animate';
	import { dndzone } from 'svelte-dnd-action';
	import {
		audioPlayerStore,
		loadSection,
		normalizeSavedSections,
		type SavedSection
	} from '$lib/stores/audioPlayer';

	// Subscribe to store
	let audioState = $derived($audioPlayerStore);
	let orderedSections: SavedSection[] = $state([]);
	const flipDurationMs = 150;
	const dropTargetStyle = {
		outline: 'none'
	};

	$effect(() => {
		orderedSections = normalizeSavedSections(audioState.savedSections);
	});

	function reindexSectionsInCurrentOrder(sections: SavedSection[]): SavedSection[] {
		return sections.map((section, index) => ({
			...section,
			order: index + 1
		}));
	}

	function handleSectionClick(section: SavedSection) {
		loadSection(section);
	}

	function handleSectionKeydown(event: KeyboardEvent, section: SavedSection) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handleSectionClick(section);
		}
	}

	function formatTime(seconds: number): string {
		const minutes = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		const ms = Math.floor((seconds % 1) * 1000);
		return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${ms.toString().padStart(3, '0')}`;
	}

	function deleteSection(sectionId: string, event: Event) {
		event.stopPropagation();

		const section = audioState.savedSections.find((s) => s.id === sectionId);
		if (!section) return;

		const confirmed = confirm(`delete section "${section.name}"?`);
		if (!confirmed) return;

		audioPlayerStore.update((state) => ({
			...state,
			savedSections: normalizeSavedSections(state.savedSections.filter((s) => s.id !== sectionId)),
			currentSectionName: state.currentSectionId === sectionId ? '' : state.currentSectionName,
			currentNote: state.currentSectionId === sectionId ? '' : state.currentNote,
			currentSectionId: state.currentSectionId === sectionId ? null : state.currentSectionId
		}));
	}

	function applyOrderedSections(sections: SavedSection[]) {
		const nextSections = reindexSectionsInCurrentOrder(sections);

		audioPlayerStore.update((state) => ({
			...state,
			savedSections: nextSections
		}));
	}

	function handleDndConsider(event: CustomEvent<{ items: SavedSection[] }>) {
		orderedSections = reindexSectionsInCurrentOrder(event.detail.items);
	}

	function handleDndFinalize(event: CustomEvent<{ items: SavedSection[] }>) {
		orderedSections = reindexSectionsInCurrentOrder(event.detail.items);
		applyOrderedSections(event.detail.items);
	}
</script>

<div class="rounded border p-4">
	<h3 class="text-lg font-medium">saved sections</h3>

	{#if audioState.savedSections.length === 0}
		<p class="text-sm opacity-60">no saved sections yet</p>
	{:else}
		<p class="mb-4 text-sm">click to load into player</p>
		<div
			use:dndzone={{ items: orderedSections, flipDurationMs, dropTargetStyle }}
			onconsider={handleDndConsider}
			onfinalize={handleDndFinalize}
			class="space-y-2"
			aria-label="saved sections"
		>
			{#each orderedSections as section (section.id)}
				<div
					animate:flip={{ duration: flipDurationMs }}
					class="cursor-pointer rounded border p-3 transition-colors hover:border-gray-400 {audioState.currentSectionId ===
					section.id
						? 'border-2 shadow-md'
						: ''}"
					onclick={() => handleSectionClick(section)}
					onkeydown={(event) => handleSectionKeydown(event, section)}
					role="button"
					tabindex="0"
					aria-label={`section ${section.order}: ${section.name}`}
				>
					<div class="mb-2 flex items-start justify-between">
						<div class="min-w-0 flex-1">
							<h4 class="truncate font-medium">#{section.order}) {section.name}</h4>
							<div class="text-xs opacity-70">
								{formatTime(section.startTime)} - {formatTime(section.endTime)}
							</div>
						</div>
						<button
							onclick={(e) => deleteSection(section.id, e)}
							class="ml-2 rounded border px-2 py-1 text-xs hover:bg-gray-50"
							title="delete section"
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
		line-clamp: 2;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
