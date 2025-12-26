<script>
  import { page } from '$app/stores';
  import OfferSummaryCard from '$lib/components/OfferSummaryCard.svelte';

  $: chatId = $page.params.id;

  let messages = [
    {
      role: 'assistant',
      text: 'Hi! Ask me anything about your trip or local recommendations.'
    },
    {
      role: 'user',
      text: 'Show me a sample itinerary for a weekend getaway.'
    }
  ];

  const addSystemMessage = (text) => {
    messages = [...messages, { role: 'system', text }];
  };

  const handleAcceptOffer = async () => {
    await fetch('/accept-offer', { method: 'POST' });
    addSystemMessage('Accepted — on the way');
  };
</script>

<svelte:head>
  <title>GeoSpur | Chat {chatId}</title>
</svelte:head>

<section class="chat">
  <OfferSummaryCard
    confirmedArrival="Confirmed arrival: 9:45 AM"
    estimate="Estimate: 15-20 min"
    onAccept={handleAcceptOffer}
  />

  <div class="header">
    <h1>Chat session {chatId}</h1>
    <p>Placeholder for the consumer chat experience.</p>
  </div>

  <div class="message-list">
    {#each messages as message}
      <div class={`message ${message.role}`}>
        <p>{message.text}</p>
      </div>
    {/each}
  </div>

  <div class="composer">
    <input type="text" placeholder="Type your message..." disabled />
    <button disabled>Send</button>
  </div>
</section>

<style>
  .chat {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .header p {
    color: #475569;
  }

  .message-list {
    display: grid;
    gap: 1rem;
  }

  .message {
    padding: 1rem 1.25rem;
    border-radius: 1rem;
    max-width: 520px;
  }

  .assistant {
    background: white;
    border: 1px solid #e2e8f0;
  }

  .user {
    justify-self: end;
    background: #dbeafe;
    color: #1e3a8a;
  }

  .system {
    justify-self: center;
    background: #f1f5f9;
    color: #475569;
    border: 1px dashed #cbd5f5;
    font-weight: 600;
  }

  .composer {
    display: flex;
    gap: 0.75rem;
  }

  input {
    flex: 1;
    padding: 0.75rem 1rem;
    border-radius: 999px;
    border: 1px solid #cbd5f5;
  }

  button {
    border: none;
    background: #2563eb;
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 999px;
    font-weight: 600;
  }
</style>
