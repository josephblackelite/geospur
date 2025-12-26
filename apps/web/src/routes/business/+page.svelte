<script lang="ts">
  import { onMount } from "svelte";
  import { role } from "$lib/stores/role";

  type RequestCard = {
    id: string;
    title: string;
    detail: string;
    location: string;
    receivedAt: string;
    createdAt: number;
    tint: "sea" | "sunset" | "violet" | "lime";
  };

  const requestCards: RequestCard[] = [
    {
      id: "RQ-1082",
      title: "Expedited bike delivery",
      detail: "2 e-bikes · Downtown hotel",
      location: "Union Station",
      receivedAt: "4 mins ago",
      createdAt: Date.now() - 1000 * 60 * 4,
      tint: "sea",
    },
    {
      id: "RQ-1077",
      title: "Last-minute photo shoot gear",
      detail: "Sony A7 IV · 24-70mm",
      location: "RiNo Arts District",
      receivedAt: "12 mins ago",
      createdAt: Date.now() - 1000 * 60 * 12,
      tint: "sunset",
    },
    {
      id: "RQ-1069",
      title: "Guided canyon tour request",
      detail: "Private guide · 2 adults",
      location: "Red Rocks",
      receivedAt: "28 mins ago",
      createdAt: Date.now() - 1000 * 60 * 28,
      tint: "violet",
    },
    {
      id: "RQ-1058",
      title: "Locker pickup for backpacks",
      detail: "Storage drop-off · 3 bags",
      location: "LoDo",
      receivedAt: "43 mins ago",
      createdAt: Date.now() - 1000 * 60 * 43,
      tint: "lime",
    },
  ];

  const sortedRequests = [...requestCards].sort((a, b) => b.createdAt - a.createdAt);

  let isOnline = true;
  let activeRequest: RequestCard | null = null;

  const openReplySheet = (request: RequestCard) => {
    activeRequest = request;
  };

  const closeReplySheet = () => {
    activeRequest = null;
  };

  onMount(() => {
    role.set("business");
  });
</script>

<svelte:head>
  <title>GeoSpur | Action Inbox</title>
</svelte:head>

