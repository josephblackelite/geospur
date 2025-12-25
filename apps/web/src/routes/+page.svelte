<script lang="ts">
  import BusinessFlow from "$components/BusinessFlow.svelte";
  import ConsumerFlow from "$components/ConsumerFlow.svelte";
  import { role } from "$lib/stores/role";
</script>

<svelte:head>
  <title>GeoSpur | {$role === "business" ? "Business" : "Consumer"} Experience</title>
</svelte:head>

{#if $role === "business"}
  <BusinessFlow />
{:else}
  <ConsumerFlow />
{/if}
