# Task ID: 6 — Marketplace redesign + Product Detail + Vendor Profile

## Scope
Three files (all `"use client"`):
1. `src/components/views/marketplace-view.tsx` (overwrote existing)
2. `src/components/views/product-detail-view.tsx` (new)
3. `src/components/views/vendor-profile-view.tsx` (new)

## Signatures implemented
- `MarketplaceView({ listings, vendors, onGetStarted })` — matches `AppShell` usage
- `ProductDetailView({ listing, allListings, vendors })` — matches `AppShell` usage
- `VendorProfileView({ vendor, listings })` — matches `AppShell` usage

## File 1: Marketplace View
- **Hero**: teal gradient, eyebrow "Healthcare Services Marketplace", headline "The B2B Commerce Platform for Men's Health Operations", two CTAs (Become a Vendor + Browse Catalog → scrolls to #listings), 4 qualitative trust indicators (Verified supplier badges, Quote & bulk-order workflows, Equipment financing indicators, Clinical-claim moderation).
- **Category navigation bar**: sticky horizontal scrollable pills for every `MARKETPLACE_CATEGORIES` entry with a lucide icon (FlaskConical for labs, Syringe for injections, etc.). Active pill highlighted teal. Clicking sets category filter and scrolls to listings.
- **Listings section** (`SectionShell id="listings"`): two-column layout:
  - Left filter sidebar (sticky on desktop, Sheet on mobile via `@/components/ui/sheet`): keyword search, category select, listing type select, vendor select, verified-only switch, pricing model select, availability select.
  - Right main column: results header with count + applied FilterChips + sort Select + ViewToggle (grid/list). Listing cards: colored banner (h-28) with white CategoryIcon + SaveButton + CompareToggle + verified/under-review badge. Vendor name (clickable → vendor-profile), title (clickable → product-detail), category/type pills, description (line-clamp-2), pricing (priceNote + pricing model), availability pill (in-stock=teal, made-to-order=amber, limited=violet, preorder=sky), financing-available tag for equipment categories, footer with Request Quote (primary, opens dialog) + Details (outline, navigates). Empty state with reset. Pagination (9 per page) using `@/components/ui/pagination`. 300ms simulated loading shimmer via CardSkeleton — implemented with "adjusting state during render" pattern + setTimeout-only effect (no setState-in-effect warnings).
- **Vendor directory preview** (`SectionShell tone="muted"`): cards for verified vendors with logo color block, name, VerificationBadge, listing count, "View vendor profile" → vendor-profile.
- **Vendor portal preview**: 8 feature cards (Create profile, Submit products/services, Upload media, Manage listings, Receive inquiries, Respond to quotes, Track performance, Manage billing). CTA "Become a Vendor" → onGetStarted.
- **Marketplace safety section**: `DisclaimerBanner` tone="teal" with the 6 review types (vendor verification, product review, service review, claim review, category approval, listing approval) as labeled items.
- **CTA**: `CTASection` "Reach men's health clinics seeking your solutions", primary onGetStarted, secondary "Explore Workforce" secondaryView="workforce", tone="dark".

## File 2: Product Detail View
- **Breadcrumbs**: Marketplace > {category} > {product title} (via `Breadcrumbs`).
- **Hero header** (two-column on desktop):
  - Left: large product banner (h-48, colored, with CategoryIcon), title (large heading), vendor name (clickable → vendor-profile) + VerificationBadge, category/type/availability pills, financing pill if eligible, description, SaveButton + Request Quote + Compare toggle button.
  - Right: pricing & quote card — price note prominent, pricing model, availability pill, financing-eligible pill, compact quote form (name, email, org, quantity, notes, consent) → POST `/api/quote` with `{ listingId, requesterName, requesterEmail, requesterOrg, quantity, notes }`. Uses `toast` from sonner. Success state.
- **StickyTabNav** with tabs: Overview, Specifications, Pricing & Financing, Shipping & Fulfillment, Vendor, FAQs. Right slot: Request Quote button (opens dialog).
- **Overview tab**: full description paragraphs, what's included grid, use cases for men's health clinics.
- **Specifications tab**: `MetaRow` grid with category, type, pricing model, price, availability, vendor. Note that detailed specs are confirmed with vendor during quote.
- **Pricing & Financing tab**: price note card, pricing model explanation (switch over model), bulk orders note, financing & leasing inquiry support card for equipment categories (clearly a platform capability).
- **Shipping & Fulfillment tab**: note that shipping coordinated directly with vendor; lead times confirmed during quote. Freight, onboarding sub-cards.
- **Vendor tab**: vendor snapshot card with logo color block, name, VerificationBadge, overview, listing count, website link, "View full vendor profile" button.
- **FAQs tab**: 5 Q&A items using `@/components/ui/accordion` (quote process, bulk pricing, financing/leasing, verification badge, clinical-claim moderation).
- **Related products**: 3 compact cards (same category or same vendor) linking to product-detail.
- **DisclaimerBanner** about Novalyte not selling/warranting products, quotes from vendor, medical claims subject to moderation + `MedicalDisclaimer`.

## File 3: Vendor Profile View
- **Breadcrumbs**: Marketplace > Vendors > {vendor name}.
- **Hero header**: vendor logo color block (large, h-24), vendor name (heading), VerificationBadge, website link (if present), overview text, "Contact vendor" (opens dialog) + "Browse marketplace" + "Become a vendor" buttons. Side snapshot card with status, active listings, categories, verified listings counts.
- **StickyTabNav** with tabs: Overview, Products & Services, Verification, Contact. Right slot: Contact button (opens dialog).
- **Overview tab**: full overview, "what they offer" cards, categories they serve (derived from their listings) as clickable pills.
- **Products & Services tab**: grid of `VendorListingCard` (compact) — each with banner, title (→ product-detail), category/type/availability pills, description, pricing, SaveButton, CompareToggle, Request Quote (opens per-card dialog), Details. Quote dialog uses `QuoteInlineForm` POSTing to `/api/quote`.
- **Verification tab**: status card, "What verification means" + "What verification is not" cards, `MetaRow` for total/verified/under-review listing counts, amber disclaimer.
- **Contact tab**: contact/quote inquiry form posting to `/api/contact` with role="vendor" (composed message includes vendor name + listing ref if available). Side cards for inquiry routing, response time, independent diligence.
- **DisclaimerBanner** about vendor independence + `MedicalDisclaimer`.

## Critical patterns & fixes
- **State management**: `useSaved` (kind="product") + `useCompare` (kind="product") stores from `@/lib/nav`. Cards subscribe to the products arrays directly so save/compare toggles re-render reactively.
- **Navigation**: `navigate("vendor-profile" | "product-detail" | "marketplace", undefined, { id })` for view switching.
- **CategoryIcon**: stable wrapper component (switch with literal JSX returns) — avoids React Compiler's "Cannot create components during render" warning that fires when assigning a component to a Capitalized variable from a function call (`iconForCategory(...)`).
- **"Adjusting state during render"**: used for both filter-change resets (page reset + loading flag in marketplace) and tab resets (activeTab on listing/vendor change in detail/profile views). Endorsed by React docs to avoid `react-hooks/set-state-in-effect` warnings.
- **Loading shimmer**: setTimeout-only effect (no synchronous setState) clears the loading flag 300ms after filters settle.
- **API integration**: quote requests POST to `/api/quote` (existing route with Zod validation); vendor contact POSTs to `/api/contact` with `role: "vendor"` (existing route). All forms include consent checkboxes.
- **Theme**: teal/emerald primary, violet for financing tags, amber for under-review badges, sky for preorder. No indigo/blue.
- **Responsive**: filter sidebar collapses to `Sheet` on mobile (`lg:block` for desktop sidebar; Sheet trigger shown on `lg:hidden`). Sticky tab nav has horizontal scroll on mobile.
- **Premium polish**: PremiumCard with hover, `card-premium-hover`, `shadow-premium-sm/lg`, `novalyte-fade-up` on grids, `shadow-premium-xs` on filter cards.

## Validation
- `bun run lint` clean (exit 0, no errors, no warnings) for all three files.
- The dev server currently returns HTTP 500 because AppShell imports `clinic-profile-view` and `job-detail-view` which are being built by other agents in parallel — those are out of scope for Task ID 6. My three files compile and lint cleanly; once the other agents finish their files, the marketplace, product detail, and vendor profile flows will render end-to-end.

## Files
- `/home/z/my-project/src/components/views/marketplace-view.tsx`
- `/home/z/my-project/src/components/views/product-detail-view.tsx`
- `/home/z/my-project/src/components/views/vendor-profile-view.tsx`
