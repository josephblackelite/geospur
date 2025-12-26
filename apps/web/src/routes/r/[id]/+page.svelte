<script lang="ts">
  import { onDestroy } from "svelte";
  import { page } from "$app/stores";
  import { updateProfile } from "firebase/auth";
  import RadarBackdrop from "$components/RadarBackdrop.svelte";
  import OfferCard from "$components/OfferCard.svelte";
  import OtpModal from "$components/OtpModal.svelte";
  import NameModal from "$components/NameModal.svelte";
  import { currentUser } from "$lib/auth";
  import {
    auth,
    listenToOffers,
    listenToRequest,
    type OfferDoc,
    type RequestDoc,
  } from "$lib/firebase";

  type RequestData = RequestDoc & { id: string };
  type OfferData = OfferDoc & {
    id: string;
    businessName?: string;
    distanceMiles?: number;
    distanceText?: string;
  };

  let requestId = "";
  let request: RequestData | null = null;
  let offers: OfferData[] = [];
  let userName = "";

  let showOtpModal = false;
  let otpVerified = false;
  let otpError = "";
  let isRoutingRequest = false;

  let showNameModal = false;
  let nameError = "";
  let isSavingName = false;
  let hasSeenFirstOffer = false;

  let otpTimer: ReturnType<typeof setTimeout> | null = null;
  let unsubscribeRequest: (() => void) | null = null;
  let unsubscribeOffers: (() => void) | null = null;
  let activeRequestId = "";

  const unsubscribeUser = currentUser.subscribe((user) => {
    userName = user?.displayName?.trim() ?? "";
  });

  const startOtpTimer = () => {
    if (otpTimer) {
      clearTimeout(otpTimer);
    }

    otpTimer = setTimeout(() => {
      if (!otpVerified) {
        showOtpModal = true;
      }
    }, 1000);
  };

  const ensureSubscriptions = (id: string) => {
    if (unsubscribeRequest) {
      unsubscribeRequest();
      unsubscribeRequest = null;
    }

    if (unsubscribeOffers) {
      unsubscribeOffers();
      unsubscribeOffers = null;
    }

    request = null;
    offers = [];
    showOtpModal = false;
    otpVerified = false;
    otpError = "";
    showNameModal = false;
    nameError = "";
    hasSeenFirstOffer = false;

    if (!id) {
      return;
    }

    unsubscribeRequest = listenToRequest(id, (data) => {
      request = data;
      if (data?.status === "draft" && !otpVerified) {
        showOtpModal = true;
      }
    });

    unsubscribeOffers = listenToOffers(id, (data) => {
      offers = data;
      if (!hasSeenFirstOffer && data.length > 0) {
        hasSeenFirstOffer = true;
        if (!userName) {
          showNameModal = true;
        }
      }
    });
  };

  const handleOtpVerify = async (event: CustomEvent<{ code: string }>) => {
    if (otpVerified) {
      showOtpModal = false;
      return;
    }

    otpError = "";
    const code = event.detail.code.trim();

    if (code.length < 6) {
      otpError = "Enter the full 6-digit code.";
      return;
    }

    if (!requestId) {
      otpError = "Missing request ID.";
      return;
    }

    const token = await auth.currentUser?.getIdToken();
    if (!token) {
      otpError = "Sign in to verify your request.";
      return;
    }

    isRoutingRequest = true;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL ?? ""}/route-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ requestId }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? "Failed to route the request.");
      }

      otpVerified = true;
      showOtpModal = false;
    } catch (error) {
      otpError = (error as Error).message;
    } finally {
      isRoutingRequest = false;
    }
  };

  const handleNameSubmit = async (event: CustomEvent<{ name: string }>) => {
    nameError = "";
    const trimmed = event.detail.name.trim();

    if (!trimmed) {
      nameError = "Add a name to continue.";
      return;
    }

    if (!auth.currentUser) {
      nameError = "Sign in to save your name.";
      return;
    }

    isSavingName = true;

    try {
      await updateProfile(auth.currentUser, { displayName: trimmed });
      userName = trimmed;
      showNameModal = false;
    } catch (error) {
      nameError = (error as Error).message;
    } finally {
      isSavingName = false;
    }
  };

  const formatDistance = (offer: OfferData) => {
    if (offer.distanceText) {
      return offer.distanceText;
    }

    if (typeof offer.distanceMiles === "number") {
      return `${offer.distanceMiles.toFixed(1)} mi`;
    }

    return "Nearby";
  };

  onDestroy(() => {
    if (otpTimer) {
      clearTimeout(otpTimer);
    }
    unsubscribeUser();
    if (unsubscribeRequest) {
      unsubscribeRequest();
    }
    if (unsubscribeOffers) {
      unsubscribeOffers();
    }
  });

  $: requestId = $page.params.id ?? "";
  $: if (requestId !== activeRequestId) {
    activeRequestId = requestId;
    ensureSubscriptions(requestId);
    startOtpTimer();
  }
