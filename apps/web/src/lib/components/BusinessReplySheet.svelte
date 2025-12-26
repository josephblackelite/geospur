<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { getDownloadURL, ref as storageRef, uploadBytes } from "firebase/storage";
  import { auth, storage } from "$lib/firebase";

  const dispatch = createEventDispatcher<{ sent: void }>();

  const maxPhotos = 3;
  const etaOptions = ["15m", "30m", "1h", "Today"] as const;

  export let requestId = "";
  export let businessId = "";

  let reply: "yes" | "no" | null = null;
  let eta: string | null = null;
  let note = "";
  let photos: File[] = [];
  let photoPreviews: string[] = [];
  let error = "";
  let isSubmitting = false;

  const resetPreviews = () => {
    photoPreviews.forEach((preview) => URL.revokeObjectURL(preview));
    photoPreviews = photos.map((photo) => URL.createObjectURL(photo));
  };

  const updatePhotos = (nextPhotos: File[]) => {
    photos = nextPhotos;
    resetPreviews();
  };

  const handlePhotoChange = (event: Event) => {
    const input = event.currentTarget as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = "";

    if (files.length === 0) {
      return;
    }

    const images = files.filter((file) => file.type.startsWith("image/"));

    if (images.length !== files.length) {
      error = "Only image files can be attached.";
    }

    const combined = [...photos, ...images];

    if (combined.length > maxPhotos) {
      error = `You can attach up to ${maxPhotos} photos.`;
      updatePhotos(combined.slice(0, maxPhotos));
      return;
    }

    error = "";
    updatePhotos(combined);
  };

  const removePhoto = (index: number) => {
    const nextPhotos = photos.filter((_, idx) => idx !== index);
    updatePhotos(nextPhotos);
  };

  const uploadPhotos = async (): Promise<string[]> => {
    if (photos.length === 0) {
      return [];
    }

    if (!requestId.trim() || !businessId.trim()) {
      throw new Error("Request and business IDs are required before uploading photos.");
    }

    const uploads = photos.map(async (photo) => {
      const photoId = crypto.randomUUID();
      const path = `offers/${requestId.trim()}/${businessId.trim()}/${photoId}.jpg`;
      const fileRef = storageRef(storage, path);
      await uploadBytes(fileRef, photo, {
        contentType: photo.type || "image/jpeg",
      });
      return getDownloadURL(fileRef);
    });

    return Promise.all(uploads);
  };

  const handleSendReply = async () => {
    error = "";

    if (!requestId.trim() || !businessId.trim()) {
      error = "Request ID and business ID are required.";
      return;
    }

    if (!reply) {
      error = "Select YES or NO before sending.";
      return;
    }

    if (photos.length > maxPhotos) {
      error = `You can attach up to ${maxPhotos} photos.`;
      return;
    }

    const token = await auth.currentUser?.getIdToken();
    if (!token) {
      error = "Sign in to respond to a request.";
      return;
    }

    const noteText = note.trim();
    const messageParts = [reply.toUpperCase()];
    if (noteText.length > 0) {
      messageParts.push(noteText);
    }

    const payload: Record<string, unknown> = {
      requestId: requestId.trim(),
      businessId: businessId.trim(),
      message: messageParts.join(" — "),
    };

    if (eta) {
      payload.eta = eta;
    }

    isSubmitting = true;

    try {
      const photoUrls = await uploadPhotos();
      if (photoUrls.length > 0) {
        payload.photoUrls = photoUrls;
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL ?? ""}/respond-offer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to send reply.");
      }

      reply = null;
      eta = null;
      note = "";
      updatePhotos([]);
      dispatch("sent");
    } catch (submitError) {
      error = (submitError as Error).message;
    } finally {
      isSubmitting = false;
    }
  };
</script>

