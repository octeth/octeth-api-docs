import {defineConfig} from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
    lastUpdated: true,
    externalLinkIcon: false,
    land: 'en-US',
    title: "Octeth API Docs",
    description: "Octeth API Documentation",
    themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        logo: {
            light: 'https://www.gitbook.com/cdn-cgi/image/width=256,dpr=2,height=40,fit=contain,format=auto/https%3A%2F%2F1273657825-files.gitbook.io%2F~%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FziTRqi0uEeZcrlRGNIxU%252Flogo%252F51pD88PWPkgG4CbyUCGk%252FOcteth%2520-%2520Black.png%3Falt%3Dmedia%26token%3D5d0ca3e1-806e-433f-a896-56e2808bd011',
            dark: 'https://www.gitbook.com/cdn-cgi/image/width=256,dpr=2,height=40,fit=contain,format=auto/https%3A%2F%2F1273657825-files.gitbook.io%2F~%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FziTRqi0uEeZcrlRGNIxU%252Flogo%252FBXWJ7UzTtEZz7FCPAHTr%252FOcteth%2520-%2520White.png%3Falt%3Dmedia%26token%3Ded68b0c4-ccb3-421d-89de-a090039e0692',
            alt: 'Octeth'
        },
        siteTitle: 'API Docs',
        nav: [
            {text: 'Home', link: '/'},
            {
                text: "Drop",
                items: [
                    {text: 'Item A', link: '#1', target: '_blank', rel: 'nofollow'},
                    {text: 'Item B', link: '#2'},
                    {text: 'Item C', link: '#3'}
                ]
            },
            {text: 'Examples', link: '/markdown-examples'},
            {text: 'Contact Us', link: 'mailto:support@octeth.com'}
        ],

        sidebar: [
            {
                text: 'Getting Started',
                items: [
                    {text: 'Homepage', link: '/'},
                    {text: 'Getting Started', link: '/getting-started'}
                ]
            },
            {
                text: 'API Endpoints',
                collapsed: true,
                items: [
                    {text: 'Authentication', link: '/1'}
                ]
            }
        ],

        socialLinks: [
            {icon: 'github', link: 'https://octeth.com'}
        ],

        footer: {
            message: 'This is a <a href="https://octeth.com" target="_blank">message</a>',
            copyright: "Copyright 50SAAS LLC. All rights reserved."
        }
    }
})
