<script setup>
import { useRoute, useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { computed, watch, onMounted, nextTick, ref, provide } from 'vue'

const { Layout } = DefaultTheme
const route = useRoute()
const { theme } = useData()

// Reactive state for dynamic sidebar
const dynamicSidebar = ref(null)

// Detect root pages that need dynamic sidebar
const isRootPage = computed(() => {
  return ['/changelog', '/roadmap', '/support'].some(path =>
    route.path === path || route.path === `${path}.html`
  )
})

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
    // Look for the specific text element (not the button itself to preserve arrow icon)
    const textElement = versionButton.querySelector('.text') ||
                       versionButton.querySelector('span.text')

    if (textElement) {
      // Update only the text span (preserves arrow icon in button)
      if (textElement.textContent !== currentVersion.value) {
        textElement.textContent = currentVersion.value
      }
    } else {
      // Fallback: update first text node only (preserves other child elements)
      const textNode = Array.from(versionButton.childNodes).find(
        node => node.nodeType === Node.TEXT_NODE && node.textContent.trim()
      )
      if (textNode && textNode.textContent.trim() !== currentVersion.value) {
        textNode.textContent = currentVersion.value
      }
    }
  }
}

// Replace sidebar content with version-specific sidebar via DOM manipulation
const replaceSidebarContent = () => {
  // Get target version from sessionStorage
  let targetVersion
  try {
    targetVersion = sessionStorage.getItem('octeth-last-version') || defaultVersion.value
  } catch (e) {
    targetVersion = defaultVersion.value
  }

  const versionPath = `/${targetVersion}/`
  const sidebarConfig = theme.value.sidebar?.[versionPath]

  if (!sidebarConfig) {
    return
  }

  // Store the config for rendering
  dynamicSidebar.value = sidebarConfig

  // Wait for DOM to be ready and update sidebar
  nextTick(() => {
    setTimeout(() => {
      updateSidebarDOM(sidebarConfig, targetVersion)
    }, 100)
  })
}

// Wait for sidebar to appear in DOM and then update it
const updateSidebarDOM = (sidebarConfig, version) => {
  // Try multiple sidebar selectors
  const sidebarSelectors = [
    '.VPSidebar',
    'aside.VPSidebar',
    '.sidebar',
    'nav.sidebar',
    '[class*="Sidebar"]'
  ]

  let sidebar = null
  for (const selector of sidebarSelectors) {
    sidebar = document.querySelector(selector)
    if (sidebar) {
      break
    }
  }

  if (!sidebar) {
    // Use MutationObserver to wait for sidebar to appear
    waitForSidebar(sidebarConfig, version)
    return
  }

  // Find all sidebar groups/sections
  const groupSelectors = [
    '.group',
    '.VPSidebarGroup',
    '[class*="group" i]',
    'section',
    '.items'
  ]

  let groups = []
  for (const selector of groupSelectors) {
    groups = sidebar.querySelectorAll(selector)
    if (groups.length > 0) {
      break
    }
  }

  if (groups.length === 0) {
    rebuildSidebarHTML(sidebar, sidebarConfig, version)
    return
  }

  // Update each group with version-specific links
  sidebarConfig.forEach((configGroup, index) => {
    const groupElement = groups[index]
    if (!groupElement) return

    // Show this group
    groupElement.style.display = ''

    // Update group title
    const titleElement = groupElement.querySelector('.title, h2, .heading')
    if (titleElement) {
      const titleText = titleElement.querySelector('.title-text, .text') || titleElement
      titleText.textContent = configGroup.text
    }

    // Update links within the group
    // VitePress structure: .group > .VPSidebarItem > .items > .VPSidebarItem > a
    // We need to find the nested .items container and get links from there
    const itemsContainer = groupElement.querySelector('.items, .VPSidebarItem .items')

    if (itemsContainer && configGroup.items) {
      // Get all link elements within the items container
      const links = itemsContainer.querySelectorAll('a.link, a[href]')

      configGroup.items.forEach((configItem, itemIndex) => {
        const link = links[itemIndex]
        if (!link) return

        // Update link href
        if (configItem.link) {
          link.href = configItem.link
        }

        // Update link text
        const linkText = link.querySelector('.text') || link.childNodes[0]
        if (linkText && configItem.text) {
          if (linkText.nodeType === Node.TEXT_NODE) {
            linkText.textContent = configItem.text
          } else if (linkText.textContent !== undefined) {
            linkText.textContent = configItem.text
          }
        }
      })
    }
  })

  // Hide extra groups that don't exist in the target version config
  for (let i = sidebarConfig.length; i < groups.length; i++) {
    const extraGroup = groups[i]
    if (extraGroup) {
      extraGroup.style.display = 'none'
    }
  }
}

// Use MutationObserver to wait for sidebar to appear
const waitForSidebar = (sidebarConfig, version) => {
  let attempts = 0
  const maxAttempts = 20

  const observer = new MutationObserver((mutations) => {
    attempts++

    const sidebar = document.querySelector('.VPSidebar, aside, [class*="Sidebar"]')
    if (sidebar) {
      observer.disconnect()
      updateSidebarDOM(sidebarConfig, version)
    } else if (attempts >= maxAttempts) {
      observer.disconnect()
    }
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true
  })

  // Also set a timeout as fallback
  setTimeout(() => {
    observer.disconnect()
    const sidebar = document.querySelector('.VPSidebar, aside')
    if (sidebar) {
      updateSidebarDOM(sidebarConfig, version)
    }
  }, 3000)
}

// Rebuild sidebar HTML from scratch if needed
const rebuildSidebarHTML = (sidebar, sidebarConfig, version) => {
  let html = '<nav class="VPSidebar-content">'

  sidebarConfig.forEach(group => {
    html += `<div class="group">`
    html += `<h2 class="title">${group.text}</h2>`

    if (group.items) {
      html += '<div class="items">'
      group.items.forEach(item => {
        html += `<a href="${item.link}" class="item">${item.text}</a>`
      })
      html += '</div>'
    }

    html += '</div>'
  })

  html += '</nav>'

  sidebar.innerHTML = html
}

// Watch for route changes and update version text
watch(() => route.path, (newPath) => {
  // Track version in sessionStorage when on versioned pages
  const match = newPath.match(/\/v([^/]+)\//)
  if (match) {
    const version = `v${match[1]}`
    try {
      sessionStorage.setItem('octeth-last-version', version)
    } catch (e) {
      // SessionStorage unavailable (privacy mode, etc.)
    }
  }

  // Handle root pages - replace sidebar content with version-specific content
  if (isRootPage.value) {
    replaceSidebarContent()
  } else {
    dynamicSidebar.value = null // Clear custom sidebar for non-root pages
  }

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

  // Also replace sidebar for root pages on initial mount
  if (isRootPage.value) {
    setTimeout(() => replaceSidebarContent(), 300)
    setTimeout(() => replaceSidebarContent(), 600)
  }
})
</script>

<template>
  <Layout />
</template>
