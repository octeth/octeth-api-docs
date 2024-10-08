import {defineConfig} from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
    lang: 'en-US',
    title: "Octeth Developer Portal",
    description: "Octeth Developer Portal",

    appearance: false,

    sitemap: {
        hostname: 'https://dev.octeth.com',
        lastmodDateOnly: false
    },

    lastUpdated: true,

    head: [
        [
            'link',
            {rel: 'icon', href: '/logo_icon.png'}
        ],
        ['script', {defer: '', 'data-site': 'HSMUHQVG', src: 'https://cdn.usefathom.com/script.js'}],
        ['script', {}, '!function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys onSessionId".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);\n' +
        '    posthog.init(\'phc_ygHo6UNsJBeftPHqARO3gDFqYnsug63Xy5d9QW6cKEg\',{api_host:\'https://app.posthog.com\'})'],
        // [
        //     'script',
        //     { defer: '', 'data-domain':'apidocs.octeth.com', src:'https://analytics.metricshq.com/js/script.js'},
        // ]
    ],

    base: '/',
    externalLinkIcon: true,
    lang: 'en-US',

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
            light: '/logo_black.png',
            dark: '/logo_white.png',
            alt: 'Octeth'
        },
        search: {
            provider: 'local'
        },
        siteTitle: 'Developer Portal',
        nav: [
            {text: 'Homepage', link: '/'},
            {
                text: "v5.5.0",
                items: [
                    {text: 'Changelog', link: 'https://help.octeth.com/whats-new', target: '_blank', rel: 'dofollow'},
                ]
            },
            {
                text: "Resources",
                items: [
                    {text: 'Client Area', link: 'https://my.octeth.com/', target: '_blank', rel: 'dofollow'},
                    {text: 'Help Portal', link: 'https://help.octeth.com/', target: '_blank', rel: 'dofollow'},
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
                    {text: 'Support', link: '/support'},
                    {text: 'Changelog', link: 'https://github.com/octeth/octeth-api-docs/releases'}
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
                    {text: 'Sender Domains', link: '/api-reference/sender-domains'},
                    {text: 'Subscribers', link: '/api-reference/subscribers'},
                    {text: 'Suppression Lists', link: '/api-reference/suppression-lists'},
                    {text: 'Journeys', link: '/api-reference/journeys'},
                    {text: 'Email Gateway', link: '/api-reference/email-gateway'},
                    {text: 'Email Contents', link: '/api-reference/email-contents'},
                    {text: 'Email Campaigns', link: '/api-reference/email-campaigns'},
                    {text: 'System Management', link: '/api-reference/system-management'},
                ]
            },
            {
                text: 'PLUGIN DEVELOPMENT',
                collapsed: false,
                items: [
                    {text: 'Hook Reference', link: '/plugin-development/hook-reference'},
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