</script>

<svelte:head>
  <title>GeoSpur | Routing {requestId}</title>
</svelte:head>

<RadarBackdrop />

<main class="route">
  <section class="hero">
    <p class="eyebrow">Broadcasting</p>
    <h1>Pinging nearby guides and couriers.</h1>
    <p class="subtitle">Hold tight—we&apos;ll surface the best options as soon as they reply.</p>
  </section>

  <section class="status">
    <div class="status-card">
      <p class="label">Request</p>
      <p class="value">{requestId}</p>
    </div>
    <div class="status-card">
      <p class="label">Status</p>
      <p class="value">{request?.status ?? "Waiting"}</p>
    </div>
    <div class="status-card">
      <p class="label">Offers</p>
      <p class="value">{offers.length}</p>
    </div>
  </section>

  <section class="timeline">
    <div class={request?.status === "broadcasting" ? "step active" : "step"}>
      <div class="dot"></div>
      <div>
        <h3>Broadcasting now</h3>
        <p>We&apos;re matching your request with the best local partners.</p>
      </div>
    </div>
    <div class={offers.length > 0 ? "step active" : "step"}>
      <div class="dot"></div>
      <div>
        <h3>Offers arriving</h3>
        <p>Review messages, pricing, and ETA as they come in.</p>
      </div>
    </div>
    <div class="step">
      <div class="dot"></div>
      <div>
        <h3>Pick your favorite</h3>
        <p>Accept when you&apos;re ready and we&apos;ll open the chat.</p>
      </div>
    </div>
  </section>
</main>

{#if offers.length > 0}
  <aside class="offer-stack">
    {#each offers as offer, index (offer.id)}
      <OfferCard
        businessName={offer.businessName ?? offer.businessId}
        distance={formatDistance(offer)}
        message={offer.message}
        price={offer.price ?? null}
        photoUrls={offer.photoUrls ?? []}
        index={index}
      />
    {/each}
  </aside>
{/if}

{#if showOtpModal}
  <OtpModal on:verify={handleOtpVerify} error={otpError} isSubmitting={isRoutingRequest} />
{/if}

{#if showNameModal}
  <NameModal
    on:submit={handleNameSubmit}
    error={nameError}
    isSubmitting={isSavingName}
    initialValue={userName}
  />
{/if}

<style>
  :global(body) {
    background: #020617;
  }

  .route {
    position: relative;
    z-index: 2;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    gap: 2rem;
    padding: 4rem 1.5rem 6rem;
    color: #f8fafc;
    max-width: 960px;
    margin: 0 auto;
  }

  .hero {
    text-align: center;
    display: grid;
    gap: 0.75rem;
  }

  .eyebrow {
    text-transform: uppercase;
    letter-spacing: 0.2em;
    font-size: 0.75rem;
    color: #7dd3fc;
  }

  .subtitle {
    color: #cbd5f5;
    max-width: 620px;
    margin: 0 auto;
  }

  .status {
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  }

  .status-card {
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(148, 163, 184, 0.2);
    border-radius: 1.25rem;
    padding: 1.25rem;
  }

  .label {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: #94a3b8;
  }

  .value {
    margin-top: 0.5rem;
    font-size: 1.1rem;
    font-weight: 600;
    word-break: break-word;
  }

  .timeline {
    display: grid;
    gap: 1.5rem;
  }

  .offer-stack {
    position: fixed;
    right: 1.5rem;
    bottom: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: min(360px, calc(100vw - 3rem));
    z-index: 3;
  }

  .step {
    display: flex;
    gap: 1rem;
    padding: 1.25rem;
    border-radius: 1.25rem;
    background: rgba(15, 23, 42, 0.4);
    border: 1px solid rgba(148, 163, 184, 0.15);
  }

  .step.active {
    background: rgba(14, 165, 233, 0.15);
    border-color: rgba(14, 165, 233, 0.35);
  }

  .dot {
    width: 12px;
    height: 12px;
    border-radius: 999px;
    margin-top: 0.35rem;
    background: #38bdf8;
    box-shadow: 0 0 10px rgba(56, 189, 248, 0.75);
  }

  .step h3 {
    margin: 0;
  }

  .step p {
    margin-top: 0.35rem;
    color: #cbd5f5;
  }

  @media (max-width: 900px) {
    .offer-stack {
      position: static;
      width: 100%;
      margin-top: 2rem;
    }
  }
</style>
