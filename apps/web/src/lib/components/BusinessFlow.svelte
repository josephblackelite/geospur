<script lang="ts">
  import OfferResponseForm from "$components/OfferResponseForm.svelte";

  const steps = [
    {
      title: "Profile creation",
      description: "Set up your business profile and service category.",
    },
    {
      title: "Online toggle",
      description: "Go online to receive nearby requests.",
    },
    {
      title: "Deliveries inbox",
      description: "Review and prioritize incoming opportunities.",
    },
    {
      title: "Respond with offer",
      description: "Send a response with pricing, ETA, and photos.",
    },
    {
      title: "Chat",
      description: "Coordinate the delivery or service in real time.",
    },
  ];

  let activeStep = 0;
  let isOnline = true;

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

  const openOfferComposer = () => {
    activeStep = 3;
  };

  const jumpToChat = () => {
    activeStep = 4;
  };
</script>

<section class="hero">
  <p class="eyebrow">Business flow</p>
  <h1>Convert demand into fulfilled deliveries.</h1>
  <p class="subtitle">
    Walk through the full merchant journey from onboarding to chat-based coordination.
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
      <div class="form-grid">
        <div class="field">
          <label for="business-name">Business name</label>
          <input id="business-name" type="text" placeholder="Summit Rentals" />
        </div>
        <div class="field">
          <label for="business-category">Category</label>
          <input id="business-category" type="text" placeholder="Outdoor gear rental" />
        </div>
        <div class="field">
          <label for="service-radius">Service radius</label>
          <input id="service-radius" type="text" placeholder="5 miles" />
        </div>
        <div class="field">
          <label for="business-about">About</label>
          <textarea
            id="business-about"
            rows="4"
            placeholder="We deliver camera gear in under 30 minutes."
          ></textarea>
        </div>
      </div>
      <div class="actions">
        <button class="secondary" on:click={prevStep} disabled={activeStep === 0}>
          Back
        </button>
        <button on:click={nextStep}>Save profile</button>
      </div>
    {:else if activeStep === 1}
      <div class="toggle-card">
        <div>
          <h3>Availability</h3>
          <p>Toggle online status to receive new requests.</p>
        </div>
        <button class={isOnline ? "toggle on" : "toggle"} on:click={() => (isOnline = !isOnline)}>
          {isOnline ? "Online" : "Offline"}
        </button>
      </div>
      <div class="actions">
        <button class="secondary" on:click={prevStep}>Back</button>
        <button on:click={nextStep}>View inbox</button>
      </div>
    {:else if activeStep === 2}
      <div class="inbox">
        <article>
          <div>
            <h3>Request #AC-1283</h3>
            <p>Camera rental · Union Station · 20 mins ago</p>
          </div>
          <button on:click={openOfferComposer}>Respond</button>
        </article>
        <article>
          <div>
            <h3>Request #BK-5521</h3>
            <p>Guided tour add-on · LoDo district · 35 mins ago</p>
          </div>
          <button class="secondary" on:click={openOfferComposer}>Respond</button>
        </article>
      </div>
      <div class="actions">
        <button class="secondary" on:click={prevStep}>Back</button>
        <button on:click={nextStep}>Skip to offer</button>
      </div>
    {:else if activeStep === 3}
      <OfferResponseForm on:sent={jumpToChat} />
      <div class="actions">
        <button class="secondary" on:click={prevStep}>Back</button>
        <button on:click={jumpToChat}>Jump to chat</button>
      </div>
    {:else}
      <div class="chat">
        <div class="bubble outbound">
          <p>Thanks! I can deliver the Sony A7 IV by 3 PM for $45.</p>
          <span>You · 2:18 PM</span>
        </div>
        <div class="bubble inbound">
          <p>Perfect. I’ll be by the entrance. Could you text me when you’re close?</p>
          <span>Traveler · 2:19 PM</span>
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
    color: #0ea5e9;
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
    border-color: #0ea5e9;
    box-shadow: 0 10px 25px rgba(14, 165, 233, 0.15);
    opacity: 1;
  }

  .index {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background: #e0f2fe;
    color: #0369a1;
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
    background: #0ea5e9;
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 999px;
    font-weight: 600;
    cursor: pointer;
  }

  .secondary {
    background: white;
    color: #0ea5e9;
    border: 1px solid #bae6fd;
  }

  .toggle-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem;
    border-radius: 1rem;
    border: 1px solid #e2e8f0;
    background: #f8fafc;
  }

  .toggle {
    background: #e2e8f0;
    color: #0f172a;
  }

  .toggle.on {
    background: #22c55e;
    color: white;
  }

  .inbox {
    display: grid;
    gap: 1rem;
  }

  .inbox article {
    border: 1px solid #e2e8f0;
    border-radius: 1rem;
    padding: 1rem 1.25rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    background: #f8fafc;
  }

  .inbox h3 {
    margin: 0 0 0.25rem;
  }

  .inbox p {
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

    .inbox article {
      flex-direction: column;
      align-items: flex-start;
    }
  }
</style>
