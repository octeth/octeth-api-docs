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
import { useRouter, useData } from 'vitepress'

onMounted(() => {
  const router = useRouter()
  const { theme } = useData()

  // Find the current version from config
  const versionNav = theme.value.nav?.find(item => item.items?.some(i => i.text.includes('Current')))
  let currentVersionPath = '/v5.7.3/' // Fallback

  if (versionNav?.items) {
    const currentItem = versionNav.items.find(item => item.text.includes('(Current)'))
    if (currentItem?.link) {
      currentVersionPath = currentItem.link
    }
  }

  router.go(currentVersionPath)
})
</script>