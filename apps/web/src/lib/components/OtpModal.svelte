<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let error = "";
  export let isSubmitting = false;

  const dispatch = createEventDispatcher<{ verify: { code: string } }>();

  let code = "";

  const handleSubmit = (event: Event) => {
    event.preventDefault();
    dispatch("verify", { code });
  };
</script>

<div class="overlay" role="dialog" aria-modal="true" aria-labelledby="otp-title">
  <div class="modal">
    <h2 id="otp-title">Verify your number</h2>
    <p class="subtitle">
      Enter the 6-digit code we just sent. Once verified, we&apos;ll continue broadcasting your
      request.
    </p>

    <form class="form" on:submit={handleSubmit}>
      <label class="label" for="otp">One-time passcode</label>
      <input
        id="otp"
        class="input"
        type="text"
        inputmode="numeric"
        maxlength="6"
        placeholder="000000"
        bind:value={code}
      />

      {#if error}
        <p class="error" role="alert">{error}</p>
      {/if}

      <button class="submit" type="submit" disabled={isSubmitting || code.trim().length < 6}>
        {isSubmitting ? "Verifying..." : "Verify & continue"}
      </button>
    </form>
  </div>
</div>

<style>
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(2, 6, 23, 0.72);
    display: grid;
    place-items: center;
    z-index: 20;
    padding: 1.5rem;
  }

  .modal {
    width: min(420px, 100%);
    background: #0f172a;
    border-radius: 1.5rem;
    padding: 2rem;
    color: #f8fafc;
    box-shadow: 0 24px 60px rgba(15, 23, 42, 0.4);
    border: 1px solid rgba(148, 163, 184, 0.2);
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
    font-size: 1.1rem;
    letter-spacing: 0.3rem;
    text-align: center;
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
