<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import {
		audioPlayerStore,
		normalizeSavedSections,
		type SavedSection
	} from '$lib/stores/audioPlayer';

	const browserStorageKey = 'practice.sections.export';

	interface PracticeExportSection {
		order?: number;
		name?: string;
		note?: string;
		startTime?: number;
		endTime?: number;
		createdAt?: string;
	}

	interface PracticeExportData {
		fileName?: string;
		exportDate?: string;
		songTitle?: string;
		exportTitle?: string;
		sections?: PracticeExportSection[];
	}

	// Subscribe to store
	let audioState = $derived($audioPlayerStore);
	let browserSaveConfirmed = $state(false);
	let browserSaveResetTimeout: ReturnType<typeof setTimeout> | null = null;
	let fileInput: HTMLInputElement;

	function getPracticeExportTitle(fileName: string): string {
		return fileName.replace(/\.practice\.json$/i, '') || 'song';
	}

	function getImportSongTitle(importData: PracticeExportData, fallbackTitle: string): string {
		if (typeof importData.songTitle === 'string' && importData.songTitle.trim()) {
			return importData.songTitle;
		}

		if (typeof importData.exportTitle === 'string' && importData.exportTitle.trim()) {
			return importData.exportTitle;
		}

		return fallbackTitle;
	}

	function getExportData() {
		return {
			fileName: audioState.selectedFile?.name || 'unknown',
			songTitle: audioState.exportTitle || 'song',
			exportDate: new Date().toISOString(),
			sections: audioState.savedSections.map((section) => ({
				order: section.order,
				name: section.name,
				note: section.note,
				startTime: section.startTime,
				endTime: section.endTime,
				createdAt: section.createdAt.toISOString()
			}))
		};
	}

	function getExportJsonString(): string | null {
		if (audioState.savedSections.length === 0) {
			alert('no sections to export');
			return null;
		}

		return JSON.stringify(getExportData(), null, 2);
	}

	function updateSongTitle(event: Event) {
		const target = event.target as HTMLInputElement;

		audioPlayerStore.update((state) => ({
			...state,
			exportTitle: target.value
		}));
	}

	function exportSections() {
		const jsonString = getExportJsonString();

		if (!jsonString) return;

		// Create blob and download
		const blob = new Blob([jsonString], { type: 'application/json' });
		const url = URL.createObjectURL(blob);

		// Create download link
		const link = document.createElement('a');
		link.href = url;

		// Generate filename
		link.download = `${audioState.exportTitle || 'song'}.practice.json`;

		// Trigger download
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);

		// Clean up
		URL.revokeObjectURL(url);
	}

	function importSections() {
		fileInput.click();
	}

	function importSectionsFromJson(
		content: string,
		fallbackTitle: string,
		options: {
			action: string;
			errorMessage: string;
			skipConfirm?: boolean;
			showErrors?: boolean;
		}
	): boolean {
		const showErrors = options.showErrors ?? true;

		try {
			const importData = JSON.parse(content) as PracticeExportData;

			// Validate structure
			if (!importData.sections || !Array.isArray(importData.sections)) {
				throw new Error('invalid file format');
			}

			// Convert sections back to proper format
			const importedSections: SavedSection[] = importData.sections.map((section, index) => ({
				id: crypto.randomUUID(),
				order:
					typeof section.order === 'number' && Number.isFinite(section.order)
						? section.order
						: index + 1,
				name: section.name || `imported section ${index + 1}`,
				note: section.note || '',
				startTime: section.startTime || 0,
				endTime: section.endTime || 0,
				createdAt: section.createdAt ? new Date(section.createdAt) : new Date()
			}));

			// Ask user for approval to overwrite existing sections
			const shouldOverwrite =
				options.skipConfirm ||
				confirm(
					`${options.action} ${importedSections.length} sections?\n\n` +
						`this will overwrite all existing sections. click ok to proceed or cancel to abort.`
				);

			if (shouldOverwrite) {
				audioPlayerStore.update((state) => ({
					...state,
					exportTitle: getImportSongTitle(importData, fallbackTitle),
					savedSections: normalizeSavedSections(importedSections),
					currentSectionName: '',
					currentNote: '',
					currentSectionId: null
				}));
			}

			return shouldOverwrite;
		} catch (error) {
			if (showErrors) {
				alert(options.errorMessage);
			}
			console.error('import error:', error);
			return false;
		}
	}

	function handleFileImport(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];

		if (!file) return;

		if (!file.name.endsWith('.practice.json')) {
			alert('please select a .practice.json file');
			return;
		}

		const reader = new FileReader();
		reader.onload = (e) => {
			const content = e.target?.result as string;
			importSectionsFromJson(content, getPracticeExportTitle(file.name), {
				action: 'import',
				errorMessage: 'error importing file: invalid format or corrupted file'
			});
		};

		reader.readAsText(file);

		// Clear input for next use
		target.value = '';
	}

	function showBrowserSaveConfirmation() {
		browserSaveConfirmed = true;

		if (browserSaveResetTimeout) {
			clearTimeout(browserSaveResetTimeout);
		}

		browserSaveResetTimeout = setTimeout(() => {
			browserSaveConfirmed = false;
			browserSaveResetTimeout = null;
		}, 900);
	}

	function saveSectionsToBrowser() {
		const jsonString = getExportJsonString();

		if (!jsonString) return;

		try {
			localStorage.setItem(browserStorageKey, jsonString);
			showBrowserSaveConfirmation();

			const savedString = localStorage.getItem(browserStorageKey) ?? '';
			if (savedString.length < jsonString.length) {
				alert(
					'warning: browser save may be incomplete because it is smaller than the current export'
				);
			}
		} catch (error) {
			alert('error saving to browser storage');
			console.error('browser save error:', error);
		}
	}

	function loadSectionsFromBrowser(options: { skipConfirm?: boolean; showErrors?: boolean } = {}) {
		const showErrors = options.showErrors ?? true;
		let content: string | null;

		try {
			content = localStorage.getItem(browserStorageKey);
		} catch (error) {
			if (showErrors) {
				alert('error loading browser save');
			}
			console.error('browser load error:', error);
			return;
		}

		if (!content) {
			if (showErrors) {
				alert('no browser save found');
			}
			return;
		}

		importSectionsFromJson(content, 'song', {
			action: 'load',
			errorMessage: 'error loading browser save: invalid format or corrupted save',
			skipConfirm: options.skipConfirm,
			showErrors
		});
	}

	onMount(() => {
		if (audioState.savedSections.length === 0) {
			loadSectionsFromBrowser({ skipConfirm: true, showErrors: false });
		}
	});

	onDestroy(() => {
		if (browserSaveResetTimeout) {
			clearTimeout(browserSaveResetTimeout);
		}
	});
