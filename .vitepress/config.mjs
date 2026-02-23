import {defineConfig} from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
    lang: 'en-US',
    title: "Octeth Help Portal",
    description: "Octeth Help Portal",

    // TODO: I temporarily turned this on to ignore dead links. We need to turn it off later.
    ignoreDeadLinks: true,

    cleanUrls: true,

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
                text: "v5.8.1",
                items: [
                    {text: 'v5.8.1 (Current)', link: '/v5.8.1/'},
                    {text: 'v5.8.0', link: '/v5.8.0/'},
                    {text: 'v5.7.3', link: '/v5.7.3/'},
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

        sidebar: (() => {
            // Define v5.8.1 sidebar config ONCE
            const v5_8_1_sidebar = [
                {
                    text: 'INTRODUCTION',
                    collapsed: false,
                    items: [
                        {text: 'Changelog', link: '/changelog'},
                        {text: 'Roadmap', link: '/roadmap'},
                        {text: 'Support', link: '/support'}
                    ]
                },
                {
                    text: 'INSTALLATION GUIDE',
                    collapsed: true,
                    items: [
                        {text: 'Server Requirements', link: '/v5.8.1/getting-started/server-requirements'},
                        {text: 'Preparations', link: '/v5.8.1/getting-started/preparations'},
                        {text: 'Server Initialization', link: '/v5.8.1/getting-started/server-initialization'},
                        {text: 'Server Setup', link: '/v5.8.1/getting-started/server-setup'},
                        {text: 'Upload Octeth To The Server', link: '/v5.8.1/getting-started/upload-octeth-to-server'},
                        {text: 'Octeth Installation', link: '/v5.8.1/getting-started/octeth-installation'},
                        {text: 'Backup Add-On Setup', link: '/v5.8.1/getting-started/backup-addon-setup'},
                        {text: 'Link Proxy Add-On Setup', link: '/v5.8.1/getting-started/link-proxy-addon-setup'},
                        {text: 'Octeth Configuration', link: '/v5.8.1/getting-started/octeth-configuration'},
                        {text: 'Monitoring', link: '/v5.8.1/getting-started/monitoring'},
                        {text: 'Octeth CLI Tool', link: '/v5.8.1/getting-started/octeth-cli-tool'},
                        {text: 'Sender Domain DNS Settings', link: '/v5.8.1/getting-started/sender-domain-dns-settings'},
                        {text: 'SSL Certificates', link: '/v5.8.1/getting-started/ssl-certificates'},
                        {text: 'Upgrading Octeth', link: '/v5.8.1/getting-started/upgrading-octeth'},
                        {text: 'Troubleshooting', link: '/v5.8.1/getting-started/troubleshooting'}
                    ]
                },
                {
                    text: 'USING OCTETH',
                    collapsed: true,
                    items: [
                        {
                            text: 'Features', items: [
                                {text: 'Users', link: '/v5.8.1/using-octeth/users'},
                                {text: 'Subscribers', link: '/v5.8.1/using-octeth/subscribers'},
                                {text: 'Lists', link: '/v5.8.1/using-octeth/lists'},
                                {text: 'Email Campaigns', link: '/v5.8.1/using-octeth/email-campaigns'},
                                {text: 'Journeys', link: '/v5.8.1/using-octeth/journeys'},
                                {text: 'Segments', link: '/v5.8.1/using-octeth/segments'},
                                {text: 'Tags', link: '/v5.8.1/using-octeth/tags'},
                                {text: 'Custom Fields', link: '/v5.8.1/using-octeth/custom-fields'},
                                {text: 'Auto Responders', link: '/v5.8.1/using-octeth/auto-responders'},
                                {text: 'Sender Domains', link: '/v5.8.1/using-octeth/sender-domains'},
                                {text: 'Email Builder', link: '/v5.8.1/using-octeth/email-builder'},
                                {text: 'Email Personalization', link: '/v5.8.1/using-octeth/email-personalization'},
                                {text: 'Event Tracking', link: '/v5.8.1/using-octeth/event-tracking'},
                                {text: 'SMS Messages', link: '/v5.8.1/using-octeth/sms-messages'},
                                {text: 'Cookbook', link: '/v5.8.1/using-octeth/cookbook'}
                            ],
                        }, {
                            text: 'Email Deliverability', items: [
                                {text: 'Email Sending', link: '/v5.8.1/using-octeth/email-deliverability/email-sending'},
                                {text: 'Email Tracking', link: '/v5.8.1/using-octeth/email-deliverability/email-tracking'},
                                {text: 'Bounce Processing', link: '/v5.8.1/using-octeth/email-deliverability/bounce-processing'},
                                {text: 'Complaint Processing', link: '/v5.8.1/using-octeth/email-deliverability/complaint-processing'},
                                {text: 'Unsubscriptions', link: '/v5.8.1/using-octeth/email-deliverability/unsubscriptions'},
                                {text: 'Suppression Lists', link: '/v5.8.1/using-octeth/email-deliverability/suppression-lists'},
                                {text: 'SPF/DKIM/DMARC', link: '/v5.8.1/using-octeth/email-deliverability/spf-dkim-dmarc'}
                            ],
                        }, {
                            text: 'Use Cases', items: [
                                {text: 'Internal Use', link: '/v5.8.1/using-octeth/use-cases/internal-use'},
                                {text: 'Agency Use', link: '/v5.8.1/using-octeth/use-cases/agency-use'},
                                {text: 'Enterprise Use', link: '/v5.8.1/using-octeth/use-cases/enterprise-use'},
                                {text: 'SaaS/ESP Use', link: '/v5.8.1/using-octeth/use-cases/saas-esp-use'}
                            ]
                        }
                    ]
                },
                {
                    text: 'INTEGRATIONS',
                    collapsed: true,
                    items: [
                        {text: 'Google Analytics', link: '/v5.8.1/using-octeth/integrations/google-analytics'},
                        {text: 'Stripo Email Builder', link: '/v5.8.1/using-octeth/integrations/stripo-email-builder'},
                        {text: 'Single Sign On (SSO)', link: '/v5.8.1/using-octeth/integrations/sso'},
                        {text: 'n8n Integration', link: '/v5.8.1/using-octeth/integrations/n8n-integration'}
                    ]
                },
                {
                    text: 'DEVELOPERS',
                    collapsed: true,
                    items: [
                        {
                            text: 'API Reference', items: [
                                {text: 'Getting Started', link: '/v5.8.1/api-reference/getting-started'},
                                {text: 'Authorization', link: '/v5.8.1/api-reference/authorization'},
                                {text: 'Error Handling', link: '/v5.8.1/api-reference/error-handling'},
                                {text: 'Admin', link: '/v5.8.1/api-reference/admin'},
                                {text: 'Reports', link: '/v5.8.1/api-reference/reports'},
                                {text: 'Auto Responders', link: '/v5.8.1/api-reference/autoresponders'},
                                {text: 'Campaigns', link: '/v5.8.1/api-reference/campaigns'},
                                {text: 'Custom Fields', link: '/v5.8.1/api-reference/customfields'},
                                {text: 'Delivery Servers', link: '/v5.8.1/api-reference/deliveryservers'},
                                {text: 'DNS', link: '/v5.8.1/api-reference/dns'},
                                {text: 'Email Gateway', link: '/v5.8.1/api-reference/emailgateway'},
                                {text: 'Journeys', link: '/v5.8.1/api-reference/journeys'},
                                {text: 'Journey Actions', link: '/v5.8.1/api-reference/journey-actions'},
                                {text: 'Lists', link: '/v5.8.1/api-reference/lists'},
                                {text: 'Re-Branding', link: '/v5.8.1/api-reference/rebranding'},
                                {text: 'Clients', link: '/v5.8.1/api-reference/clients'},
                                {text: 'Emails', link: '/v5.8.1/api-reference/emails'},
                                {text: 'Media Library', link: '/v5.8.1/api-reference/medialibrary'},
                                {text: 'SSO', link: '/v5.8.1/api-reference/sso'},
                                {text: 'Suppression Lists', link: '/v5.8.1/api-reference/suppression'},
                                {text: 'Settings', link: '/v5.8.1/api-reference/settings'},
                                {text: 'Event Tracking', link: '/v5.8.1/api-reference/eventtracking'},
                                {text: 'System', link: '/v5.8.1/api-reference/system'},
                                {text: 'Users', link: '/v5.8.1/api-reference/users'},
                                {text: 'Segments', link: '/v5.8.1/api-reference/segments'},
                                {text: 'Subscribers', link: '/v5.8.1/api-reference/subscribers'},
                                {text: 'Internal', link: '/v5.8.1/api-reference/internal'}
                            ]
                        },
                        {
                            text: 'Plug-In Development', items: [
                                {text: 'Hook Reference', link: '/v5.8.1/plugin-development/reference'}
                            ]
                        }
                    ]
                }
            ]

            // Return sidebar config with shared reference
            return {
                '/': v5_8_1_sidebar,  // Root pages use latest version sidebar
                '/v5.8.1/': v5_8_1_sidebar,  // Reference same config
                '/v5.8.0/': [
                {
                    text: 'INTRODUCTION',
                    collapsed: false,
                    items: [
                        {text: 'Changelog', link: '/changelog'},
                        {text: 'Roadmap', link: '/roadmap'},
                        {text: 'Support', link: '/support'}
                    ]
                },
                {
                    text: 'INSTALLATION GUIDE',
                    collapsed: true,
                    items: [
                        {text: 'Server Requirements', link: '/v5.8.0/getting-started/server-requirements'},
                        {text: 'Preparations', link: '/v5.8.0/getting-started/preparations'},
                        {text: 'Server Initialization', link: '/v5.8.0/getting-started/server-initialization'},
                        {text: 'Server Setup', link: '/v5.8.0/getting-started/server-setup'},
                        {text: 'Upload Octeth To The Server', link: '/v5.8.0/getting-started/upload-octeth-to-server'},
                        {text: 'Octeth Installation', link: '/v5.8.0/getting-started/octeth-installation'},
                        {text: 'Backup Add-On Setup', link: '/v5.8.0/getting-started/backup-addon-setup'},
                        {text: 'Link Proxy Add-On Setup', link: '/v5.8.0/getting-started/link-proxy-addon-setup'},
                        {text: 'Octeth Configuration', link: '/v5.8.0/getting-started/octeth-configuration'},
                        {text: 'Monitoring', link: '/v5.8.0/getting-started/monitoring'},
                        {text: 'Octeth CLI Tool', link: '/v5.8.0/getting-started/octeth-cli-tool'},
                        {text: 'Sender Domain DNS Settings', link: '/v5.8.0/getting-started/sender-domain-dns-settings'},
                        {text: 'SSL Certificates', link: '/v5.8.0/getting-started/ssl-certificates'},
                        {text: 'Upgrading Octeth', link: '/v5.8.0/getting-started/upgrading-octeth'},
                        {text: 'Troubleshooting', link: '/v5.8.0/getting-started/troubleshooting'}
                    ]
                },
                {
                    text: 'USING OCTETH',
                    collapsed: true,
                    items: [
                        {
                            text: 'Features', items: [
                                {text: 'Users', link: '/v5.8.0/using-octeth/users'},
                                {text: 'Subscribers', link: '/v5.8.0/using-octeth/subscribers'},
                                {text: 'Lists', link: '/v5.8.0/using-octeth/lists'},
                                {text: 'Email Campaigns', link: '/v5.8.0/using-octeth/email-campaigns'},
                                {text: 'Journeys', link: '/v5.8.0/using-octeth/journeys'},
                                {text: 'Segments', link: '/v5.8.0/using-octeth/segments'},
                                {text: 'Tags', link: '/v5.8.0/using-octeth/tags'},
                                {text: 'Custom Fields', link: '/v5.8.0/using-octeth/custom-fields'},
                                {text: 'Auto Responders', link: '/v5.8.0/using-octeth/auto-responders'},
                                {text: 'Sender Domains', link: '/v5.8.0/using-octeth/sender-domains'},
                                {text: 'Email Builder', link: '/v5.8.0/using-octeth/email-builder'},
                                {text: 'Email Personalization', link: '/v5.8.0/using-octeth/email-personalization'},
                                {text: 'Event Tracking', link: '/v5.8.0/using-octeth/event-tracking'},
                                {text: 'SMS Messages', link: '/v5.8.0/using-octeth/sms-messages'},
                                {text: 'Cookbook', link: '/v5.8.0/using-octeth/cookbook'}
                            ],
                        }, {
                            text: 'Email Deliverability', items: [
                                {text: 'Email Sending', link: '/v5.8.0/using-octeth/email-deliverability/email-sending'},
                                {text: 'Email Tracking', link: '/v5.8.0/using-octeth/email-deliverability/email-tracking'},
                                {text: 'Bounce Processing', link: '/v5.8.0/using-octeth/email-deliverability/bounce-processing'},
                                {text: 'Complaint Processing', link: '/v5.8.0/using-octeth/email-deliverability/complaint-processing'},
                                {text: 'Unsubscriptions', link: '/v5.8.0/using-octeth/email-deliverability/unsubscriptions'},
                                {text: 'Suppression Lists', link: '/v5.8.0/using-octeth/email-deliverability/suppression-lists'},
                                {text: 'SPF/DKIM/DMARC', link: '/v5.8.0/using-octeth/email-deliverability/spf-dkim-dmarc'}
                            ],
                        }, {
                            text: 'Use Cases', items: [
                                {text: 'Internal Use', link: '/v5.8.0/using-octeth/use-cases/internal-use'},
                                {text: 'Agency Use', link: '/v5.8.0/using-octeth/use-cases/agency-use'},
                                {text: 'Enterprise Use', link: '/v5.8.0/using-octeth/use-cases/enterprise-use'},
                                {text: 'SaaS/ESP Use', link: '/v5.8.0/using-octeth/use-cases/saas-esp-use'}
                            ]
                        }
                    ]
                },
                {
                    text: 'INTEGRATIONS',
                    collapsed: true,
                    items: [
                        {text: 'Google Analytics', link: '/v5.8.0/using-octeth/integrations/google-analytics'},
                        {text: 'Stripo Email Builder', link: '/v5.8.0/using-octeth/integrations/stripo-email-builder'},
                        {text: 'Single Sign On (SSO)', link: '/v5.8.0/using-octeth/integrations/sso'},
                        {text: 'n8n Integration', link: '/v5.8.0/using-octeth/integrations/n8n-integration'}
                    ]
                },
                {
                    text: 'DEVELOPERS',
                    collapsed: true,
                    items: [
                        {
                            text: 'API Reference', items: [
                                {text: 'Getting Started', link: '/v5.8.0/api-reference/getting-started'},
                                {text: 'Authorization', link: '/v5.8.0/api-reference/authorization'},
                                {text: 'Error Handling', link: '/v5.8.0/api-reference/error-handling'},
                                {text: 'Admin', link: '/v5.8.0/api-reference/admin'},
                                {text: 'Reports', link: '/v5.8.0/api-reference/reports'},
                                {text: 'Auto Responders', link: '/v5.8.0/api-reference/autoresponders'},
                                {text: 'Campaigns', link: '/v5.8.0/api-reference/campaigns'},
                                {text: 'Custom Fields', link: '/v5.8.0/api-reference/customfields'},
                                {text: 'Delivery Servers', link: '/v5.8.0/api-reference/deliveryservers'},
                                {text: 'DNS', link: '/v5.8.0/api-reference/dns'},
                                {text: 'Email Gateway', link: '/v5.8.0/api-reference/emailgateway'},
                                {text: 'Journeys', link: '/v5.8.0/api-reference/journeys'},
                                {text: 'Journey Actions', link: '/v5.8.0/api-reference/journey-actions'},
                                {text: 'Lists', link: '/v5.8.0/api-reference/lists'},
                                {text: 'Re-Branding', link: '/v5.8.0/api-reference/rebranding'},
                                {text: 'Clients', link: '/v5.8.0/api-reference/clients'},
                                {text: 'Emails', link: '/v5.8.0/api-reference/emails'},
                                {text: 'Media Library', link: '/v5.8.0/api-reference/medialibrary'},
                                {text: 'SSO', link: '/v5.8.0/api-reference/sso'},
                                {text: 'Suppression Lists', link: '/v5.8.0/api-reference/suppression'},
                                {text: 'Settings', link: '/v5.8.0/api-reference/settings'},
                                {text: 'Event Tracking', link: '/v5.8.0/api-reference/eventtracking'},
                                {text: 'System', link: '/v5.8.0/api-reference/system'},
                                {text: 'Users', link: '/v5.8.0/api-reference/users'},
                                {text: 'Segments', link: '/v5.8.0/api-reference/segments'},
                                {text: 'Subscribers', link: '/v5.8.0/api-reference/subscribers'},
                                {text: 'Internal', link: '/v5.8.0/api-reference/internal'}
                            ]
                        },
                        {
                            text: 'Plug-In Development', items: [
                                {text: 'Hook Reference', link: '/v5.8.0/plugin-development/reference'}
                            ]
                        }
                    ]
                }
                ],
                '/v5.7.3/': [
                {
                    text: 'INTRODUCTION',
                    collapsed: false,
                    items: [
                        {text: 'Changelog', link: '/changelog'},
                        {text: 'Roadmap', link: '/roadmap'},
                        {text: 'Support', link: '/support'}
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
                        {text: 'SSL Certificates', link: '/v5.7.3/getting-started/ssl-certificates'},
                        {text: 'Upgrading Octeth', link: '/v5.7.3/getting-started/upgrading-octeth'},
                        {text: 'Troubleshooting', link: '/v5.7.3/getting-started/troubleshooting'}
                    ]
                },
                {
                    text: 'USING OCTETH',
                    collapsed: true,
                    items: [
                        {
                            text: 'Features', items: [
                                {text: 'Users', link: '/v5.7.3/using-octeth/users'},
                                {text: 'Subscribers', link: '/v5.7.3/using-octeth/subscribers'},
                                {text: 'Lists', link: '/v5.7.3/using-octeth/lists'},
                                {text: 'Email Campaigns', link: '/v5.7.3/using-octeth/email-campaigns'},
                                {text: 'Journeys', link: '/v5.7.3/using-octeth/journeys'},
                                {text: 'Segments', link: '/v5.7.3/using-octeth/segments'},
                                {text: 'Tags', link: '/v5.7.3/using-octeth/tags'},
                                {text: 'Custom Fields', link: '/v5.7.3/using-octeth/custom-fields'},
                                {text: 'Auto Responders', link: '/v5.7.3/using-octeth/auto-responders'},
                                {text: 'Sender Domains', link: '/v5.7.3/using-octeth/sender-domains'},
                                {text: 'Email Builder', link: '/v5.7.3/using-octeth/email-builder'},
                                {text: 'Email Personalization', link: '/v5.7.3/using-octeth/email-personalization'},
                                {text: 'Event Tracking', link: '/v5.7.3/using-octeth/event-tracking'},
                                {text: 'SMS Messages', link: '/v5.7.3/using-octeth/sms-messages'},
                                {text: 'Cookbook', link: '/v5.7.3/using-octeth/cookbook'}
                            ],
                        }, {
                            text: 'Email Deliverability', items: [
                                {text: 'Email Sending', link: '/v5.7.3/using-octeth/email-deliverability/email-sending'},
                                {text: 'Email Tracking', link: '/v5.7.3/using-octeth/email-deliverability/email-tracking'},
                                {text: 'Bounce Processing', link: '/v5.7.3/using-octeth/email-deliverability/bounce-processing'},
                                {text: 'Complaint Processing', link: '/v5.7.3/using-octeth/email-deliverability/complaint-processing'},
                                {text: 'Unsubscriptions', link: '/v5.7.3/using-octeth/email-deliverability/unsubscriptions'},
                                {text: 'Suppression Lists', link: '/v5.7.3/using-octeth/email-deliverability/suppression-lists'},
                                {text: 'SPF/DKIM/DMARC', link: '/v5.7.3/using-octeth/email-deliverability/spf-dkim-dmarc'}
                            ],
                        }, {
                            text: 'Use Cases', items: [
                                {text: 'Internal Use', link: '/v5.7.3/using-octeth/use-cases/internal-use'},
                                {text: 'Agency Use', link: '/v5.7.3/using-octeth/use-cases/agency-use'},
                                {text: 'Enterprise Use', link: '/v5.7.3/using-octeth/use-cases/enterprise-use'},
                                {text: 'SaaS/ESP Use', link: '/v5.7.3/using-octeth/use-cases/saas-esp-use'}
                            ]
                        }
                    ]
                },
                {
                    text: 'INTEGRATIONS',
                    collapsed: true,
                    items: [
                        {text: 'Google Analytics', link: '/v5.7.3/using-octeth/integrations/google-analytics'},
                        {text: 'Stripo Email Builder', link: '/v5.7.3/using-octeth/integrations/stripo-email-builder'},
                        {text: 'Single Sign On (SSO)', link: '/v5.7.3/using-octeth/integrations/sso'},
                        {text: 'n8n Integration', link: '/v5.7.3/using-octeth/integrations/n8n-integration'}
                    ]
                },
                {
                    text: 'DEVELOPERS',
                    collapsed: true,
                    items: [
                        {
                            text: 'API Reference', items: [
                                {text: 'Getting Started', link: '/v5.7.3/api-reference/getting-started'},
                                {text: 'Authorization', link: '/v5.7.3/api-reference/authorization'},
                                {text: 'Error Handling', link: '/v5.7.3/api-reference/error-handling'},
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
                            text: 'Plug-In Development', items: [
                                {text: 'Hook Reference', link: '/v5.7.3/plugin-development/reference'}
                            ]
                        }
                    ]
                }
                ],
                '/v5.7.2/': [
                {
                    text: 'INTRODUCTION',
                    collapsed: false,
                    items: [
                        {text: 'Changelog', link: '/changelog'},
                        {text: 'Roadmap', link: '/roadmap'},
                        {text: 'Support', link: '/support'}
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
                        text: 'INTRODUCTION',
                        collapsed: false,
                        items: [
                            {text: 'Changelog', link: '/changelog'},
                            {text: 'Roadmap', link: '/roadmap'},
                            {text: 'Support', link: '/support'}
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
                        text: 'INTRODUCTION',
                        collapsed: false,
                        items: [
                            {text: 'Changelog', link: '/changelog'},
                            {text: 'Roadmap', link: '/roadmap'},
                            {text: 'Support', link: '/support'}
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
            }
        })(),

        socialLinks: [
            {icon: 'github', link: 'https://github.com/orgs/octeth/repositories'}
        ],

        footer: {
            message: 'Any questions? <a href="https://octeth.com/contact/" target="_blank" rel="dofollow">Contact us</a>.',
            copyright: "&copy;Copyright 50SAAS LLC. All rights reserved."
        }
    }
})
