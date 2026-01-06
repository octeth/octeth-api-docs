<script setup>
import { useRoute, useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { computed, watch, onMounted, nextTick } from 'vue'

const { Layout } = DefaultTheme
const route = useRoute()
const { theme } = useData()

// Get the default version from config (first version in the dropdown)
const defaultVersion = computed(() => {
  const versionNav = theme.value.nav?.find(item => item.items?.some(i => i.text.includes('Current')))
  if (versionNav?.items) {
    // Find the item marked as "(Current)" and extract version
    const currentItem = versionNav.items.find(item => item.text.includes('(Current)'))
    if (currentItem) {
      // Extract version from text like "v5.7.3 (Current)"
      const match = currentItem.text.match(/v([^\s(]+)/)
      return match ? `v${match[1]}` : 'v5.7.3'
    }
  }
  return 'v5.7.3' // Ultimate fallback
})

// Extract version from current route path
const currentVersion = computed(() => {
  const match = route.path.match(/\/v([^/]+)\//)
  return match ? `v${match[1]}` : defaultVersion.value
})

// Update navbar version text dynamically
const updateVersionText = () => {
  // Try multiple selector strategies to find the version dropdown
  const selectors = [
    '.VPNavBarMenuGroup button',
    '.VPNavBarMenuGroup .VPButton',
    '.nav .VPNavBarMenuGroup button',
    'nav .VPNavBarMenuGroup button.VPButton'
  ]

  let versionButton = null
  for (const selector of selectors) {
    versionButton = document.querySelector(selector)
    if (versionButton) {
      break
    }
  }

  if (versionButton) {
    // Try to find the text element within the button
    const textElement = versionButton.querySelector('.text') ||
                       versionButton.querySelector('span.text') ||
                       versionButton

    // Update the text content
    if (textElement.textContent !== currentVersion.value) {
      textElement.textContent = currentVersion.value
    }
  }
}

// Watch for route changes and update version text
watch(() => route.path, () => {
  nextTick(() => {
    updateVersionText()
  })
}, { immediate: true })

// Update on initial mount
onMounted(() => {
  // Multiple attempts with increasing delays to ensure DOM is ready
  setTimeout(updateVersionText, 50)
  setTimeout(updateVersionText, 200)
  setTimeout(updateVersionText, 500)
})
</script>

<template>
  <Layout />
</template>
