import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import ClientShell from "@/components/ClientShell";
import { ThemeProvider } from "@/components/ThemeProvider";
import SessionProvider from "@/components/SessionProvider";
import { SITE } from "@/lib/site";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
});

const outfit = Outfit({
    subsets: ["latin"],
    variable: "--font-outfit",
});

export const metadata = {
    title: {
        default: SITE.name,
        template: `%s | ${SITE.name}`,
    },
    description: SITE.description,
    openGraph: {
        title: SITE.name,
        description: SITE.tagline,
        images: [SITE.logoUrl],
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
                <meta name="theme-color" content="#0c0a10" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                <link
                    rel="stylesheet"
                    href="https://kit-pro.fontawesome.com/releases/v7.2.0/css/pro.min.css"
                />
                <script
                    dangerouslySetInnerHTML={{
                        __html: `(function(){try{var t=localStorage.getItem('mystic-theme');if(!t)t=matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',t);document.documentElement.classList.toggle('dark',t==='dark')}catch(e){}})();`,
                    }}
                />
            </head>
            <body
                className={`${inter.variable} ${outfit.variable} flex min-h-screen flex-col antialiased`}
                style={{ "--font-display": "var(--font-outfit)" }}
            >
                <SessionProvider>
                    <ThemeProvider>
                        <ClientShell>{children}</ClientShell>
                    </ThemeProvider>
                </SessionProvider>
            </body>
        </html>
    );
}
