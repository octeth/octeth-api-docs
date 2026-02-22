---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Octeth Help Portal"
  text: "Welcome to Octeth Help Portal"
  tagline: Installation Guides, User Documentation, API Reference, and Developer Resources
  actions:
    - theme: brand
      text: Get Started
      link: /v5.8.1/getting-started
    - theme: alt
      text: API Reference
      link: /v5.8.1/api-reference/administrators
---

<script setup>
import { onMounted } from 'vue'
import { useRouter, useData } from 'vitepress'

onMounted(() => {
  const router = useRouter()
  const { theme } = useData()

  // Find the current version from config
  const versionNav = theme.value.nav?.find(item => item.items?.some(i => i.text.includes('Current')))
  let currentVersionPath = '/v5.8.1/' // Fallback

  if (versionNav?.items) {
    const currentItem = versionNav.items.find(item => item.text.includes('(Current)'))
    if (currentItem?.link) {
      currentVersionPath = currentItem.link
    }
  }

  router.go(currentVersionPath)
})
</script>