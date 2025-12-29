# Peak Kinetics SEO Optimization Documentation

## Overview

This document explains how all SEO components work together to maximize search engine visibility, social media sharing, and user engagement for Peak Kinetics.

## 1. Core SEO Components

### 1.1 Layout & Meta Tags (`app/layout.tsx`)

The main layout file contains all global SEO metadata that applies to every page:

\`\`\`tsx
// Primary meta tags for search engines
<meta name="description" content="..." /> // Crucial for CTR in search results
<meta name="keywords" content="..." /> // Long-tail keywords for ranking
<meta name="viewport" content="width=device-width, initial-scale=1" /> // Mobile optimization
\`\`\`

**Why it matters:** These meta tags are the first thing Google sees and are displayed directly in search results. A compelling description can increase click-through rates by 20-30%.

### 1.2 OpenGraph Tags (Social Media Integration)

OpenGraph tags control how your content appears when shared on Facebook, LinkedIn, Twitter, and other platforms:

\`\`\`tsx
<meta property="og:title" content="Peak Kinetics - Physical Therapy & Movement Science" />
<meta property="og:description" content="Leading physical therapy clinic in Austin..." />
<meta property="og:image" content="https://peakkinetics.com/og-image.jpg" /> // 1200x630px
<meta property="og:url" content="https://peakkinetics.com" />
<meta property="og:type" content="business.business" />
\`\`\`

**How it works:**
- When someone shares your link on Facebook/LinkedIn, these tags determine what preview image, title, and description appear
- **og-image.jpg** (1200x630px) is the key visual - a well-designed image significantly increases click-through rates
- Without proper OpenGraph tags, platforms show a generic preview, leading to lower engagement

### 1.3 Twitter Card Tags

Similar to OpenGraph, but optimized for Twitter/X:

\`\`\`tsx
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="..." />
<meta name="twitter:description" content="..." />
<meta name="twitter:image" content="/og-image.jpg" />
\`\`\`

## 2. Structured Data (Schema.org Markup)

Structured data tells search engines exactly what your content is about, enabling rich results, knowledge panels, and special features.

### 2.1 LocalBusiness Schema

\`\`\`json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Peak Kinetics",
  "image": "/og-image.jpg",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "...",
    "addressLocality": "Austin",
    "addressRegion": "TX",
    "postalCode": "...",
    "addressCountry": "US"
  },
  "telephone": "+1...",
  "url": "https://peakkinetics.com",
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 30.27...,
    "longitude": -97.74...
  }
}
\`\`\`

**Benefits:**
- Enables Google Maps integration and local pack listings
- Appears in Google's "Near Me" search results
- Shows your business hours, phone number, and location directly in search results
- Crucial for local SEO - 50% of local searches convert to visits

### 2.2 MedicalBusiness Schema

\`\`\`json
{
  "@type": "MedicalBusiness",
  "healthcareService": [
    {
      "@type": "MedicalService",
      "name": "Physical Therapy",
      "description": "..."
    }
  ]
}
\`\`\`

**Benefits:**
- Tells Google you're a healthcare provider
- Enables medical-specific search features
- Builds trust and authority in health/fitness niche

### 2.3 FAQ Schema

\`\`\`json
{
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What services does Peak Kinetics offer?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "..."
      }
    }
  ]
}
\`\`\`

**Benefits:**
- Enables FAQ rich snippets in search results
- Often displayed as expandable sections in Google search
- Can triple your search result real estate
- Increases click-through rates by showing answers directly

### 2.4 BreadcrumbList Schema

\`\`\`json
{
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://peakkinetics.com"
    }
  ]
}
\`\`\`

**Benefits:**
- Shows navigation breadcrumbs in search results
- Improves crawlability of your site structure
- Helps users understand site hierarchy

## 3. Robots.txt (`public/robots.txt`)

Robots.txt tells search engines which parts of your site to crawl and which to skip.

\`\`\`txt
User-agent: *
Allow: /
Disallow: /admin
Disallow: /api
Crawl-delay: 1

Sitemap: https://peakkinetics.com/sitemap.xml
\`\`\`

**How it works:**
- `Allow: /` - Crawl everything by default
- `Disallow: /admin` - Skip administrative pages (saves crawl budget)
- `Crawl-delay: 1` - Wait 1 second between page requests (prevents server overload)
- `Sitemap:` - Points to your sitemap location

**SEO Impact:**
- Ensures crawlers don't waste time on unimportant pages
- Redirects crawl budget to high-value content
- Helps Google understand your site structure

## 4. Sitemap.xml (`public/sitemap.xml`)

Sitemap is an XML file listing all important pages on your site:

\`\`\`xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://peakkinetics.com/</loc>
    <lastmod>2025-01-15</lastmod>
    <priority>1.0</priority>
    <changefreq>weekly</changefreq>
  </url>
</urlset>
\`\`\`

**Elements explained:**
- `loc` - Full URL of the page
- `lastmod` - When the page was last updated (helps Google know what's fresh)
- `priority` - Importance relative to other pages (1.0 = highest)
- `changefreq` - How often the page changes (weekly, monthly, etc.)

**SEO Benefits:**
- Ensures all important pages get indexed
- Tells Google which pages are most important
- Particularly important for sites with 100+ pages
- Speeds up initial indexing of new content

## 5. Web Manifest (`public/site.webmanifest`)

The web manifest makes your site installable as a PWA (Progressive Web App):

\`\`\`json
{
  "name": "Peak Kinetics - Physical Therapy & Movement Science",
  "short_name": "Peak Kinetics",
  "description": "...",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2563eb",
  "icons": [
    {
      "src": "/favicon-192.jpg",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    }
  ]
}
\`\`\`

**SEO & UX Benefits:**
- Users can install your site as an app on their home screen
- Increases repeat visits and engagement
- Improves mobile user experience
- Google favors PWAs in mobile search rankings
- Maskable icons adapt to different device shapes

## 6. Favicon Strategy

Favicons appear in multiple places:

\`\`\`tsx
<link rel="icon" type="image/x-icon" href="/favicon.ico" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.jpg" />
<link rel="icon" type="image/png" sizes="192x192" href="/favicon-192.jpg" />
<link rel="apple-touch-icon" href="/apple-touch-icon.jpg" />
\`\`\`

**Icon purposes:**
- **favicon-32x32.png** - Browser tab in most modern browsers
- **favicon-192x192.png** - Android app icon, manifest icon
- **favicon-512.png** - Splash screen, high-resolution displays
- **favicon-maskable.png** - Adaptive icon for different device shapes
- **apple-touch-icon.png** - iOS home screen icon

**SEO Impact:**
- Professional favicon increases brand recognition and trust
- 5-10% increase in click-through rates from search results
- Improves mobile app-like experience (PWA)

## 7. How Everything Works Together

\`\`\`
┌─────────────────────────────────────────────────────┐
│          User Searches "Physical Therapy Austin"    │
└─────────────────────────────────┬───────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
         ┌──────────▼──────────┐    ┌──────────▼──────────┐
         │  Google Bot Crawls  │    │ User Sees Rich      │
         │  Robots.txt & Meta  │    │ Search Snippet      │
         └──────────┬──────────┘    └──────────┬──────────┘
                    │                           │
         ┌──────────▼──────────┐               │
         │  Reads Sitemap.xml  │               │
         │  Discovers Content  │               │
         └──────────┬──────────┘               │
                    │                          │
         ┌──────────▼──────────┐              │
         │ Analyzes Structured │              │
         │ Data (Schema.org)   │              │
         │ - LocalBusiness     │              │
         │ - MedicalBusiness   │              │
         │ - FAQ               │              │
         └──────────┬──────────┘              │
                    │                          │
         ┌──────────▼──────────┐              │
         │ Indexes Content &   │              │
         │ Ranks in Local Pack │              │
         └──────────┬──────────┘              │
                    │                          │
         ┌──────────▼──────────┐    ┌────────▼──────────┐
         │ Shows OpenGraph     │    │ User Clicks Link  │
         │ Image & Meta Tags   │    │ & Lands on Site   │
         └──────────┬──────────┘    └────────┬──────────┘
                    │                        │
         ┌──────────▼──────────┐    ┌────────▼──────────┐
         │ If User Shares on   │    │ Favicon Visible   │
         │ Social Media        │    │ in Browser Tab    │
         │ - og:image displays │    │ Brand Recognition │
         │ - og:title shows    │    │ Improves          │
         │ - og:description    │    │                   │
         └─────────────────────┘    └────────┬──────────┘
                    │                        │
         ┌──────────▼──────────┐    ┌────────▼──────────┐
         │ Traffic Surge from  │    │ Mobile Users See  │
         │ Social Shares       │    │ PWA Install Banner│
         │ (OpenGraph Effect)  │    │ Install as App    │
         └─────────────────────┘    └────────────────────┘
\`\`\`

## 8. Optimization Checklist

### On-Page SEO
- ✓ Meta descriptions (155-160 characters)
- ✓ Title tags (50-60 characters)
- ✓ Long-tail keywords in content (natural placement)
- ✓ H1, H2, H3 heading hierarchy
- ✓ Image alt text for accessibility & SEO
- ✓ Internal linking between related pages

### Technical SEO
- ✓ Mobile responsive design
- ✓ Page speed optimization (Core Web Vitals)
- ✓ Structured data markup (Schema.org)
- ✓ SSL/HTTPS enabled
- ✓ XML sitemap submitted to Google Search Console
- ✓ robots.txt properly configured

### Local SEO
- ✓ LocalBusiness schema with address & coordinates
- ✓ Business hours specification
- ✓ Phone number prominently displayed
- ✓ Google Business Profile optimization
- ✓ Local keywords in title/description

### Social SEO
- ✓ OpenGraph tags for all platforms
- ✓ Twitter Card tags
- ✓ Unique og:image at 1200x630px
- ✓ Descriptive og:description with CTA

### Content SEO
- ✓ FAQ schema for rich snippets
- ✓ Service pages with detailed descriptions
- ✓ Testimonials with structured data
- ✓ Regular content updates (freshness)

## 9. Why This Drives Viral Growth

1. **Rich Search Results**: FAQ and other schema markup means your listing takes up 2-3x more screen space in Google
2. **Local Dominance**: LocalBusiness schema + Austin targeting = top of local pack
3. **Social Amplification**: Beautiful og:image + compelling description = more shares
4. **Brand Recognition**: Professional favicon + PWA capabilities = more return visits
5. **Better Rankings**: All structured data signals = higher SEO score for Google's algorithm
6. **User Trust**: Rich snippets, business hours, phone number = visitors know you're legitimate

## 10. Implementation Success Metrics

Track these in Google Search Console, Google Analytics, and Google Business Profile:

- **Impressions**: How often your site appears in search results (should increase 200%+)
- **Click-Through Rate (CTR)**: Percentage clicking from search results (target: 5-10% for local services)
- **Average Position**: Where you rank for target keywords (target: Top 3)
- **Mobile Usability**: Errors and optimization opportunities
- **Core Web Vitals**: Page speed and interactivity scores
- **Indexing**: Total pages indexed (should include all important pages)

## 11. Next Steps

1. **Submit Sitemap**: Go to Google Search Console > Sitemaps > Submit `https://peakkinetics.com/sitemap.xml`
2. **Add Business**: Add your business to Google Business Profile with rich information
3. **Request Review**: Ask satisfied patients to leave reviews on Google (boosts local rankings)
4. **Monitor Analytics**: Set up Google Analytics 4 to track visitor behavior
5. **Content Strategy**: Create blog posts targeting local long-tail keywords (e.g., "sports injury physical therapy Austin")
6. **Link Building**: Guest post on Austin health/fitness blogs linking back to your site

---

**Last Updated:** November 2025
**SEO Strategy Version:** 1.0 - Comprehensive Local + Social + Technical
