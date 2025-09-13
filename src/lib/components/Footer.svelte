<script lang="ts">
	let commitHash = '';

	// Get the git commit hash injected at build time
	if (typeof __GIT_COMMIT__ !== 'undefined') {
		commitHash = __GIT_COMMIT__;
	}
</script>

<footer class="mt-8 w-full border-t p-4 text-center text-sm">
	{#if commitHash && commitHash !== 'unknown'}
		build: <span class="font-mono">{commitHash}</span>
	{:else}
		build: development
	{/if}
</footer>
