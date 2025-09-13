<script lang="ts">
	import { audioPlayerStore, type SavedSection } from '$lib/stores/audioPlayer';

	// Subscribe to store
	let audioState = $derived($audioPlayerStore);
	let fileInput: HTMLInputElement;

	function getExportData() {
		return {
			fileName: audioState.selectedFile?.name || 'unknown',
			exportDate: new Date().toISOString(),
			sections: audioState.savedSections.map((section) => ({
				name: section.name,
				note: section.note,
				startTime: section.startTime,
				endTime: section.endTime,
				createdAt: section.createdAt.toISOString()
			}))
		};
	}

	function exportSections() {
		if (!audioState.selectedFile || audioState.savedSections.length === 0) {
			alert('No audio file loaded or no sections to export');
			return;
		}

		const exportData = getExportData();
		const jsonString = JSON.stringify(exportData, null, 2);

		// Create blob and download
		const blob = new Blob([jsonString], { type: 'application/json' });
		const url = URL.createObjectURL(blob);

		// Create download link
		const link = document.createElement('a');
		link.href = url;

		// Generate filename
		const baseName = audioState.selectedFile.name.replace(/\.[^/.]+$/, '');
		link.download = `${baseName}.practice.json`;

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

	function handleFileImport(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];

		if (!file) return;

		if (!file.name.endsWith('.practice.json')) {
			alert('Please select a .practice.json file');
			return;
		}

		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const content = e.target?.result as string;
				const importData = JSON.parse(content);

				// Validate structure
				if (!importData.sections || !Array.isArray(importData.sections)) {
					throw new Error('Invalid file format');
				}

				// Convert sections back to proper format
				const importedSections: SavedSection[] = importData.sections.map(
					(section: any, index: number) => ({
						id: crypto.randomUUID(),
						name: section.name || `Imported Section ${index + 1}`,
						note: section.note || '',
						startTime: section.startTime || 0,
						endTime: section.endTime || 0,
						createdAt: section.createdAt ? new Date(section.createdAt) : new Date()
					})
				);

				// Ask user how to handle import
				const replace = confirm(
					`Import ${importedSections.length} sections?\n\n` +
						`Click OK to replace existing sections, or Cancel to add to existing sections.`
				);

				audioPlayerStore.update((state) => ({
					...state,
					savedSections: replace
						? importedSections.sort((a, b) => a.startTime - b.startTime)
						: [...state.savedSections, ...importedSections].sort(
								(a, b) => a.startTime - b.startTime
							)
				}));

				alert(
					`Successfully imported ${importedSections.length} sections from ${importData.fileName || 'unknown file'}`
				);
			} catch (error) {
				alert('Error importing file: Invalid format or corrupted file');
				console.error('Import error:', error);
			}
		};

		reader.readAsText(file);

		// Clear input for next use
		target.value = '';
	}
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

	<div class="flex gap-2">
		<button
			onclick={exportSections}
			class="flex-1 rounded border px-4 py-2 disabled:opacity-50"
			disabled={!audioState.selectedFile || audioState.savedSections.length === 0}
		>
			export
		</button>

		<button onclick={importSections} class="flex-1 rounded border px-4 py-2"> import </button>
	</div>

	{#if audioState.selectedFile && audioState.savedSections.length > 0}
		<p class="mt-2 text-sm opacity-70">
			{audioState.savedSections.length} section{audioState.savedSections.length !== 1 ? 's' : ''} ready
			to export
		</p>
	{/if}
</div>
