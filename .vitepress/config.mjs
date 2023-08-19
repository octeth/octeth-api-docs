import {defineConfig} from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
    externalLinkIcon: false,
    land: 'en-US',
    title: "Octeth API Docs",
    description: "Octeth API Documentation",
    themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        lastUpdated: {
            text: "Updated at",
            formatOptions: {
                dateStyle: 'full',
                timeStyle: 'medium'
            }
        },
        logo: {
            light: 'https://www.gitbook.com/cdn-cgi/image/width=256,dpr=2,height=40,fit=contain,format=auto/https%3A%2F%2F1273657825-files.gitbook.io%2F~%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FziTRqi0uEeZcrlRGNIxU%252Flogo%252F51pD88PWPkgG4CbyUCGk%252FOcteth%2520-%2520Black.png%3Falt%3Dmedia%26token%3D5d0ca3e1-806e-433f-a896-56e2808bd011',
            dark: 'https://www.gitbook.com/cdn-cgi/image/width=256,dpr=2,height=40,fit=contain,format=auto/https%3A%2F%2F1273657825-files.gitbook.io%2F~%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FziTRqi0uEeZcrlRGNIxU%252Flogo%252FBXWJ7UzTtEZz7FCPAHTr%252FOcteth%2520-%2520White.png%3Falt%3Dmedia%26token%3Ded68b0c4-ccb3-421d-89de-a090039e0692',
            alt: 'Octeth'
        },
        siteTitle: 'API Docs',
        nav: [
            {text: 'Homepage', link: '/'},
            {
                text: "Resources",
                items: [
                    {text: 'Client Area', link: 'https://my.octeth.com/', target: '_blank', rel: 'nofollow'},
                    {text: 'Help Portal', link: 'https://help.octeth.com/', target: '_blank', rel: 'nofollow'},
                    {text: 'Contact Us', link: 'mailto:support@octeth.com'}
                ]
            }
        ],

        sidebar: [
            {
                text: 'WELCOME',
                collapsed: false,
                items: [
                    {text: 'Getting Started', link: '/getting-started'},
                    {text: 'Authorization', link: '/authorization'},
                    {text: 'Error Handling', link: '/error-handling'},
                    {text: 'Support', link: '/support'}
                ]
            },
            {
                text: 'API REFERENCE',
                collapsed: false,
                items: [
                    {text: 'Administrators', link: '/api-reference/administrators'},
                    {text: 'Users', link: '/api-reference/users'},
                    {text: 'Subscriber Lists', link: '/api-reference/subscriber-lists'},
                    {text: 'Custom Fields', link: '/api-reference/custom-fields'},
                    {text: 'Segments', link: '/api-reference/segments'},
                    {text: 'Tags', link: '/api-reference/tags'},
                    {text: 'Subscribers', link: '/api-reference/subscribers'},
                    {text: 'Suppression Lists', link: '/api-reference/suppression-lists'},
                    {text: 'Journeys', link: '/api-reference/journeys'},
                    {text: 'Email Gateway', link: '/api-reference/email-gateway'},
                    {text: 'Email Templates', link: '/api-reference/email-templates'},
                    {text: 'Email Contents', link: '/api-reference/email-contents'},
                    {text: 'Email Campaigns', link: '/api-reference/email-campaigns'},
                    {text: 'System Management', link: '/api-reference/system-management'},
                ]
            }
        ],

        socialLinks: [
            {icon: 'github', link: 'https://github.com/octeth/octeth-api-docs'}
        ],

        footer: {
            message: 'Any questions? <a href="mailto:hello@octeth.com">Contact us</a>.',
            copyright: "&copy;Copyright 50SAAS LLC. All rights reserved."
        }
    }
})
