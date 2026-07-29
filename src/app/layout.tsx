import type { Metadata } from 'next';
import { Inter, Playfair_Display, Barlow_Condensed, Poppins } from 'next/font/google';
import { ThemeProvider, themeInitScript } from '@/context/theme-context';
import { AuthProvider } from '@/context/auth-context';
import { CartProvider } from '@/context/cart-context';
import { ToastProvider } from '@/context/toast-context';
import { CategoryMenuProvider } from '@/context/category-menu-context';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { MobileNav } from '@/components/layout/mobile-nav';
import { GroceryHeader } from '@/components/layout/grocery/grocery-header';
import { GroceryBottomTabBar } from '@/components/layout/grocery/grocery-bottom-tabs';
import { ThemeInjector } from '@/components/theme/theme-injector';
import { storeConfig } from '@/config/store.config';
import { getThemeInitScript } from '@/config/theme-init';
import './globals.css';

/* ------------------------------------------------------------------ */
/*  Font loading                                                       */
/*  All candidate fonts are loaded; CSS variables control which is     */
/*  active. Tree-shaking doesn't apply to font files, but Next.js     */
/*  only fetches the weights actually used in rendered HTML.           */
/* ------------------------------------------------------------------ */

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
});

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-barlow',
  weight: ['400', '600', '700', '800', '900'],
});

const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
  weight: ['400', '500', '600', '700', '800'],
});

/* Map config font names → CSS variable names */
const headingFontVar: Record<string, string> = {
  barlow: 'var(--font-barlow)',
  inter: 'var(--font-inter)',
  poppins: 'var(--font-poppins)',
};

const bodyFontVar: Record<string, string> = {
  inter: 'var(--font-inter)',
  poppins: 'var(--font-poppins)',
};

/* ------------------------------------------------------------------ */
/*  Metadata — driven by store config                                  */
/* ------------------------------------------------------------------ */

const { content } = storeConfig;

export const metadata: Metadata = {
  title: `${content.name} | ${content.tagline}`,
  description: content.metaDescription,
  keywords: [storeConfig.niche.toLowerCase(), 'online store', 'shop'],
  openGraph: {
    title: `${content.name} | ${content.tagline}`,
    description: content.metaDescription,
    type: 'website',
  },
};

/* ------------------------------------------------------------------ */
/*  Root Layout                                                        */
/* ------------------------------------------------------------------ */

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  /* Build inline style to set --font-heading and --font-body */
  const fontVars = {
    '--font-heading': headingFontVar[storeConfig.theme.fonts.heading] || headingFontVar.inter,
    '--font-body': bodyFontVar[storeConfig.theme.fonts.body] || bodyFontVar.inter,
  } as React.CSSProperties;

  /* ---- Layout shell selection (config-gated; fashion/baby untouched) ---- */
  const useGroceryHeader = storeConfig.headerStyle === 'grocery';
  const useBottomTabs = storeConfig.mobileNav === 'bottom-tabs';

  /* Bottom nav overlays content, so <main> needs matching bottom padding.
     Grocery tabs hide at `lg` (to match GroceryHeader); MobileNav hides at `md`. */
  const mainPadding = useBottomTabs ? 'flex-1 pb-16 lg:pb-0' : 'flex-1 pb-16 md:pb-0';

  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} ${barlowCondensed.variable} ${poppins.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script dangerouslySetInnerHTML={{ __html: getThemeInitScript() }} />
      </head>
      <body className="font-sans antialiased min-h-screen flex flex-col" style={fontVars}>
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <CategoryMenuProvider>
                <ToastProvider>
                  <ThemeInjector />
                  {useGroceryHeader ? <GroceryHeader /> : <Header />}
                  <main className={mainPadding}>{children}</main>
                  <Footer />
                  {useBottomTabs ? <GroceryBottomTabBar /> : <MobileNav />}
                </ToastProvider>
              </CategoryMenuProvider>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