</script>

<div class="rounded border p-4">
	<!-- Hidden file input -->
	<input
		bind:this={fileInput}
		type="file"
		accept=".json,.practice.json"
		onchange={handleFileImport}
		class="hidden"
	/>

	<div class="mb-3">
		<label for="song-title" class="mb-1 block text-sm">song title:</label>
		<input
			id="song-title"
			type="text"
			value={audioState.exportTitle}
			oninput={updateSongTitle}
			placeholder="song title"
			class="w-full rounded border px-2 py-1"
		/>
	</div>

	<div class="flex gap-2">
		<button
			onclick={exportSections}
			class="flex-1 rounded border px-4 py-2 disabled:opacity-50"
			disabled={audioState.savedSections.length === 0}
		>
			export
		</button>

		<button onclick={importSections} class="flex-1 rounded border px-4 py-2"> import </button>
	</div>

	<div class="mt-2 flex gap-2">
		<button
			onclick={saveSectionsToBrowser}
			class="flex-1 rounded border px-4 py-2 disabled:opacity-50"
			disabled={audioState.savedSections.length === 0}
		>
			{#key browserSaveConfirmed}
				<span class="inline-block min-w-28" transition:fade={{ duration: 180 }}>
					{browserSaveConfirmed ? '✅' : 'save to browser'}
				</span>
			{/key}
		</button>

		<button onclick={() => loadSectionsFromBrowser()} class="flex-1 rounded border px-4 py-2">
			load from browser
		</button>
	</div>

	{#if audioState.savedSections.length > 0}
		<p class="mt-2 text-sm opacity-70">
			{audioState.savedSections.length} section{audioState.savedSections.length !== 1 ? 's' : ''} ready
			to export
		</p>
	{/if}
</div>
