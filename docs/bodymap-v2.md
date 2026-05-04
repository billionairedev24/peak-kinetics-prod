# BodyMap v2 — swapping the SVG silhouette for a licensed anatomical illustration

The current `frontend/components/BodyMap.tsx` draws the body entirely in hand-authored SVG with muscle group overlays. That's a solid upgrade from a flat silhouette, but it can't match a photographic/rendered anatomical illustration. When you want that level of realism, here are the three paths in order of effort.

---

## Option A — licensed anatomical illustration (PNG/WebP)

**Best for:** marketing polish; keeps everything you have now; small code change.

### Sources (in rough order of price/quality)

| Source | License | Cost | Notes |
|---|---|---|---|
| [Wikimedia Commons — "human muscular system"](https://commons.wikimedia.org/wiki/Category:Diagrams_of_the_human_musculature) | CC-BY or public domain | Free | Variable quality; some are very good. Attribution required for CC-BY. |
| [OpenStax Anatomy & Physiology](https://openstax.org/details/books/anatomy-and-physiology-2e) | CC-BY 4.0 | Free | Figures 10.13, 11.1, 11.2 are what you want. Attribution required. |
| [Servier Medical Art](https://smart.servier.com/) | CC-BY 3.0 | Free | Clean line-drawing style, very clinical. |
| [Shutterstock / Adobe Stock / iStock](https://www.shutterstock.com/) | Standard license | ~$10–50/image | Photo-realistic options; read license carefully for web use. |
| [3D4Medical / BioDigital Human](https://www.biodigital.com/) | Subscription | ~$50–200/mo | Interactive 3D; embed into iframe. Overkill unless you also want that on the app. |

### Integration

You'll need 4 images (front male, back male, front female, back female) at around 600×1100px PNG or WebP with transparent background.

1. Drop them in `frontend/public/anatomy/`:
   ```
   frontend/public/anatomy/front-male.webp
   frontend/public/anatomy/back-male.webp
   frontend/public/anatomy/front-female.webp
   frontend/public/anatomy/back-female.webp
   ```

2. In `BodyMap.tsx`, replace the `<g filter="url(#bodyShadow)">...</g>` block (the base body + muscle overlays) with a single `<image>` element:

   ```tsx
   <image
       href={`/anatomy/${view}-${sex}.webp`}
       x="0"
       y="0"
       width="280"
       height="560"
       preserveAspectRatio="xMidYMid meet"
   />
   ```

3. **Re-measure hotspot coordinates** against the new art. Easiest way: open the image in your browser with dev tools, click each region, read the pixel coords, divide by image width × 280 for `cx` and by image height × 560 for `cy`. Takes ~20 minutes.

4. Keep the existing hotspot + label + mobile-drawer code untouched — it operates purely on coordinates.

### Attribution

If you use a CC-BY source, add a credit line to `app/layout.tsx`'s footer or the BodyMap itself:

```tsx
<p className="text-[10px] text-muted-foreground text-center mt-2">
    Anatomical illustration © OpenStax, CC BY 4.0
</p>
```

---

## Option B — Sketchfab 3D embed

**Best for:** wow-factor on the landing page. Users can rotate the model themselves.

1. Pick a model at [sketchfab.com/3d-models](https://sketchfab.com/3d-models) — search "human anatomy male muscles" or similar. Look for free, commercially licensed models.
2. Open model → **Embed** → copy the iframe URL.
3. Replace the entire `<svg>` block in `BodyMap.tsx` with:

   ```tsx
   <iframe
       title="Anatomical model"
       src="https://sketchfab.com/models/<model-id>/embed?autospin=1&ui_controls=0"
       className="w-full aspect-[1/1.4] border-0 rounded-2xl"
       allowFullScreen
   />
   ```

Tradeoffs:
- **Hotspots stop working** because Sketchfab iframes don't let you overlay clickable UI on specific regions. You'd rely on the region list outside the iframe.
- Heavy (~5–10MB WebGL scene). Lazy-load with `next/dynamic` + `{ ssr: false }`.
- Sketchfab branding visible unless you pay for the business tier.

---

## Option C — BioDigital Human API

**Best for:** real clinical application; expensive.

- Interactive 3D with layered anatomy (muscles / bones / nerves toggle).
- Real clickable regions with medical metadata.
- $79/month starter, $249+ for commercial embedding.
- SDK: `https://developer.biodigital.com/`

Probably overkill for a clinic marketing site. Revisit if Peak Kinetics builds a patient education app.

---

## Recommendation

For a marketing site serving a PT clinic:

1. **Now:** the SVG version in `BodyMap.tsx` is fine — realistic enough, fully controllable, zero licensing, zero external dependencies.
2. **Next iteration:** buy one set of 4 Shutterstock illustrations (~$100) and switch to Option A. Biggest visible win.
3. **Not yet:** 3D or BioDigital unless there's a clinical product justifying the cost.

## Hotspot coordinate format (stable across all options)

Whatever artwork you swap in, each region in `BodyMap.tsx` keeps:

```ts
{
    id: "knee-r",
    name: "Right Knee",
    shortLabel: "R Knee",
    views: ["front", "back"],
    coords: {
        front: { cx: 170, cy: 405, labelSide: "right" },
        back:  { cx: 110, cy: 405, labelSide: "left"  },
    },
    // ...
}
```

`cx` and `cy` are in the SVG viewBox space (currently 280×560). As long as your new artwork fills that same viewBox, coordinates transfer directly.
