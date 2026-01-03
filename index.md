---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Octeth Help Portal"
  text: "Welcome to Octeth Help Portal"
  tagline: Help Articles, API Documentation and Developer Resources
  actions:
    - theme: brand
      text: Get Started
      link: /v5.7.2/getting-started
    - theme: alt
      text: API Reference
      link: /v5.7.2/api-reference/administrators
---

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vitepress'

onMounted(() => {
  const router = useRouter()
  router.go('/v5.7.3/')
})
</script>