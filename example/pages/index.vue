<template>
  <div>
    Works!
  </div>
</template>

<script>
export default {
  middleware (ctx) {
    ctx.$mtm.push({ event: 'ssr' })
  }
}
</script>
