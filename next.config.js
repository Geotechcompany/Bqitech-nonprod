/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    poweredByHeader: false,
    compress: true,
    reactStrictMode: true,
    swcMinify: true,
    images: {
        domains: [
            'upload.wikimedia.org',
            'images.unsplash.com',
            'd1.awsstatic.com',
            'dl.dropboxusercontent.com',
            'bqitech.com'
        ],
    },
    async headers() {
        const isProduction = process.env.NODE_ENV === 'production';

        const cspDirectives = [
            `default-src 'self'`,
            `script-src 'self' ${isProduction ? '' : "'unsafe-inline' 'unsafe-eval'"} https://js.hcaptcha.com`,
            `script-src-elem 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/`,
            `style-src 'self' 'unsafe-inline'`,
            `img-src 'self' data: blob: https://dl.dropboxusercontent.com`,
            `connect-src 'self' https://*.clerk.accounts.dev https://*.clerk.dev https://clerk-telemetry.com https://*.googletagmanager.com https://www.googletagmanager.com https://www.google-analytics.com https://accounts.google.com https://hcaptcha.com https://sentry.hcaptcha.com ${process.env.NODE_ENV === 'development' ? 'ws://localhost:3000/_next/webpack-hmr http://localhost:10000' : ''} https://organic-hound-41949.upstash.io https://bqitech-nonprod-1.onrender.com https://bqitech.com`,
            `frame-src https://newassets.hcaptcha.com https://hcaptcha.com https://*.hcaptcha.com https://www.google.com/recaptcha/ https://recaptcha.google.com/recaptcha/`,
            `font-src 'self' data:`
        ];

        if (isProduction) {
            cspDirectives.push(
                `script-src-elem 'self' https://www.googletagmanager.com https://js.hcaptcha.com`
            );
        }

        const securityHeaders = [{
                key: 'Content-Security-Policy',
                value: cspDirectives.join('; ')
            },
            {
                key: 'X-Content-Type-Options',
                value: 'nosniff'
            }
        ];

        return [{
                source: '/sitemap.xml',
                headers: [{
                        key: 'Content-Type',
                        value: 'application/xml',
                    },
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=3600, must-revalidate',
                    },
                ],
            },
            {
                source: '/:path*',
                headers: securityHeaders,
            },
            {
                source: '/api/:path*',
                headers: [
                    { key: 'Access-Control-Allow-Origin', value: '*' },
                    { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
                    { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
                ],
            },
        ]
    },
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                net: false,
                tls: false,
                dns: false,
                child_process: false,
            };
        }

        config.module.rules.push({
            test: /\.(mpwebm)$/,
            use: {
                loader: "file-loader",
                options: {
                    publicPath: "/_next/static/videos/",
                    outputPath: "static/videos/",
                    name: "[name].[hash].[ext]",
                },
            },
        });

        return config;
    },
    async redirects() {
        return [{
                source: '/admin',
                destination: '/admin/overview',
                permanent: true,
            },
            {
                source: '/dashboard',
                destination: '/dashboard/overview',
                permanent: true,
            }
        ];
    },
    transpilePackages: ['@uiw/react-md-editor', 'react-beautiful-dnd'],
    async rewrites() {
        return [{
            source: '/sitemap.xml',
            destination: '/api/sitemap',
        }, ]
    },
    output: 'standalone',
};

module.exports = nextConfig;