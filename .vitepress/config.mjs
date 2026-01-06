import {defineConfig} from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
    lang: 'en-US',
    title: "Octeth Help Portal",
    description: "Octeth Help Portal",

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
        // Fathom
        ['script', {defer: '', 'data-site': 'HSMUHQVG', src: 'https://cdn.usefathom.com/script.js'}],
        ['script', {}, '!function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys onSessionId".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);\n' +
        '    posthog.init(\'phc_ygHo6UNsJBeftPHqARO3gDFqYnsug63Xy5d9QW6cKEg\',{api_host:\'https://app.posthog.com\'})'],
        // ContactWidget.com
        ['script', {}, '(()=>{(function(d,i){let t={apiBase:"https://b.contactwidget.com",widgetId:null,scriptLoaded:!1};function a(){if(t.scriptLoaded)return;let e=i.createElement("script");e.src=`${t.apiBase}/widget/${t.widgetId}/widget.min.js`,e.async=!0,e.onload=()=>{t.scriptLoaded=!0,d.ContactWidget.init({widgetId:t.widgetId,domain:d.location.hostname})},i.body?i.body.appendChild(e):i.addEventListener("DOMContentLoaded",function(){i.body.appendChild(e)})}function n(e){if(typeof e=="string")t.widgetId=e;else if(typeof e=="object"&&e!==null){if(!e.widgetId){console.error("ContactWidget: Widget ID is required");return}t.widgetId=e.widgetId,e.apiBase&&(t.apiBase=e.apiBase),t.widgetOptions={domain:e.domain||window.location.hostname,primaryColor:e.primaryColor,position:e.position}}else{console.error("ContactWidget: Invalid initialization parameters");return}i.readyState==="complete"||i.readyState==="interactive"?a():i.addEventListener("DOMContentLoaded",a)}d.ContactWidgetLoader={init:n}})(window,document);})();'],
        ['script', {}, 'ContactWidgetLoader.init({widgetId: "25a184cc-085d-42fd-b6b7-53f72f2b8c21", domain: window.location.hostname});']
    ],

    base: '/',
    externalLinkIcon: true,

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
        siteTitle: 'Help Portal',

        nav: [
            {
                text: "v5.7.3",
                items: [
                    {text: 'v5.7.3 (Current)', link: '/v5.7.3/'},
                    {text: 'v5.7.2', link: '/v5.7.2/'},
                    {text: 'v5.6.x', link: '/v5.6.x/'},
                    {text: 'v5.5.x', link: '/v5.5.x/'},
                    {text: 'Changelog', link: 'https://help.octeth.com/whats-new', target: '_blank', rel: 'dofollow'}
                ]
            },
            {
                text: "Add-Ons",
                items: [
                    {text: "Octeth Backup Tools", link: 'https://github.com/octeth/octeth-backup-tools', target: '_blank', rel: 'dofollow'},
                    {text: "Octeth phpMyAdmin", link: 'https://github.com/octeth/oempro-phpmyadmin', target: '_blank', rel: 'dofollow'},
                    {text: "Octeth phpMyAdmin", link: 'https://github.com/octeth/oempro-phpmyadmin', target: '_blank', rel: 'dofollow'},
                    {text: "Octeth Link Proxy", link: 'https://github.com/octeth/oempro-link-proxy', target: '_blank', rel: 'dofollow'},
                    {text: "Octeth MX Server", link: 'https://github.com/octeth/oempro-mx-server', target: '_blank', rel: 'dofollow'}
                ]
            },
            {text: 'Homepage', link: 'https://octeth.com/', target: '_blank', rel: 'dofollow'},
            {text: 'Client Area', link: 'https://my.octeth.com/', target: '_blank', rel: 'dofollow'},
            {text: 'Help Portal', link: 'https://help.octeth.com/', target: '_blank', rel: 'dofollow'},
            {text: 'Contact Us', link: 'https://octeth.com/contact/', target: '_blank', rel: 'dofollow'}
        ],

        sidebar: {
            '/v5.7.3/': [
                {
                    text: 'OCTETH V5.7.3',
                    collapsed: false,
                    items: [
                        {text: 'Changelog', link: '/v5.7.3/changelog'},
                        {text: 'Roadmap', link: '/v5.7.3/roadmap'},
                        {text: 'Support', link: '/v5.7.3/support'}
                    ]
                },
                {
                    text: 'INSTALLATION GUIDE',
                    collapsed: true,
                    items: [
                        {text: 'Server Requirements', link: '/v5.7.3/getting-started/server-requirements'},
                        {text: 'Preparations', link: '/v5.7.3/getting-started/preparations'},
                        {text: 'Server Initialization', link: '/v5.7.3/getting-started/server-initialization'},
                        {text: 'Server Setup', link: '/v5.7.3/getting-started/server-setup'},
                        {text: 'Upload Octeth To The Server', link: '/v5.7.3/getting-started/upload-octeth-to-server'},
                        {text: 'Octeth Installation', link: '/v5.7.3/getting-started/octeth-installation'},
                        {text: 'Backup Add-On Setup', link: '/v5.7.3/getting-started/backup-addon-setup'},
                        {text: 'Link Proxy Add-On Setup', link: '/v5.7.3/getting-started/link-proxy-addon-setup'},
                        {text: 'Octeth Configuration', link: '/v5.7.3/getting-started/octeth-configuration'},
                        {text: 'Monitoring', link: '/v5.7.3/getting-started/monitoring'},
                        {text: 'Octeth CLI Tool', link: '/v5.7.3/getting-started/octeth-cli-tool'},
                        {text: 'Sender Domain DNS Settings', link: '/v5.7.3/getting-started/sender-domain-dns-settings'},
                        {text: 'Upgrading Octeth', link: '/v5.7.3/getting-started/upgrading-octeth'},
                        {text: 'Troubleshooting', link: '/v5.7.3/getting-started/troubleshooting'}
                    ]
                },
                {
                    text: 'USING OCTETH',
                    collapsed: true,
                    items: [
                        {text: 'Managing Users', link: '/v5.7.3/using-octeth/managing-users'},
                        {text: 'Managing Subscribers', link: '/v5.7.3/using-octeth/managing-subscribers'},
                        {text: 'Managing Lists', link: '/v5.7.3/using-octeth/managing-lists'},
                        {text: 'Managing Campaigns', link: '/v5.7.3/using-octeth/managing-campaigns'},
                        {text: 'Managing Journeys', link: '/v5.7.3/using-octeth/managing-journeys'},
                        {text: 'Managing Segments', link: '/v5.7.3/using-octeth/managing-segments'},
                        {text: 'Managing Tags', link: '/v5.7.3/using-octeth/managing-tags'},
                        {text: 'Managing Custom Fields', link: '/v5.7.3/using-octeth/managing-custom-fields'},
                        {text: 'Managing Suppression Lists', link: '/v5.7.3/using-octeth/managing-suppression-lists'}
                    ]
                },
                {
                    text: 'API REFERENCE',
                    collapsed: true,
                    items: [
                        {text: 'Getting Started', link: '/v5.7.3/getting-started'},
                        {text: 'Authorization', link: '/v5.7.3/authorization'},
                        {text: 'Error Handling', link: '/v5.7.3/error-handling'},

                        // Admin API Endpoints
                        {text: 'Admin', link: '/v5.7.3/api-reference/admin'},
                        {text: 'Reports', link: '/v5.7.3/api-reference/reports'},
                        {text: 'Auto Responders', link: '/v5.7.3/api-reference/autoresponders'},
                        {text: 'Campaigns', link: '/v5.7.3/api-reference/campaigns'},
                        {text: 'Custom Fields', link: '/v5.7.3/api-reference/customfields'},
                        {text: 'Delivery Servers', link: '/v5.7.3/api-reference/deliveryservers'},
                        {text: 'DNS', link: '/v5.7.3/api-reference/dns'},
                        {text: 'Email Gateway', link: '/v5.7.3/api-reference/emailgateway'},
                        {text: 'Journeys', link: '/v5.7.3/api-reference/journeys'},
                        {text: 'Lists', link: '/v5.7.3/api-reference/lists'},
                        {text: 'Re-Branding', link: '/v5.7.3/api-reference/rebranding'},
                        {text: 'Clients', link: '/v5.7.3/api-reference/clients'},
                        {text: 'Emails', link: '/v5.7.3/api-reference/emails'},
                        {text: 'Media Library', link: '/v5.7.3/api-reference/medialibrary'},
                        {text: 'SSO', link: '/v5.7.3/api-reference/sso'},
                        {text: 'Suppression Lists', link: '/v5.7.3/api-reference/suppression'},
                        {text: 'Settings', link: '/v5.7.3/api-reference/settings'},
                        {text: 'Event Tracking', link: '/v5.7.3/api-reference/eventtracking'},
                        {text: 'System', link: '/v5.7.3/api-reference/system'},
                        {text: 'Users', link: '/v5.7.3/api-reference/users'},
                        {text: 'Segments', link: '/v5.7.3/api-reference/segments'},
                        {text: 'Subscribers', link: '/v5.7.3/api-reference/subscribers'},
                        {text: 'Internal', link: '/v5.7.3/api-reference/internal'}
                    ]
                },
                {
                    text: 'PLUGIN DEVELOPMENT',
                    collapsed: true,
                    items: [
                        {text: 'Hook Reference', link: '/v5.7.3/plugin-development/reference'},
                    ]
                }

            ],
            '/v5.7.2/': [
                {
                    text: 'OCTETH V5.7.2',
                    collapsed: false,
                    items: [
                        {text: 'Changelog', link: '/v5.7.2/changelog'},
                        {text: 'Roadmap', link: '/v5.7.2/roadmap'},
                        {text: 'Support', link: '/v5.7.2/support'}
                    ]
                },
                {
                    text: 'INSTALLATION GUIDE',
                    collapsed: true,
                    items: [
                        {text: 'Server Requirements', link: '/v5.7.2/getting-started/server-requirements'},
                        {text: 'Preparations', link: '/v5.7.2/getting-started/preparations'},
                        {text: 'Server Initialization', link: '/v5.7.2/getting-started/server-initialization'},
                        {text: 'Server Setup', link: '/v5.7.2/getting-started/server-setup'},
                        {text: 'Upload Octeth To The Server', link: '/v5.7.2/getting-started/upload-octeth-to-server'},
                        {text: 'Octeth Installation', link: '/v5.7.2/getting-started/octeth-installation'},
                        {text: 'Backup Add-On Setup', link: '/v5.7.2/getting-started/backup-addon-setup'},
                        {text: 'Link Proxy Add-On Setup', link: '/v5.7.2/getting-started/link-proxy-addon-setup'},
                        {text: 'Octeth Configuration', link: '/v5.7.2/getting-started/octeth-configuration'},
                        {text: 'Monitoring', link: '/v5.7.2/getting-started/monitoring'},
                        {text: 'Octeth CLI Tool', link: '/v5.7.2/getting-started/octeth-cli-tool'},
                        {text: 'Sender Domain DNS Settings', link: '/v5.7.2/getting-started/sender-domain-dns-settings'},
                        {text: 'Upgrading Octeth', link: '/v5.7.2/getting-started/upgrading-octeth'},
                        {text: 'Troubleshooting', link: '/v5.7.2/getting-started/troubleshooting'}
                    ]
                },
                {
                    text: 'USING OCTETH',
                    collapsed: true,
                    items: [
                        {text: 'Managing Users', link: '/v5.7.2/using-octeth/managing-users'},
                        {text: 'Managing Subscribers', link: '/v5.7.2/using-octeth/managing-subscribers'},
                        {text: 'Managing Lists', link: '/v5.7.2/using-octeth/managing-lists'},
                        {text: 'Managing Campaigns', link: '/v5.7.2/using-octeth/managing-campaigns'},
                        {text: 'Managing Journeys', link: '/v5.7.2/using-octeth/managing-journeys'},
                        {text: 'Managing Segments', link: '/v5.7.2/using-octeth/managing-segments'},
                        {text: 'Managing Tags', link: '/v5.7.2/using-octeth/managing-tags'},
                        {text: 'Managing Custom Fields', link: '/v5.7.2/using-octeth/managing-custom-fields'},
                        {text: 'Managing Suppression Lists', link: '/v5.7.2/using-octeth/managing-suppression-lists'}
                    ]
                },
                {
                    text: 'API REFERENCE',
                    collapsed: true,
                    items: [
                        {text: 'Getting Started', link: '/v5.7.2/getting-started'},
                        {text: 'Authorization', link: '/v5.7.2/authorization'},
                        {text: 'Error Handling', link: '/v5.7.2/error-handling'},

                        // Admin API Endpoints
                        {text: 'Admin', link: '/v5.7.2/api-reference/admin'},
                        {text: 'Reports', link: '/v5.7.2/api-reference/reports'},
                        {text: 'Auto Responders', link: '/v5.7.2/api-reference/autoresponders'},
                        {text: 'Campaigns', link: '/v5.7.2/api-reference/campaigns'},
                        {text: 'Custom Fields', link: '/v5.7.2/api-reference/customfields'},
                        {text: 'Delivery Servers', link: '/v5.7.2/api-reference/deliveryservers'},
                        {text: 'DNS', link: '/v5.7.2/api-reference/dns'},
                        {text: 'Email Gateway', link: '/v5.7.2/api-reference/emailgateway'},
                        {text: 'Journeys', link: '/v5.7.2/api-reference/journeys'},
                        {text: 'Lists', link: '/v5.7.2/api-reference/lists'},
                        {text: 'Re-Branding', link: '/v5.7.2/api-reference/rebranding'},
                        {text: 'Clients', link: '/v5.7.2/api-reference/clients'},
                        {text: 'Emails', link: '/v5.7.2/api-reference/emails'},
                        {text: 'Media Library', link: '/v5.7.2/api-reference/medialibrary'},
                        {text: 'SSO', link: '/v5.7.2/api-reference/sso'},
                        {text: 'Suppression Lists', link: '/v5.7.2/api-reference/suppression'},
                        {text: 'Settings', link: '/v5.7.2/api-reference/settings'},
                        {text: 'Event Tracking', link: '/v5.7.2/api-reference/eventtracking'},
                        {text: 'System', link: '/v5.7.2/api-reference/system'},
                        {text: 'Users', link: '/v5.7.2/api-reference/users'},
                        {text: 'Segments', link: '/v5.7.2/api-reference/segments'},
                        {text: 'Subscribers', link: '/v5.7.2/api-reference/subscribers'},
                        {text: 'Internal', link: '/v5.7.2/api-reference/internal'}
                    ]
                },
                {
                    text: 'PLUGIN DEVELOPMENT',
                    collapsed: true,
                    items: [
                        {text: 'Hook Reference', link: '/v5.7.2/plugin-development/reference'},
                    ]
                }

            ],
            '/v5.6.x/': [
                {
                    text: 'OCTETH V5.6.X',
                    collapsed: false,
                    items: [
                        {text: 'Getting Started', link: '/v5.6.x/getting-started'},
                        {text: 'Authorization', link: '/v5.6.x/authorization'},
                        {text: 'Error Handling', link: '/v5.6.x/error-handling'},
                        {text: 'Support', link: '/v5.6.x/support'},
                        {text: 'Changelog', link: 'https://help.octeth.com/whats-new'}
                    ]
                },
                {
                    text: 'API REFERENCE',
                    collapsed: false,
                    items: [
                        {text: 'Administrators', link: '/v5.6.x/api-reference/administrators'},
                        {text: 'Users', link: '/v5.6.x/api-reference/users'},
                        {text: 'Subscriber Lists', link: '/v5.6.x/api-reference/subscriber-lists'},
                        {text: 'Custom Fields', link: '/v5.6.x/api-reference/custom-fields'},
                        {text: 'Segments', link: '/v5.6.x/api-reference/segments'},
                        {text: 'Tags', link: '/v5.6.x/api-reference/tags'},
                        {text: 'Sender Domains', link: '/v5.6.x/api-reference/sender-domains'},
                        {text: 'Subscribers', link: '/v5.6.x/api-reference/subscribers'},
                        {text: 'Suppression Lists', link: '/v5.6.x/api-reference/suppression-lists'},
                        {text: 'Journeys', link: '/v5.6.x/api-reference/journeys'},
                        {text: 'Email Contents', link: '/v5.6.x/api-reference/email-contents'},
                        {text: 'Email Campaigns', link: '/v5.6.x/api-reference/email-campaigns'},
                        {text: 'Events', link: '/v5.6.x/api-reference/events'},
                        {text: 'System Management', link: '/v5.6.x/api-reference/system-management'},
                    ]
                },
                {
                    text: 'PLUGIN DEVELOPMENT',
                    collapsed: false,
                    items: [
                        {text: 'Hook Reference', link: '/v5.6.x/plugin-development/hook-reference'},
                    ]
                }

            ],
            '/v5.5.x/': [
                {
                    text: 'OCTETH V5.5.X',
                    collapsed: false,
                    items: [
                        {text: 'Getting Started', link: '/v5.5.x/getting-started'},
                        {text: 'Authorization', link: '/v5.5.x/authorization'},
                        {text: 'Error Handling', link: '/v5.5.x/error-handling'},
                        {text: 'Support', link: '/v5.5.x/support'},
                        {text: 'Changelog', link: 'https://help.octeth.com/whats-new'}
                    ]
                },
                {
                    text: 'API REFERENCE',
                    collapsed: false,
                    items: [
                        {text: 'Administrators', link: '/v5.5.x/api-reference/administrators'},
                        {text: 'Users', link: '/v5.5.x/api-reference/users'},
                        {text: 'Subscriber Lists', link: '/v5.5.x/api-reference/subscriber-lists'},
                        {text: 'Custom Fields', link: '/v5.5.x/api-reference/custom-fields'},
                        {text: 'Segments', link: '/v5.5.x/api-reference/segments'},
                        {text: 'Tags', link: '/v5.5.x/api-reference/tags'},
                        {text: 'Sender Domains', link: '/v5.5.x/api-reference/sender-domains'},
                        {text: 'Subscribers', link: '/v5.5.x/api-reference/subscribers'},
                        {text: 'Suppression Lists', link: '/v5.5.x/api-reference/suppression-lists'},
                        {text: 'Journeys', link: '/v5.5.x/api-reference/journeys'},
                        {text: 'Email Contents', link: '/v5.5.x/api-reference/email-contents'},
                        {text: 'Email Campaigns', link: '/v5.5.x/api-reference/email-campaigns'},
                        {text: 'System Management', link: '/v5.5.x/api-reference/system-management'},
                    ]
                },
                {
                    text: 'PLUGIN DEVELOPMENT',
                    collapsed: false,
                    items: [
                        {text: 'Hook Reference', link: '/v5.5.x/plugin-development/hook-reference'},
                    ]
                }

            ]
        },

        socialLinks: [
            {icon: 'github', link: 'https://github.com/orgs/octeth/repositories'}
        ],

        footer: {
            message: 'Any questions? <a href="https://octeth.com/contact/" target="_blank" rel="dofollow">Contact us</a>.',
            copyright: "&copy;Copyright 50SAAS LLC. All rights reserved."
        }
    }
})
