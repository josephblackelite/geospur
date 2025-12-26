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
    background: #f8fafc;
  }

  .page {
    padding: 2.5rem 0 4rem;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 2rem;
    margin-bottom: 2.5rem;
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
  }

  .subtitle {
    margin: 0;
    color: #475569;
    font-size: 1.05rem;
  }

  .status-toggle {
    background: white;
    border-radius: 1.25rem;
    border: 1px solid #e2e8f0;
    padding: 1.25rem 1.5rem;
    min-width: 260px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
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
    padding: 0.6rem 1.5rem;
    font-weight: 600;
    background: #e2e8f0;
    color: #0f172a;
    cursor: pointer;
  }

  .toggle.on {
    background: #22c55e;
    color: white;
  }

  .requests {
    display: grid;
    gap: 1rem;
  }

  .request-card {
    border: none;
    width: 100%;
    text-align: left;
    padding: 1.25rem 1.5rem;
    border-radius: 1.25rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .request-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 18px 35px rgba(15, 23, 42, 0.15);
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
    color: #0f172a;
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
    border-radius: 1.5rem 1.5rem 0 0;
    padding: 1.5rem 2rem 2rem;
    box-shadow: 0 -20px 40px rgba(15, 23, 42, 0.2);
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
    background: #e2e8f0;
    color: #0f172a;
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
    background: #f8fafc;
    border-radius: 1rem;
    padding: 1rem 1.25rem;
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
    border: 1px solid #e2e8f0;
    border-radius: 0.75rem;
    padding: 0.75rem 1rem;
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
    padding: 0.7rem 1.5rem;
    font-weight: 600;
    cursor: pointer;
    background: #0ea5e9;
    color: white;
  }

  .sheet-actions .secondary {
    background: white;
    color: #0ea5e9;
    border: 1px solid #bae6fd;
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
