<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let error = "";
  export let isSubmitting = false;
  export let initialValue = "";

  const dispatch = createEventDispatcher<{ submit: { name: string } }>();

  let name = initialValue;

  const handleSubmit = (event: Event) => {
    event.preventDefault();
    dispatch("submit", { name });
  };
</script>

<div class="overlay" role="dialog" aria-modal="true" aria-labelledby="name-title">
  <div class="modal">
    <h2 id="name-title">Before the first offer arrives</h2>
    <p class="subtitle">Add a name so businesses know who they&apos;re helping.</p>

    <form class="form" on:submit={handleSubmit}>
      <label class="label" for="name">Your name</label>
      <input
        id="name"
        class="input"
        type="text"
        placeholder="Jordan Lee"
        bind:value={name}
      />

      {#if error}
        <p class="error" role="alert">{error}</p>
      {/if}

      <button class="submit" type="submit" disabled={isSubmitting || name.trim().length === 0}>
        {isSubmitting ? "Saving..." : "Continue"}
      </button>
    </form>
  </div>
</div>

<style>
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(2, 6, 23, 0.7);
    display: grid;
    place-items: center;
    z-index: 18;
    padding: 1.5rem;
  }

  .modal {
    width: min(420px, 100%);
    background: #0f172a;
    border-radius: 1.5rem;
    padding: 2rem;
    color: #f8fafc;
    border: 1px solid rgba(148, 163, 184, 0.2);
    box-shadow: 0 20px 50px rgba(15, 23, 42, 0.4);
  }

  .subtitle {
    color: #cbd5f5;
    margin-top: 0.5rem;
    margin-bottom: 1.5rem;
  }

  .form {
    display: grid;
    gap: 0.75rem;
  }

  .label {
    font-size: 0.9rem;
    color: #e2e8f0;
  }

  .input {
    padding: 0.85rem 1rem;
    border-radius: 0.9rem;
    border: 1px solid rgba(148, 163, 184, 0.35);
    background: rgba(15, 23, 42, 0.6);
    color: #f8fafc;
    font-size: 1rem;
  }

  .error {
    color: #fecaca;
    font-size: 0.9rem;
  }

  .submit {
    margin-top: 0.5rem;
    border: none;
    border-radius: 999px;
    padding: 0.85rem 1rem;
    background: #38bdf8;
    color: #0f172a;
    font-weight: 600;
    cursor: pointer;
  }

  .submit:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
</style>
