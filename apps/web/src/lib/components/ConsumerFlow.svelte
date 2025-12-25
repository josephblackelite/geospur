<script lang="ts">
  const steps = [
    {
      title: "Landing",
      description: "Showcase curated destinations and start a request.",
    },
    {
      title: "Draft request",
      description: "Capture the location, time, and what you need.",
    },
    {
      title: "OTP gate",
      description: "Verify the requester before sharing the request.",
    },
    {
      title: "Broadcasting",
      description: "Send the request to relevant nearby businesses.",
    },
    {
      title: "Offers",
      description: "Review incoming offers side by side.",
    },
    {
      title: "Accept",
      description: "Confirm the best offer and lock it in.",
    },
    {
      title: "Chat",
      description: "Coordinate in real time after acceptance.",
    },
  ];

  let activeStep = 0;

  const nextStep = () => {
    if (activeStep < steps.length - 1) {
      activeStep += 1;
    }
  };

  const prevStep = () => {
    if (activeStep > 0) {
      activeStep -= 1;
    }
  };

  const acceptOffer = () => {
    activeStep = 5;
  };
</script>

<section class="hero">
  <p class="eyebrow">Consumer flow</p>
  <h1>From discovery to delivery, in one streamlined request.</h1>
  <p class="subtitle">
    Step through the full consumer journey—from landing to chat—to validate the touchpoints
    and UI states.
  </p>
</section>

