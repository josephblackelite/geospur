<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { getDownloadURL, ref as storageRef, uploadBytes } from "firebase/storage";
  import { auth, storage } from "$lib/firebase";

  const dispatch = createEventDispatcher<{ sent: void }>();

  const maxPhotos = 3;

  let requestId = "";
  let businessId = "";
  let message = "";
  let price = "";
  let eta = "";
  let photos: File[] = [];
  let photoPreviews: string[] = [];
  let error = "";
  let success = "";
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
      error = `You can attach up to ${maxPhotos} photos per offer.`;
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

  const handleSubmit = async (event: Event) => {
    event.preventDefault();
    error = "";
    success = "";

    if (!requestId.trim() || !businessId.trim() || !message.trim()) {
      error = "Request ID, business ID, and message are required.";
      return;
    }

    if (photos.length > maxPhotos) {
      error = `You can attach up to ${maxPhotos} photos per offer.`;
      return;
    }

    const token = await auth.currentUser?.getIdToken();
    if (!token) {
      error = "Sign in to respond to a request.";
      return;
    }

    const payload: Record<string, unknown> = {
      requestId: requestId.trim(),
      businessId: businessId.trim(),
      message: message.trim(),
    };

    const trimmedPrice = price.trim();
    if (trimmedPrice.length > 0) {
      const parsedPrice = Number(trimmedPrice);
      if (Number.isNaN(parsedPrice)) {
        error = "Price must be a number.";
        return;
      }
      payload.price = parsedPrice;
    }

    if (eta.trim().length > 0) {
      payload.eta = eta.trim();
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
        throw new Error(data?.error ?? "Failed to send offer.");
      }

      success = "Offer sent successfully.";
      message = "";
      price = "";
      eta = "";
      updatePhotos([]);
      dispatch("sent");
    } catch (submitError) {
      error = (submitError as Error).message;
    } finally {
      isSubmitting = false;
    }
  };
</script>

<form class="offer-form" on:submit={handleSubmit}>
  <div class="field">
    <label for="requestId">Request ID</label>
    <input id="requestId" type="text" bind:value={requestId} placeholder="Request ID" />
  </div>
  <div class="field">
    <label for="businessId">Business ID</label>
    <input id="businessId" type="text" bind:value={businessId} placeholder="Business ID" />
  </div>
  <div class="field">
    <label for="message">Message</label>
    <textarea id="message" rows="4" bind:value={message} placeholder="Your offer message"></textarea>
  </div>
  <div class="field-group">
    <div class="field">
      <label for="price">Price (optional)</label>
      <input id="price" type="text" inputmode="decimal" bind:value={price} placeholder="350" />
    </div>
    <div class="field">
      <label for="eta">ETA (optional)</label>
      <input id="eta" type="text" bind:value={eta} placeholder="10 mins" />
    </div>
  </div>

  <div class="field">
    <label for="photos">Attach photos (1–3)</label>
    <input id="photos" type="file" accept="image/*" multiple on:change={handlePhotoChange} />
    <p class="hint">Attach up to {maxPhotos} photos. Each photo is stored per request.</p>

    {#if photoPreviews.length > 0}
      <div class="photo-grid">
        {#each photoPreviews as preview, index}
          <div class="photo-card">
            <img src={preview} alt={`Offer photo ${index + 1}`} />
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
  {#if success}
    <p class="status success">{success}</p>
  {/if}

  <button class="submit" type="submit" disabled={isSubmitting}>
    {isSubmitting ? "Sending..." : "Send offer"}
  </button>
</form>

<style>
  .offer-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
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
    padding: 0.75rem 1rem;
    font-size: 1rem;
  }

  .field-group {
    display: grid;
    gap: 1.5rem;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }

  .hint {
    font-size: 0.9rem;
    color: #64748b;
    margin: 0.25rem 0 0;
  }

  .photo-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
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
    height: 140px;
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

  .status.success {
    background: #dcfce7;
    color: #15803d;
  }

  .submit {
    border: none;
    border-radius: 999px;
    padding: 0.85rem 1.75rem;
    font-weight: 600;
    background: #0ea5e9;
    color: white;
    align-self: flex-start;
  }

  .submit:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
</style>
