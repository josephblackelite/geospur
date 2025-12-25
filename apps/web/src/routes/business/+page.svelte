<svelte:head>
  <title>GeoSpur | Business</title>
</svelte:head>

<section class="hero">
  <p class="eyebrow">Business</p>
  <h1>Tools for destination teams and partners.</h1>
  <p class="subtitle">
    This placeholder highlights analytics, visitor insights, and messaging tools
    for business customers.
  </p>
  <div class="actions">
    <button>Request a demo</button>
    <button class="secondary">View case studies</button>
  </div>
</section>

<section class="details">
  <div>
    <h2>Audience insights</h2>
    <p>Track demand patterns and segment travelers by intent.</p>
  </div>
  <div>
    <h2>Campaign orchestration</h2>
    <p>Launch targeted geo-campaigns with real-time performance updates.</p>
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
    color: #0ea5e9;
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
    background: #0ea5e9;
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 999px;
    font-weight: 600;
  }

  .secondary {
    background: white;
    color: #0ea5e9;
    border: 1px solid #bae6fd;
  }

  .details {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1.5rem;
    margin-top: 3rem;
  }

  .details div {
    background: white;
    padding: 1.5rem;
    border-radius: 1rem;
    border: 1px solid #e2e8f0;
  }
</style>