<section class="flow">
  <div class="timeline">
    {#each steps as step, index}
      <div class={index === activeStep ? "timeline-item active" : "timeline-item"}>
        <div class="index">{index + 1}</div>
        <div>
          <h3>{step.title}</h3>
          <p>{step.description}</p>
        </div>
      </div>
    {/each}
  </div>

  <div class="panel">
    <header>
      <h2>{steps[activeStep].title}</h2>
      <p>{steps[activeStep].description}</p>
    </header>

    {#if activeStep === 0}
      <div class="card">
        <h3>Welcome to GeoSpur</h3>
        <p>
          Browse curated destinations, compare guides, and start a request the moment you need
          help on the ground.
        </p>
        <button on:click={nextStep}>Draft a request</button>
      </div>
    {:else if activeStep === 1}
      <div class="form-grid">
        <div class="field">
          <label for="pickup">Pickup location</label>
          <input id="pickup" type="text" placeholder="Union Station, Denver" />
        </div>
        <div class="field">
          <label for="need">Need</label>
          <input id="need" type="text" placeholder="Same-day camera rental" />
        </div>
        <div class="field">
          <label for="details">Details</label>
          <textarea id="details" rows="4" placeholder="Any requirements or preferred brands?"></textarea>
        </div>
      </div>
      <div class="actions">
        <button class="secondary" on:click={prevStep}>Back</button>
        <button on:click={nextStep}>Continue to OTP</button>
      </div>
    {:else if activeStep === 2}
      <div class="otp">
        <div>
          <h3>Verify your phone</h3>
          <p>Enter the 6-digit code sent to +1 (555) 012-0932.</p>
        </div>
        <div class="otp-inputs">
          <input type="text" maxlength="1" />
          <input type="text" maxlength="1" />
          <input type="text" maxlength="1" />
          <input type="text" maxlength="1" />
          <input type="text" maxlength="1" />
          <input type="text" maxlength="1" />
        </div>
      </div>
      <div class="actions">
        <button class="secondary" on:click={prevStep}>Back</button>
        <button on:click={nextStep}>Verify &amp; broadcast</button>
      </div>
    {:else if activeStep === 3}
      <div class="broadcast">
        <div>
          <h3>Broadcasting to nearby partners</h3>
          <p>GeoSpur is notifying 14 businesses within a 3-mile radius.</p>
        </div>
        <div class="status-pill">Live · 00:18</div>
      </div>
      <ul class="signal-list">
        <li>Outdoor &amp; camera shops</li>
        <li>Local guides and concierges</li>
        <li>On-demand couriers</li>
      </ul>
      <div class="actions">
        <button class="secondary" on:click={prevStep}>Back</button>
        <button on:click={nextStep}>View offers</button>
      </div>
    {:else if activeStep === 4}
      <div class="offers">
        <article>
          <h3>Summit Rentals</h3>
          <p>$45/day · Ready in 20 mins</p>
          <button on:click={acceptOffer}>Accept offer</button>
        </article>
        <article>
          <h3>Peak Photo Lab</h3>
          <p>$52/day · Free delivery in 30 mins</p>
          <button class="secondary" on:click={acceptOffer}>Accept offer</button>
        </article>
        <article>
          <h3>Streetwise Guides</h3>
          <p>Custom tour add-on · Starts at $80</p>
          <button class="secondary" on:click={acceptOffer}>Accept offer</button>
        </article>
      </div>
      <div class="actions">
        <button class="secondary" on:click={prevStep}>Back</button>
        <button on:click={nextStep}>Skip to accept</button>
      </div>
    {:else if activeStep === 5}
      <div class="card">
        <h3>Offer accepted</h3>
        <p>Your request is now locked in with Summit Rentals. Start the chat to coordinate.</p>
        <button on:click={nextStep}>Open chat</button>
      </div>
    {:else}
      <div class="chat">
        <div class="bubble inbound">
          <p>We have the Sony A7 IV ready. Want it delivered or pickup?</p>
          <span>Summit Rentals · 2:14 PM</span>
        </div>
        <div class="bubble outbound">
          <p>Delivery please! I’ll be at the Union Station entrance.</p>
          <span>You · 2:15 PM</span>
        </div>
        <div class="composer">
          <input type="text" placeholder="Type a message" />
          <button>Send</button>
        </div>
      </div>
    {/if}
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
    max-width: 640px;
    color: #475569;
    font-size: 1.05rem;
    margin-bottom: 2rem;
  }

  .flow {
    display: grid;
    grid-template-columns: minmax(240px, 1fr) 2fr;
    gap: 2rem;
    align-items: start;
  }

  .timeline {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .timeline-item {
    display: flex;
    gap: 0.75rem;
    padding: 1rem;
    border-radius: 1rem;
    border: 1px solid #e2e8f0;
    background: white;
    opacity: 0.65;
  }

  .timeline-item.active {
    border-color: #6366f1;
    box-shadow: 0 10px 25px rgba(99, 102, 241, 0.15);
    opacity: 1;
  }

  .index {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background: #e0e7ff;
    color: #4338ca;
    font-weight: 700;
  }

  .panel {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 1.5rem;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  header h2 {
    margin: 0 0 0.25rem;
  }

  header p {
    margin: 0;
    color: #64748b;
  }

  .card {
    background: #f8fafc;
    border-radius: 1.25rem;
    padding: 1.5rem;
    border: 1px solid #e2e8f0;
  }

  .form-grid {
    display: grid;
    gap: 1rem;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  input,
  textarea {
    border: 1px solid #e2e8f0;
    border-radius: 0.75rem;
    padding: 0.75rem 1rem;
    font-size: 1rem;
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
    cursor: pointer;
  }

  .secondary {
    background: white;
    color: #2563eb;
    border: 1px solid #bfdbfe;
  }

  .otp {
    display: grid;
    gap: 1.5rem;
  }

  .otp-inputs {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 0.75rem;
  }

  .otp-inputs input {
    text-align: center;
    font-size: 1.2rem;
  }

  .broadcast {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #eef2ff;
    padding: 1.25rem;
    border-radius: 1rem;
  }

  .status-pill {
    background: #4f46e5;
    color: white;
    padding: 0.4rem 0.9rem;
    border-radius: 999px;
    font-weight: 600;
  }

  .signal-list {
    margin: 0;
    padding-left: 1.25rem;
    color: #475569;
  }

  .offers {
    display: grid;
    gap: 1rem;
  }

  .offers article {
    border: 1px solid #e2e8f0;
    border-radius: 1rem;
    padding: 1rem 1.25rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    background: #f8fafc;
  }

  .offers h3 {
    margin: 0 0 0.25rem;
  }

  .offers p {
    margin: 0;
    color: #475569;
  }

  .chat {
    display: grid;
    gap: 1rem;
  }

  .bubble {
    padding: 0.75rem 1rem;
    border-radius: 1rem;
    max-width: 75%;
  }

  .bubble p {
    margin: 0 0 0.25rem;
  }

  .bubble span {
    font-size: 0.75rem;
    color: #64748b;
  }

  .inbound {
    background: #e0f2fe;
  }

  .outbound {
    background: #dcfce7;
    margin-left: auto;
  }

  .composer {
    display: flex;
    gap: 0.75rem;
  }

  .composer input {
    flex: 1;
  }

  @media (max-width: 900px) {
    .flow {
      grid-template-columns: 1fr;
    }

    .offers article {
      flex-direction: column;
      align-items: flex-start;
    }
  }
</style>