<section class="page">
  <header class="route-toggle">
    <a class="route-link" href="/">Request view</a>
  </header>
  <header class="page-header">
    <div>
      <p class="eyebrow">Action Inbox</p>
      <h1>Action Inbox</h1>
      <p class="subtitle">Live Requests</p>
    </div>
    <div class="status-toggle">
      <div>
        <p class="toggle-label">Availability</p>
        <p class="toggle-helper">Switch to pause new arrivals.</p>
      </div>
      <button class={isOnline ? "toggle on" : "toggle"} on:click={() => (isOnline = !isOnline)}>
        {isOnline ? "Online" : "Offline"}
      </button>
    </div>
  </header>

  <section class="requests">
    {#each sortedRequests as request}
      <button
        class={`request-card tint-${request.tint}`}
        on:click={() => openReplySheet(request)}
      >
        <div class="request-main">
          <div>
            <p class="request-id">{request.id}</p>
            <h2>{request.title}</h2>
            <p class="request-detail">{request.detail}</p>
          </div>
          <div class="request-meta">
            <span>{request.location}</span>
            <span>{request.receivedAt}</span>
          </div>
        </div>
        <span class="cta">Reply</span>
      </button>
    {/each}
  </section>
</section>

{#if activeRequest}
  <div class="overlay" role="dialog" aria-modal="true" aria-label="Reply to request">
    <div class="sheet">
      <header>
        <div>
          <p class="request-id">{activeRequest.id}</p>
          <h2>Reply to request</h2>
          <p>{activeRequest.title}</p>
        </div>
        <button class="close" on:click={closeReplySheet} aria-label="Close reply sheet">×</button>
      </header>
      <div class="sheet-body">
        <div class="summary">
          <p class="label">Request details</p>
          <p>{activeRequest.detail}</p>
          <p class="meta">{activeRequest.location} · {activeRequest.receivedAt}</p>
        </div>
        <label for="reply-message">Message</label>
        <textarea
          id="reply-message"
          rows="4"
          placeholder="Share availability, pricing, and next steps."
        ></textarea>
        <div class="sheet-actions">
          <button class="secondary" on:click={closeReplySheet}>Close</button>
          <button>Send reply</button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  :global(body) {
    background: #f6f8fc;
    font-family: "Inter", system-ui, -apple-system, sans-serif;
  }

  .page {
    padding: 2.75rem 0 4.5rem;
    position: relative;
  }

  .page::before {
    content: "";
    position: absolute;
    top: -120px;
    right: -120px;
    width: 360px;
    height: 360px;
    background: radial-gradient(circle, rgba(59, 130, 246, 0.35), rgba(59, 130, 246, 0.1) 50%, transparent 70%);
    filter: blur(1px);
    pointer-events: none;
  }

  .page::after {
    content: "";
    position: absolute;
    bottom: -160px;
    left: -160px;
    width: 420px;
    height: 420px;
    background: radial-gradient(circle, rgba(125, 211, 252, 0.3), rgba(125, 211, 252, 0.08) 55%, transparent 70%);
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
    padding: 6px 14px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid #e2e8f0;
    font-size: 12px;
    font-weight: 600;
    color: #475569;
    text-decoration: none;
  }

  .route-link:hover {
    color: #0f172a;
    border-color: #cbd5f5;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 2rem;
    margin-bottom: 2.75rem;
    position: relative;
    z-index: 1;
  }

  .eyebrow {
    text-transform: uppercase;
    letter-spacing: 0.14em;
    font-weight: 700;
    color: #0ea5e9;
    font-size: 0.75rem;
  }

  h1 {
    margin: 0.35rem 0 0.5rem;
    font-size: clamp(2.25rem, 3vw, 3rem);
    line-height: 1.15;
  }

  .subtitle {
    margin: 0;
    color: #475569;
    font-size: 1.05rem;
    letter-spacing: 0.02em;
  }

  .status-toggle {
    background: white;
    border-radius: 1.5rem;
    border: 1px solid #e5eaf5;
    padding: 1.4rem 1.6rem;
    min-width: 260px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
    box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
    position: relative;
    z-index: 1;
  }

  .toggle-label {
    font-weight: 600;
    margin: 0 0 0.25rem;
  }

  .toggle-helper {
    margin: 0;
    color: #64748b;
    font-size: 0.9rem;
  }

  .toggle {
    border: none;
    border-radius: 999px;
    padding: 0.65rem 1.6rem;
    font-weight: 600;
    background: #e6ebf5;
    color: #1e293b;
    cursor: pointer;
  }

  .toggle.on {
    background: linear-gradient(135deg, #1d4ed8, #3b82f6);
    color: white;
  }

  .requests {
    display: grid;
    gap: 1.25rem;
    position: relative;
    z-index: 1;
  }

  .request-card {
    border: none;
    width: 100%;
    text-align: left;
    padding: 1.5rem 1.75rem;
    border-radius: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
    cursor: pointer;
    box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .request-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 22px 40px rgba(15, 23, 42, 0.16);
  }

  .request-main {
    display: flex;
    justify-content: space-between;
    gap: 2rem;
    flex: 1;
  }

  .request-id {
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-size: 0.7rem;
    font-weight: 700;
    color: #334155;
    margin: 0 0 0.35rem;
  }

  .request-detail {
    color: #475569;
    margin: 0.4rem 0 0;
  }

  .request-meta {
    display: grid;
    gap: 0.5rem;
    color: #475569;
    font-weight: 600;
    text-align: right;
  }

  .cta {
    font-weight: 700;
    color: #1d4ed8;
    background: rgba(37, 99, 235, 0.12);
    padding: 0.5rem 1.1rem;
    border-radius: 999px;
  }

  .tint-sea {
    background: linear-gradient(120deg, rgba(14, 165, 233, 0.15), rgba(186, 230, 253, 0.4));
  }

  .tint-sunset {
    background: linear-gradient(120deg, rgba(248, 113, 113, 0.18), rgba(254, 202, 202, 0.45));
  }

  .tint-violet {
    background: linear-gradient(120deg, rgba(139, 92, 246, 0.18), rgba(221, 214, 254, 0.5));
  }

  .tint-lime {
    background: linear-gradient(120deg, rgba(34, 197, 94, 0.18), rgba(187, 247, 208, 0.5));
  }

  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.45);
    display: grid;
    place-items: end center;
    padding: 2rem;
    z-index: 20;
  }

  .sheet {
    width: min(720px, 100%);
    background: white;
    border-radius: 1.75rem 1.75rem 0 0;
    padding: 1.75rem 2.25rem 2.25rem;
    box-shadow: 0 -24px 50px rgba(15, 23, 42, 0.25);
  }

  .sheet header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .sheet header h2 {
    margin: 0.35rem 0 0.25rem;
  }

  .sheet header p {
    margin: 0;
    color: #64748b;
  }

  .close {
    border: none;
    background: #e7ecf6;
    color: #1e293b;
    width: 36px;
    height: 36px;
    border-radius: 999px;
    font-size: 1.25rem;
    cursor: pointer;
  }

  .sheet-body {
    display: grid;
    gap: 1rem;
  }

  .summary {
    background: #f5f7fc;
    border-radius: 1.25rem;
    padding: 1.15rem 1.4rem;
  }

  .summary .label {
    text-transform: uppercase;
    letter-spacing: 0.14em;
    font-weight: 700;
    font-size: 0.7rem;
    color: #0ea5e9;
    margin-bottom: 0.5rem;
  }

  .summary .meta {
    color: #64748b;
    font-size: 0.9rem;
  }

  textarea {
    border: 1px solid #e1e7f3;
    border-radius: 1rem;
    padding: 0.85rem 1.1rem;
    font-size: 1rem;
    resize: vertical;
  }

  .sheet-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
  }

  .sheet-actions button {
    border: none;
    border-radius: 999px;
    padding: 0.75rem 1.6rem;
    font-weight: 600;
    cursor: pointer;
    background: linear-gradient(135deg, #1d4ed8, #3b82f6);
    color: white;
    box-shadow: 0 12px 24px rgba(37, 99, 235, 0.25);
  }

  .sheet-actions .secondary {
    background: white;
    color: #1d4ed8;
    border: 1px solid #bfdbfe;
    box-shadow: none;
  }

  @media (max-width: 900px) {
    .page-header {
      flex-direction: column;
    }

    .status-toggle {
      width: 100%;
    }

    .request-card {
      flex-direction: column;
      align-items: flex-start;
    }

    .request-main {
      flex-direction: column;
      gap: 1rem;
    }

    .request-meta {
      text-align: left;
    }
  }
</style>
