import {defineConfig} from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
    base: '/',
    head: [
        [
            'link',
            {rel:'icon', href:'public/logo_icon.png'}
        ]
    ],
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
            light: 'public/logo_black.png',
            dark: 'public/logo_white.png',
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
