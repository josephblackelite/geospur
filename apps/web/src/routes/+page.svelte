<script lang="ts">
  import { goto } from "$app/navigation";
  import { addDoc, collection, serverTimestamp } from "firebase/firestore";
  import { db } from "$lib/firebase";

  let requestText = "";
  let isSubmitting = false;
  let errorMessage = "";
  let isLocationModalOpen = false;
  let locationStatus: "unknown" | "requesting" | "granted" | "denied" = "unknown";
  let locationLat: number | null = null;
  let locationLng: number | null = null;
  let pendingSubmit = false;
  let requestField: HTMLTextAreaElement | null = null;

  const createDraftRequest = async () => {
    errorMessage = "";

    if (!requestText.trim()) {
      errorMessage = "Tell us what you need to get started.";
      return;
    }

    isSubmitting = true;

    if (locationLat === null || locationLng === null) {
      errorMessage = "Share your location so we can match you with nearby partners.";
      isSubmitting = false;
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "requests"), {
        rawQuery: requestText.trim(),
        lat: locationLat,
        lng: locationLng,
        status: "draft",
        createdAt: serverTimestamp(),
      });

      await goto(`/r/${docRef.id}`);
    } catch (error) {
      errorMessage = "We couldn't save your request. Please try again.";
      console.error(error);
    } finally {
      isSubmitting = false;
    }
  };

  const handleSubmit = async () => {
    errorMessage = "";

    if (!requestText.trim()) {
      errorMessage = "Tell us what you need to get started.";
      return;
    }

    if (locationStatus !== "granted") {
      pendingSubmit = true;
      isLocationModalOpen = true;
      return;
    }

    await createDraftRequest();
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      locationStatus = "denied";
      errorMessage = "Location services aren’t available on this device.";
      return;
    }

    locationStatus = "requesting";
    navigator.geolocation.getCurrentPosition(
      (position) => {
        locationLat = position.coords.latitude;
        locationLng = position.coords.longitude;
        locationStatus = "granted";
        isLocationModalOpen = false;

        if (pendingSubmit) {
          pendingSubmit = false;
          createDraftRequest();
        }
      },
      () => {
        locationStatus = "denied";
        isLocationModalOpen = false;
        pendingSubmit = false;
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const openLocationModal = () => {
    errorMessage = "";
    isLocationModalOpen = true;
  };

  const focusRequestField = () => {
    requestField?.focus();
  };
</script>

<svelte:head>
  <title>GeoSpur | Request</title>
</svelte:head>

<section class="page">
  <header class="route-toggle">
    <a class="route-link" href="/business">Business inbox</a>
  </header>
  <div class="card">
    <div class="header">
      <p class="eyebrow">Live assistance</p>
      <h1>What do you need?</h1>
      <p class="subtitle">
        Share the essentials and we’ll route it to nearby partners who can help right away.
      </p>
    </div>

    <form class="form" on:submit|preventDefault={handleSubmit}>
      <label for="request" class="label">Request details</label>
      <textarea
        id="request"
        rows="5"
        placeholder="Need last-minute flowers, a courier, or a city guide?"
        bind:value={requestText}
        bind:this={requestField}
      ></textarea>

      <div class="location-row">
        <div>
          <p class="location-label">Location</p>
          {#if locationStatus === "granted"}
            <p class="location-value">Location shared · Ready to match</p>
            <p class="location-subtext">
              Lat {locationLat?.toFixed(3)}, Lng {locationLng?.toFixed(3)}
            </p>
          {:else if locationStatus === "requesting"}
            <p class="location-value">Waiting for permission…</p>
          {:else if locationStatus === "denied"}
            <p class="location-value">Location blocked</p>
            <p class="location-subtext">Enable it to reach nearby partners faster.</p>
          {:else}
            <p class="location-value">Auto-detect after you approve</p>
          {/if}
        </div>
        <button class="chip" type="button" on:click={openLocationModal}>
          {locationStatus === "granted" ? "Update" : "Share location"}
        </button>
      </div>

      {#if locationStatus === "denied"}
        <div class="location-fallback">
          <p class="fallback-title">We couldn’t access your location.</p>
          <p class="fallback-body">
            You can try again or keep editing your request while we wait.
          </p>
          <div class="fallback-actions">
            <button class="secondary" type="button" on:click={openLocationModal}>Try again</button>
            <button class="ghost" type="button" on:click={focusRequestField}>Edit request</button>
          </div>
        </div>
      {/if}

      {#if errorMessage}
        <p class="error">{errorMessage}</p>
      {/if}

      <button class="cta" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Ask the City"}
      </button>
    </form>
  </div>
</section>

{#if isLocationModalOpen}
  <div class="modal-backdrop" role="presentation">
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="location-modal-title">
      <h2 id="location-modal-title">Share your location?</h2>
      <p>
        We use your location once to match you with nearby partners who can respond faster.
      </p>
      <ul>
        <li>Only shared when you approve.</li>
        <li>Stored with your request so providers can help.</li>
        <li>Never sold or used for ads.</li>
      </ul>
      <div class="modal-actions">
        <button class="secondary" type="button" on:click={() => (isLocationModalOpen = false)}>
          Not now
        </button>
        <button class="primary" type="button" on:click={requestLocation}>
          Yes, share location
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  :global(body) {
    margin: 0;
    background: #f5f6fb;
    font-family: "Inter", system-ui, -apple-system, sans-serif;
  }

  .page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px 16px;
    position: relative;
    overflow: hidden;
    background-image: radial-gradient(circle at 10% 10%, #ffffff, #f5f6fb 55%),
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'%3E%3Cg fill='none' stroke='%23dfe3ee' stroke-width='2' opacity='0.5'%3E%3Cpath d='M60 120c80-50 200-40 300 20s190 70 320 40'/%3E%3Cpath d='M40 260c100-30 220-10 340 40s210 60 340 20'/%3E%3Cpath d='M80 420c120-60 240-40 360 10s210 80 300 40'/%3E%3C/g%3E%3Ccircle cx='140' cy='180' r='10' fill='%23e4e8f4'/%3E%3Ccircle cx='520' cy='260' r='14' fill='%23e4e8f4'/%3E%3Ccircle cx='300' cy='420' r='12' fill='%23e4e8f4'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
  }

  .page::before {
    content: "";
    position: absolute;
    inset: 10% auto auto 50%;
    width: 520px;
    height: 520px;
    transform: translateX(-50%);
    background: radial-gradient(circle, rgba(90, 112, 255, 0.35), rgba(90, 112, 255, 0.08) 45%, transparent 70%);
    filter: blur(2px);
    opacity: 0.9;
    pointer-events: none;
  }

  .route-toggle {
    position: absolute;
    top: 24px;
    right: 24px;
  }

  .route-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.8);
    border: 1px solid #e1e5f2;
    font-size: 12px;
    font-weight: 600;
    color: #4b5168;
    text-decoration: none;
  }

  .route-link:hover {
    color: #2f3652;
    border-color: #cfd6eb;
  }

  .card {
    width: min(620px, 100%);
    background: rgba(255, 255, 255, 0.9);
    border-radius: 28px;
    padding: 36px;
    box-shadow: 0 32px 60px rgba(15, 23, 42, 0.12), 0 6px 16px rgba(15, 23, 42, 0.08);
    backdrop-filter: blur(6px);
    border: 1px solid rgba(255, 255, 255, 0.6);
    position: relative;
    z-index: 1;
  }

  .header {
    margin-bottom: 24px;
  }

  .eyebrow {
    text-transform: uppercase;
    letter-spacing: 0.15em;
    font-size: 12px;
    font-weight: 600;
    color: #7c8199;
    margin: 0 0 12px;
  }

  h1 {
    font-size: 38px;
    line-height: 1.15;
    margin: 0 0 12px;
    color: #1c2238;
  }

  .subtitle {
    margin: 0;
    color: #545a72;
    font-size: 16px;
    line-height: 1.6;
  }

  .form {
    display: grid;
    gap: 22px;
  }

  .label {
    font-size: 14px;
    font-weight: 600;
    color: #2d3348;
  }

  textarea {
    width: 100%;
    border-radius: 18px;
    border: 1px solid #dde2f2;
    padding: 18px;
    font-size: 16px;
    resize: vertical;
    min-height: 140px;
    box-shadow: inset 0 2px 6px rgba(15, 23, 42, 0.06);
  }

  textarea:focus {
    outline: 2px solid rgba(96, 103, 232, 0.2);
    border-color: #9aa2f2;
  }

  .location-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 18px 20px;
    border-radius: 18px;
    border: 1px solid #e2e7f4;
    background: #f7f8fe;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
  }

  .location-label {
    margin: 0 0 4px;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: #8a8fa6;
  }

  .location-value {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #2a2f43;
  }

  .location-subtext {
    margin: 4px 0 0;
    font-size: 13px;
    color: #69708a;
  }

  .chip {
    border: none;
    background: #e6ebff;
    color: #2f3a78;
    padding: 10px 18px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
  }

  .chip:hover {
    background: #dde1f4;
  }

  .location-fallback {
    border-radius: 18px;
    border: 1px solid #f3c4c4;
    background: #fff5f5;
    padding: 16px 18px;
    display: grid;
    gap: 10px;
  }

  .fallback-title {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: #8a1c1c;
  }

  .fallback-body {
    margin: 0;
    font-size: 14px;
    color: #8a1c1c;
  }

  .fallback-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .secondary,
  .ghost {
    border-radius: 999px;
    padding: 10px 16px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
  }

  .secondary {
    border: none;
    background: #fde0e0;
    color: #8a1c1c;
  }

  .secondary:hover {
    background: #f9d2d2;
  }

  .ghost {
    border: 1px solid #f3c4c4;
    background: transparent;
    color: #8a1c1c;
  }

  .ghost:hover {
    background: rgba(138, 28, 28, 0.08);
  }

  .error {
    margin: 0;
    color: #b42318;
    font-size: 14px;
  }

  .cta {
    width: 100%;
    border: none;
    border-radius: 18px;
    padding: 16px 20px;
    font-size: 16px;
    font-weight: 600;
    color: #ffffff;
    background: linear-gradient(135deg, #1d4ed8, #3b82f6);
    cursor: pointer;
    box-shadow: 0 16px 30px rgba(37, 99, 235, 0.28);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .cta:hover {
    transform: translateY(-1px);
    box-shadow: 0 18px 36px rgba(37, 99, 235, 0.32);
  }

  .cta:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    z-index: 10;
  }

  .modal {
    width: min(520px, 100%);
    background: #ffffff;
    border-radius: 24px;
    padding: 28px;
    box-shadow: 0 24px 60px rgba(15, 23, 42, 0.22);
    display: grid;
    gap: 16px;
  }

  .modal h2 {
    margin: 0;
    font-size: 22px;
    color: #1c2238;
  }

  .modal p {
    margin: 0;
    color: #4b5168;
    line-height: 1.6;
  }

  .modal ul {
    margin: 0;
    padding-left: 18px;
    color: #4b5168;
    display: grid;
    gap: 6px;
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }

  .primary {
    border: none;
    border-radius: 999px;
    padding: 10px 18px;
    font-size: 13px;
    font-weight: 600;
    color: #ffffff;
    background: #1d4ed8;
    cursor: pointer;
  }

  .primary:hover {
    background: #1a46c5;
  }

  @media (max-width: 640px) {
    .card {
      padding: 24px;
    }

    h1 {
      font-size: 28px;
    }
  }
</style>
