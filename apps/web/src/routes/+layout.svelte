<script>
  import SiteHeader from '$components/SiteHeader.svelte';
</script>

<div class="app-shell">
  <SiteHeader />
  <main>
    <slot />
  </main>
</div>

<style>
  :global(body) {
    margin: 0;
    font-family: "Inter", system-ui, sans-serif;
    color: #0f172a;
    background: #f8fafc;
  }

  .app-shell {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  main {
    flex: 1;
    padding: 2.5rem 1.5rem 4rem;
    max-width: 960px;
    margin: 0 auto;
    width: 100%;
  }
</style>
