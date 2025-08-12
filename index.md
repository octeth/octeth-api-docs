---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Octeth Developer Portal"
  text: "Welcome to Octeth Developer Portal"
  tagline: API Documentation and Developer Resources
  actions:
    - theme: brand
      text: Get Started
      link: /v5.7.x/getting-started
    - theme: alt
      text: API Reference
      link: /v5.7.x/api-reference/administrators
---

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vitepress'

onMounted(() => {
  const router = useRouter()
  router.go('/v5.7.x/')
})
</script>