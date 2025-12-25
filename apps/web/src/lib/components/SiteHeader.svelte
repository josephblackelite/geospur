<script lang="ts">
  import { goto } from "$app/navigation";
  import { role, type Role } from "$lib/stores/role";

  const setRole = (nextRole: Role) => {
    role.set(nextRole);
    goto(nextRole === "business" ? "/business" : "/");
  };
</script>

<nav class="site-header">
  <div class="brand">GeoSpur</div>
  <div class="role-toggle">
    <button
      class={$role === "consumer" ? "active" : ""}
      on:click={() => setRole("consumer")}
    >
      Consumer
    </button>
    <button
      class={$role === "business" ? "active" : ""}
      on:click={() => setRole("business")}
    >
      Business
    </button>
  </div>
</nav>

<style>
  .site-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem 2rem;
    background: white;
    border-bottom: 1px solid #e2e8f0;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .brand {
    font-weight: 700;
    font-size: 1.1rem;
    letter-spacing: 0.02em;
  }

  .role-toggle {
    display: inline-flex;
    gap: 0.5rem;
    padding: 0.35rem;
    border-radius: 999px;
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
  }

  button {
    border: none;
    background: transparent;
    padding: 0.4rem 1rem;
    border-radius: 999px;
    font-weight: 600;
    color: #64748b;
    cursor: pointer;
  }

  button.active {
    background: #2563eb;
    color: white;
  }
</style>
