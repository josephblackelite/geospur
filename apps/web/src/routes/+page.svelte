<svelte:head>
  <title>GeoSpur | Consumer Landing</title>
</svelte:head>

<section class="hero">
  <p class="eyebrow">Consumer landing</p>
  <h1>Explore places, stories, and routes powered by GeoSpur.</h1>
  <p class="subtitle">
    This is a placeholder landing page for consumer experiences. We'll highlight
    discovery, personalization, and location-based recommendations here.
  </p>
  <div class="actions">
    <button>Get the app</button>
    <button class="secondary">Join the waitlist</button>
  </div>
</section>

<section class="grid">
  <div>
    <h2>Curated journeys</h2>
    <p>Browse thematic itineraries designed for your interests.</p>
  </div>
  <div>
    <h2>Live chat guides</h2>
    <p>Chat with local experts to refine your plans in real time.</p>
  </div>
  <div>
    <h2>Saved memories</h2>
    <p>Collect trip highlights and share them with friends.</p>
  </div>
</section>

<style>
  .hero {
    margin-top: 2rem;
  }

  .eyebrow {
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-weight: 700;
    color: #6366f1;
    font-size: 0.75rem;
  }

  h1 {
    font-size: clamp(2rem, 3vw, 3rem);
    margin: 0.5rem 0 1rem;
  }

  .subtitle {
    max-width: 600px;
    color: #475569;
    font-size: 1.05rem;
    margin-bottom: 2rem;
  }

  .actions {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  button {
    border: none;
    background: #2563eb;
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 999px;
    font-weight: 600;
  }

  .secondary {
    background: white;
    color: #2563eb;
    border: 1px solid #bfdbfe;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1.5rem;
    margin-top: 3rem;
  }

  .grid div {
    background: white;
    padding: 1.5rem;
    border-radius: 1rem;
    border: 1px solid #e2e8f0;
  }

  h2 {
    margin-top: 0;
  }
</style>
