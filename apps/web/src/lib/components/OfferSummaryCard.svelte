<script>
  export let confirmedArrival = 'Confirmed arrival: 9:45 AM';
  export let estimate = 'Estimate: 15-20 min';
  export let onAccept = () => {};
  export let onDecline = () => {};
</script>

<section class="offer-card" aria-label="Offer summary">
  <div class="offer-details">
    <p class="offer-title">Offer summary</p>
    <p class="offer-line">{confirmedArrival}</p>
    <p class="offer-line">{estimate}</p>
  </div>
  <div class="offer-actions">
    <button class="accept" type="button" on:click={onAccept}>ACCEPT OFFER</button>
    <button class="decline" type="button" on:click={onDecline}>DECLINE</button>
  </div>
</section>

<style>
  .offer-card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 1.25rem;
    padding: 1.25rem 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .offer-title {
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: 0.75rem;
    font-weight: 700;
    color: #64748b;
    margin: 0 0 0.5rem;
  }

  .offer-line {
    margin: 0;
    font-weight: 600;
    color: #0f172a;
  }

  .offer-actions {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  button {
    border: none;
    border-radius: 999px;
    padding: 0.75rem 1.5rem;
    font-weight: 700;
    letter-spacing: 0.02em;
    cursor: pointer;
  }

  .accept {
    background: #16a34a;
    color: white;
  }

  .decline {
    background: #e2e8f0;
    color: #334155;
  }
</style>
