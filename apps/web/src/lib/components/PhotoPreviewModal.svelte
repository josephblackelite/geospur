<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let isOpen = false;
  export let photoUrl: string | null = null;
  export let altText = "Offer photo preview";

  const dispatch = createEventDispatcher<{ close: void }>();

  const close = () => dispatch("close");
</script>

<svelte:window
  on:keydown={(event) => {
    if (event.key === "Escape" && isOpen) {
      close();
    }
  }}
/>

{#if isOpen && photoUrl}
  <div class="backdrop" on:click|self={close} role="presentation">
    <div class="modal" role="dialog" aria-modal="true" aria-label="Photo preview">
      <button type="button" class="close-button" on:click={close} aria-label="Close preview">
        Close
      </button>
      <img src={photoUrl} alt={altText} />
    </div>
  </div>
{/if}

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(2, 6, 23, 0.85);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;
    padding: 1.5rem;
  }

  .modal {
    position: relative;
    max-width: min(900px, 100%);
    max-height: 100%;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  img {
    max-width: 100%;
    max-height: min(80vh, 720px);
    border-radius: 1rem;
    object-fit: contain;
    border: 1px solid rgba(148, 163, 184, 0.3);
    box-shadow: 0 22px 45px rgba(2, 6, 23, 0.45);
  }

  .close-button {
    align-self: flex-end;
    border: none;
    border-radius: 999px;
    padding: 0.5rem 1.25rem;
    background: rgba(248, 250, 252, 0.15);
    color: #f8fafc;
    font-weight: 600;
    cursor: pointer;
  }

  .close-button:hover {
    background: rgba(248, 250, 252, 0.25);
  }
</style>
