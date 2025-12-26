<script lang="ts">
  import PhotoPreviewModal from "./PhotoPreviewModal.svelte";

  export let businessName: string;
  export let distance = "Nearby";
  export let message: string;
  export let price: number | string | null = null;
  export let photoUrls: string[] = [];
  export let index = 0;

  let previewPhotoUrl: string | null = null;

  const formatPrice = (value: number | string | null) => {
    if (value === null || value === undefined || value === "") {
      return null;
    }

    const numeric = typeof value === "string" ? Number(value) : value;
    if (!Number.isNaN(numeric)) {
      return `$${numeric}`;
    }

    return String(value);
  };

  $: priceLabel = formatPrice(price);
  $: thumbnails = photoUrls.slice(0, 3);
</script>

<article class="offer-card" style={`--card-delay: ${index * 0.08}s`}>
  <header>
    <div>
      <h3>{businessName}</h3>
      <p class="distance">{distance}</p>
    </div>
    {#if priceLabel}
      <span class="price-pill">{priceLabel}</span>
    {/if}
  </header>

  {#if thumbnails.length > 0}
    <div class="photos">
      {#each thumbnails as photo, idx}
        <button
          type="button"
          class="photo-thumb"
          on:click={() => {
            previewPhotoUrl = photo;
          }}
        >
          <img src={photo} alt={`Offer photo ${idx + 1} from ${businessName}`} />
        </button>
      {/each}
    </div>
  {/if}

  <p class="message">{message}</p>
  <button type="button" class="cta">Chat to Lock In</button>
  <PhotoPreviewModal
    isOpen={Boolean(previewPhotoUrl)}
    photoUrl={previewPhotoUrl}
    altText={previewPhotoUrl ? `Offer photo from ${businessName}` : ""}
    on:close={() => {
      previewPhotoUrl = null;
    }}
  />
</article>

<style>
  .offer-card {
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
    padding: 1.25rem 1.4rem;
    border-radius: 1.25rem;
    background: rgba(15, 23, 42, 0.9);
    border: 1px solid rgba(148, 163, 184, 0.25);
    box-shadow: 0 16px 35px rgba(2, 6, 23, 0.45);
    color: #f8fafc;
    animation: slide-up 0.4s ease-out both;
    animation-delay: var(--card-delay, 0s);
    backdrop-filter: blur(12px);
  }

  header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
  }

  h3 {
    margin: 0;
    font-size: 1.05rem;
  }

  .distance {
    margin: 0.25rem 0 0;
    font-size: 0.85rem;
    color: #cbd5f5;
  }

  .price-pill {
    padding: 0.35rem 0.75rem;
    border-radius: 999px;
    background: rgba(56, 189, 248, 0.2);
    color: #bae6fd;
    font-weight: 600;
    font-size: 0.85rem;
    white-space: nowrap;
  }

  .photos {
    display: flex;
    gap: 0.5rem;
    overflow-x: auto;
  }

  .photo-thumb {
    border: none;
    padding: 0;
    border-radius: 0.75rem;
    background: transparent;
    cursor: pointer;
    flex: 0 0 auto;
  }

  .photo-thumb img {
    width: 64px;
    height: 64px;
    border-radius: 0.75rem;
    object-fit: cover;
    border: 1px solid rgba(148, 163, 184, 0.3);
    display: block;
  }

  .photo-thumb:focus-visible {
    outline: 2px solid #38bdf8;
    outline-offset: 2px;
  }

  .message {
    margin: 0;
    font-size: 1.05rem;
    line-height: 1.5;
  }

  .cta {
    align-self: flex-start;
    border: none;
    border-radius: 999px;
    padding: 0.65rem 1.35rem;
    background: #38bdf8;
    color: #0f172a;
    font-weight: 700;
    cursor: pointer;
  }

  @keyframes slide-up {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
