<script lang="ts">
  import { onMount } from "svelte";
  import BusinessFlow from "$components/BusinessFlow.svelte";
  import { role } from "$lib/stores/role";

  onMount(() => {
    role.set("business");
  });
</script>

<svelte:head>
  <title>GeoSpur | Business</title>
</svelte:head>

<BusinessFlow />