<section class="sheet">
  <header>
    <h2>Send reply</h2>
    <p>Let the customer know if you can take this request right now.</p>
  </header>

  <div class="reply-toggle">
    <button
      type="button"
      class={reply === "yes" ? "pill active yes" : "pill"}
      on:click={() => (reply = "yes")}
    >
      YES
    </button>
    <button
      type="button"
      class={reply === "no" ? "pill active no" : "pill"}
      on:click={() => (reply = "no")}
    >
      NO
    </button>
  </div>

  <div class="eta">
    <p class="label">ETA</p>
    <div class="chips">
      {#each etaOptions as option}
        <button
          type="button"
          class={eta === option ? "chip active" : "chip"}
          on:click={() => (eta = option)}
        >
          {option}
        </button>
      {/each}
    </div>
  </div>

  <div class="field">
    <label for="note">Optional note</label>
    <textarea id="note" rows="3" bind:value={note} placeholder="Add a short note"></textarea>
  </div>

  <div class="field">
    <label for="photos">Photos (1–3)</label>
    <input id="photos" type="file" accept="image/*" multiple on:change={handlePhotoChange} />
    <p class="hint">Attach up to {maxPhotos} images to help the customer decide.</p>

    {#if photoPreviews.length > 0}
      <div class="photo-grid">
        {#each photoPreviews as preview, index}
          <div class="photo-card">
            <img src={preview} alt={`Reply photo ${index + 1}`} />
            <button type="button" class="remove" on:click={() => removePhoto(index)}>
              Remove
            </button>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  {#if error}
    <p class="status error">{error}</p>
  {/if}

  <button class="cta" type="button" on:click={handleSendReply} disabled={isSubmitting}>
    {isSubmitting ? "Sending..." : "SEND REPLY"}
  </button>
</section>

<style>
  .sheet {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 1.5rem;
    border-radius: 1.5rem;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);
  }

  header h2 {
    margin: 0 0 0.35rem;
    font-size: 1.4rem;
  }

  header p {
    margin: 0;
    color: #64748b;
  }

  .reply-toggle {
    display: grid;
    grid-template-columns: repeat(2, minmax(120px, 1fr));
    gap: 1rem;
  }

  .pill {
    border-radius: 999px;
    border: 1px solid #e2e8f0;
    padding: 0.75rem 1.5rem;
    font-weight: 700;
    background: #f8fafc;
    color: #0f172a;
    cursor: pointer;
  }

  .pill.active {
    border-color: transparent;
    color: #ffffff;
  }

  .pill.yes.active {
    background: #10b981;
  }

  .pill.no.active {
    background: #ef4444;
  }

  .eta {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .label {
    font-weight: 600;
    color: #0f172a;
    margin: 0;
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .chip {
    border-radius: 999px;
    border: 1px solid #cbd5f5;
    padding: 0.45rem 1.1rem;
    background: #f8fafc;
    font-weight: 600;
    cursor: pointer;
  }

  .chip.active {
    background: #0ea5e9;
    color: #ffffff;
    border-color: transparent;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  label {
    font-weight: 600;
  }

  input,
  textarea {
    border: 1px solid #e2e8f0;
    border-radius: 0.75rem;
    padding: 0.7rem 1rem;
    font-size: 1rem;
  }

  .hint {
    font-size: 0.9rem;
    color: #64748b;
    margin: 0.1rem 0 0;
  }

  .photo-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 1rem;
    margin-top: 0.75rem;
  }

  .photo-card {
    border: 1px solid #e2e8f0;
    border-radius: 1rem;
    padding: 0.75rem;
    background: #f8fafc;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .photo-card img {
    width: 100%;
    height: 120px;
    object-fit: cover;
    border-radius: 0.75rem;
  }

  .remove {
    border: none;
    background: transparent;
    color: #ef4444;
    font-weight: 600;
    cursor: pointer;
  }

  .status {
    padding: 0.75rem 1rem;
    border-radius: 0.75rem;
    font-weight: 600;
  }

  .status.error {
    background: #fee2e2;
    color: #b91c1c;
  }

  .cta {
    border: none;
    border-radius: 999px;
    padding: 0.9rem 1.75rem;
    font-weight: 700;
    background: #0ea5e9;
    color: #ffffff;
    align-self: flex-start;
    cursor: pointer;
  }

  .cta:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
</style>
