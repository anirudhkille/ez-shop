# Profile Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current 649-line tabbed profile with a real-data account workspace that uses a sticky account rail on desktop, a compact mobile navigator, refined order history, and a saved-items view.

**Architecture:** `pages/profile/profile.tsx` becomes a small URL-backed orchestrator. Focused components under `features/account/profile` own the account rail, overview, order list, and saved-items presentation. The current `useMyOrders`, `useWishlistDetails`, `useToggleWishlist`, `useUpdateProfile`, and `useUserStore` data sources remain unchanged.

**Tech Stack:** React 19, React Router 7, TanStack Query, Tailwind CSS 4, Lucide React, TypeScript, Zod (already installed but not required for this redesign).

## Global Constraints

- Reuse existing design tokens only; do not add a palette, font, dependency, or animation library.
- Use `Barlow Condensed` for display text and `Outfit` for body text through the existing `font-display` and `font-body` utilities.
- Keep orange for active navigation, focus, and primary actions only.
- Show real data only; remove phone, date of birth, gender, fake Reviews, avatar camera, and duplicate Logout.
- Motion stays within 150–180ms and respects the existing `prefers-reduced-motion` rules.
- Do not change backend APIs or the standalone `/wishlist` page.
- Preserve unrelated working-tree changes in checkout, products, filters, auth copy, and CSS.

---

## File Structure

**Create:**

- `client/src/features/account/profile/types.ts` — shared view and order-summary types.
- `client/src/features/account/profile/order-status.ts` — order status presentation metadata.
- `client/src/features/account/profile/account-rail.tsx` — identity, account navigation, and Logout.
- `client/src/features/account/profile/order-list.tsx` — order rows, loading state, and empty state.
- `client/src/features/account/profile/saved-items.tsx` — saved-item grid, remove action, and empty state.
- `client/src/features/account/profile/profile-overview.tsx` — overview, name editing, counts, recent orders, and saved preview.

**Modify:**

- `client/src/pages/profile/profile.tsx` — reduce to routing, queries, and section selection.
- `client/src/types/order.ts` — unchanged; `TProfileOrder` stays feature-local so API payload types are not widened.

---

### Task 1: Profile Data and Presentation Components

**Files:**
- Create: `client/src/features/account/profile/types.ts`
- Create: `client/src/features/account/profile/order-status.ts`
- Create: `client/src/features/account/profile/order-list.tsx`
- Create: `client/src/features/account/profile/saved-items.tsx`
- Modify: `client/src/pages/profile/profile.tsx:33-49, 326-493`

**Interfaces:**
- Produces: `ProfileView = "overview" | "orders" | "saved"`.
- Produces: `TProfileOrder` with `_id`, `createdAt`, `orderStatus`, `products`, and `totalAmount`.
- Produces: `getOrderStatusMeta(status?: string): { label: string; className: string }`.
- Produces: `OrderList({ orders, isLoading, compact }: OrderListProps)`.
- Produces: `SavedItems({ products, isLoading, limit, showAllLink }: SavedItemsProps)`.

- [ ] **Step 1: Write the failing browser regression check**

Create a one-off CDP script at `$env:TEMP/opencode/profile-regression.mjs` that:

1. Launches headless Chrome with a temporary profile and a dedicated debugging port.
2. Blocks network access to the real API.
3. Seeds `localStorage["user-store"]` with a token, name, and email.
4. Uses CDP `Fetch.requestPaused` to fulfill fixtures for:
   - `GET /api/order/my-orders`
   - `GET /api/wishlist/details`
   - `GET /api/cart/count` with `{ "success": true, "message": "Cart fetched", "data": { "count": 2 } }`
5. Navigates to `http://localhost:5173/profile`.

Use these order fixtures:

```js
const orderFixtures = [
  {
    _id: "65f0000000000000000000a1",
    createdAt: "2026-09-20T10:00:00.000Z",
    orderStatus: "delivered",
    products: [{ product: "p1", quantity: 1, price: 2499 }],
    totalAmount: 2499,
  },
  {
    _id: "65f0000000000000000000b2",
    createdAt: "2026-09-22T10:00:00.000Z",
    orderStatus: "processing",
    products: [{ product: "p2", quantity: 1, price: 1299 }],
    totalAmount: 1299,
  },
];
```

Use two saved products with unique ids, names, images, and prices.

The first assertions must describe the new design and therefore fail against the current page:

```js
const result = await Runtime.evaluate({
  expression: `(() => ({
    hasAccountNav: Boolean(document.querySelector('nav[aria-label="Account"]')),
    logoutCount: [...document.querySelectorAll('button, a')]
      .filter((element) => element.textContent.trim() === "Logout").length,
    hasFakeReviews: document.body.textContent.includes("Reviews"),
    hasPhoneField: document.body.textContent.includes("PHONE"),
    hasDateOfBirth: document.body.textContent.includes("DATE OF BIRTH"),
    hasGenderField: document.body.textContent.includes("GENDER"),
    hasFileInput: Boolean(document.querySelector('input[type="file"]')),
    hasDeliveredLabel: document.body.textContent.includes("Delivered"),
  }))()`,
});

if (!result.hasAccountNav) throw new Error("Missing account navigation rail");
if (result.logoutCount !== 1) throw new Error(`Expected one Logout action, found ${result.logoutCount}`);
if (result.hasFakeReviews) throw new Error("Fake Reviews stat is still present");
if (result.hasPhoneField || result.hasDateOfBirth || result.hasGenderField) {
  throw new Error("Unsupported personal fields are still present");
}
if (result.hasFileInput) throw new Error("Non-functional avatar upload control is still present");
if (!result.hasDeliveredLabel) throw new Error("Order status is not humanized");
```

- [ ] **Step 2: Run the check and verify RED**

Run:

```powershell
node "$env:TEMP/opencode/profile-regression.mjs"
```

Expected: FAIL with `Missing account navigation rail`.

- [ ] **Step 3: Create the shared profile types**

Create `types.ts`:

```ts
export const PROFILE_VIEWS = ["overview", "orders", "saved"] as const;

export type ProfileView = (typeof PROFILE_VIEWS)[0];

export type TProfileOrder = {
  _id: string;
  createdAt: string;
  orderStatus?: string;
  products?: unknown[];
  totalAmount: number;
};

export const isProfileView = (value: string | null): value is ProfileView =>
  PROFILE_VIEWS.some((view) => view === value);
```

- [ ] **Step 4: Create order status metadata**

Create `order-status.ts`:

```ts
const STATUS_META: Record<string, { label: string; className: string }> = {
  processing: {
    label: "Processing",
    className:
      "border-amber-400/20 bg-amber-400/10 text-amber-400",
  },
  shipped: {
    label: "Shipped",
    className:
      "border-brand-orange/20 bg-brand-orange/10 text-brand-orange",
  },
  delivered: {
    label: "Delivered",
    className: "border-green-400/20 bg-green-400/10 text-green-400",
  },
};

export const getOrderStatusMeta = (status?: string) =>
  STATUS_META[status ?? ""] ?? {
    label: status || "Unknown",
    className: "border-brand-border bg-muted/40 text-muted-foreground",
  };
```

This fixes the current bug where the API returns lowercase statuses but the page only styles capitalized keys.

- [ ] **Step 5: Create `OrderList`**

Implement `order-list.tsx` with:

- `OrderRow` rendering order reference `#<last 6 uppercase>`, formatted date, item count, total, and status pill.
- No chevron, because the row is not a link.
- `compact` limiting the rendered list to three orders.
- Three skeleton rows while `isLoading`.
- Empty state containing `Package`, `No orders yet`, and a `Browse products` link to `/products`.
- `border-brand-border divide-brand-border divide-y` for a denser list without nested card chrome.

Use `formatPrice` from `@/lib/formatPrice` and `Image` is not needed because order data does not expose populated product images.

- [ ] **Step 6: Create `SavedItems`**

Implement `saved-items.tsx` with:

- Grid: 2 columns on mobile, 4 columns from `sm`.
- `limit` slicing so Overview shows at most four products.
- `Image` with `object-contain`, existing wishlist remove behavior, product link, name, and price.
- A `View all` link to `/wishlist` when `showAllLink` is true.
- Three skeleton tiles while `isLoading`.
- Empty state containing `Heart`, `Nothing saved yet`, and a `Browse products` link.
- Buttons at least 44px on touch layouts.

- [ ] **Step 7: Wire the new components into the page temporarily**

In `pages/profile/profile.tsx`:

- Import `OrderList` and `SavedItems`.
- Map existing `OrderDoc[]` to `TProfileOrder[]` without changing the API hook.
- Replace the existing Orders block with `OrderList`.
- Replace the existing Wishlist block with `SavedItems`.
- Remove the duplicate “Recent Order” card and let Overview composition handle recent orders in Task 2.
- Pass query loading state from `useMyOrders` and `useWishlistDetails`.

Run:

```powershell
npm run build
```

Expected: PASS with no TypeScript errors.

- [ ] **Step 8: Commit Task 1**

```bash
git add client/src/features/account/profile client/src/pages/profile/profile.tsx
git commit -m "refactor(client): extract profile order and saved item views"
```

---

### Task 2: Account Rail, URL Views, and Overview

**Files:**
- Create: `client/src/features/account/profile/account-rail.tsx`
- Create: `client/src/features/account/profile/profile-overview.tsx`
- Modify: `client/src/pages/profile/profile.tsx`

**Interfaces:**
- Consumes: `ProfileView`, `TProfileOrder`, `OrderList`, `SavedItems`.
- Produces: `AccountRail({ name, email, view, onLogout }: AccountRailProps)`.
- Produces: `ProfileOverview({ name, email, orders, wishlistProducts, ordersLoading, wishlistLoading, onToggleWishlist }: ProfileOverviewProps)`.

- [ ] **Step 1: Add failing view-navigation assertions**

Extend the browser regression script:

```js
const clickResult = await Runtime.evaluate({
  expression: `(() => {
    const ordersLink = [...document.querySelectorAll('nav[aria-label="Account"] a')]
      .find((link) => link.textContent.trim() === "Orders");
    ordersLink.click();
    return true;
  })()`,
});
await sleep(500);

const ordersView = await Runtime.evaluate({
  expression: `JSON.stringify({
    url: location.href,
    hasHeading: document.body.textContent.includes("Orders"),
    currentLabel: document.querySelector('[aria-current="page"]')?.textContent.trim(),
    orderCount: [...document.querySelectorAll('[data-order-id]')].length,
  })`,
  returnByValue: true,
});
```

Expected before implementation: FAIL because there is no account nav.

- [ ] **Step 2: Run the extended check and verify RED**

Expected: FAIL at the account-nav click step.

- [ ] **Step 3: Create `AccountRail`**

Implement:

- `<nav aria-label="Account">` with `aria-label` exactly `Account`.
- Identity block: 48px avatar initial, name, and email.
- Local view links:
  - `Overview` → `/profile`
  - `Orders` → `/profile?view=orders`
  - `Saved items` → `/profile?view=saved`
- External links:
  - `Delivery addresses` → `/account/delivery-addresses`
  - `Update password` → `/account/update-password`
- Mark the active destination with `aria-current="page"` and orange text/background.
- One `Logout` button at the bottom; call the supplied `onLogout`.
- Desktop classes: `sticky top-24`.
- Mobile classes: horizontal `scrollbar-hide flex gap-1 overflow-x-auto`, 44px item height.
- Do not use click state for local view navigation; use real links so browser history works.

- [ ] **Step 4: Create `ProfileOverview`**

Implement:

- Small greeting, not a hero: `Good to see you, {first name}` and email.
- Inline real counts for orders and saved items.
- Name-only editor using `useUpdateProfile`:
  - Input label `Display name`
  - Save and Cancel buttons
  - Trim the submitted value and ignore empty values
  - Disable Save while pending or unchanged
  - Keep the existing success/error toast behavior
- Recent orders section with `View all` → `/profile?view=orders`.
- Saved items preview with `View all` → `/wishlist`.
- Quick links to addresses and password.
- No `Camera`, `Phone`, `Calendar`, DOB, or gender controls.

- [ ] **Step 5: Replace the tab/settings state with URL-backed view state**

In `pages/profile/profile.tsx`:

```ts
const [searchParams] = useSearchParams();
const requestedView = searchParams.get("view");
const view: ProfileView = isProfileView(requestedView) ? requestedView : "overview";
```

Remove:

- `tabs`
- `Tab`
- `activeTab`
- `settingsSection`
- all four settings subviews
- the old tab bar
- both in-page Logout buttons

Render:

```tsx
<main className="mx-auto w-full max-w-350 px-5 pt-24 pb-20 sm:px-8 lg:px-10">
  <div className="grid items-start gap-8 lg:grid-cols-[15rem_minmax(0,1fr)]">
    <AccountRail
      name={name}
      email={email}
      view={view}
      onLogout={handleLogout}
    />
    <div className="min-w-0">
      {view === "overview" && (
        <ProfileOverview
          name={name}
          email={email}
          orders={orders ?? []}
          wishlistProducts={wishlistProducts}
          ordersLoading={ordersLoading}
          wishlistLoading={wishlistLoading}
          onToggleWishlist={(productId) => toggleWishlist(productId)}
        />
      )}
      {view === "orders" && (
        <section aria-labelledby="orders-heading">
          <h1 id="orders-heading">Orders</h1>
          <OrderList orders={orders ?? []} isLoading={ordersLoading} />
        </section>
      )}
      {view === "saved" && (
        <section aria-labelledby="saved-heading">
          <h1 id="saved-heading">Saved items</h1>
          <SavedItems
            products={wishlistProducts}
            isLoading={wishlistLoading}
            showAllLink
          />
        </section>
      )}
    </div>
  </div>
</main>
```

Wrap the selected view in one keyed `motion.div` from the existing `motion` dependency. Use `useReducedMotion()`; animate `opacity` from 0 to 1 and `y` from 4px to 0 over 160ms with `cubic-bezier(0.16, 1, 0.3, 1)`. Do not animate card grids or individual rows.

- [ ] **Step 6: Run the browser regression and verify GREEN**

Run:

```powershell
node "$env:TEMP/opencode/profile-regression.mjs"
```

Expected: PASS, including:

- account nav exists
- one Logout action
- no fake Reviews or unsupported fields
- no file input
- `Delivered` status visible
- Orders link changes URL to `?view=orders`
- active link has `aria-current="page"`
- full order list shows two orders

- [ ] **Step 7: Run the build**

```powershell
npm run build
```

Expected: PASS.

- [ ] **Step 8: Commit Task 2**

```bash
git add client/src/features/account/profile client/src/pages/profile/profile.tsx
git commit -m "feat(client): redesign profile as an account workspace"
```

---

### Task 3: Empty, Loading, Responsive, and Accessibility Verification

**Files:**
- Modify: `client/src/features/account/profile/*.tsx`
- Modify: `client/src/pages/profile/profile.tsx`

**Interfaces:**
- Consumes all Task 1–2 interfaces.
- Produces verified final behavior; no new public API.

- [ ] **Step 1: Add failing empty-state assertions**

Switch the CDP fixture mode to empty responses and reload `/profile`:

```js
emptyMode = true;
await Page.reload();
```

Assert:

```js
const emptyState = await Runtime.evaluate({
  expression: `JSON.stringify({
    noOrders: document.body.textContent.includes("No orders yet"),
    nothingSaved: document.body.textContent.includes("Nothing saved yet"),
    browseLinks: [...document.querySelectorAll('a')]
      .filter((link) => link.textContent.trim() === "Browse products").length,
  })`,
  returnByValue: true,
});
```

Expected before final polish: FAIL if copy, actions, or loading/empty structure is missing.

- [ ] **Step 2: Add failing mobile and focus assertions**

Use CDP `Emulation.setDeviceMetricsOverride` with `390x844`, reload, then press Tab with `Input.dispatchKeyEvent` and assert:

```js
const nav = document.querySelector('nav[aria-label="Account"]');
const focused = document.activeElement;
({
  scrollsHorizontally: nav.scrollWidth > nav.clientWidth,
  itemMinHeight: Math.min(
    ...[...nav.querySelectorAll('a, button')].map((el) => el.getBoundingClientRect().height)
  ),
  focusVisible: focused.matches(':focus-visible'),
  focusOutline: getComputedStyle(focused).outlineStyle,
});
```

Requirements:

- `scrollsHorizontally` is true on mobile.
- Interactive item height is at least 44px.
- `focusVisible` is true after keyboard navigation.
- Focus outline is not `none`.

- [ ] **Step 3: Run the check and verify RED**

Expected: FAIL on any unimplemented empty/mobile/focus requirement.

- [ ] **Step 4: Implement the minimal final polish**

- Ensure skeleton dimensions match final rows/cards to prevent layout shift.
- Ensure empty states have one primary action each.
- Ensure the mobile rail does not wrap and uses the existing `scrollbar-hide` utility.
- Ensure all links/buttons have visible `focus-visible` outlines.
- Ensure status uses text plus color, never color alone.
- Ensure headings use sentence case and existing `font-display` classes.
- Remove any unused imports and dead props left by the old page.

- [ ] **Step 5: Run the full browser regression and verify GREEN**

```powershell
node "$env:TEMP/opencode/profile-regression.mjs"
```

Expected: PASS for populated, empty, desktop, and mobile scenarios.

- [ ] **Step 6: Capture desktop and mobile screenshots**

Extend the script to save:

- `$env:TEMP/opencode/profile-redesign-desktop.png` at 1440×1100
- `$env:TEMP/opencode/profile-redesign-mobile.png` at 390×844

Review both images for hierarchy, overflow, spacing, and whether the rail/content relationship is clear.

- [ ] **Step 7: Run project verification**

```powershell
npm run build
npm run lint
npx prettier --check "src/pages/profile/profile.tsx" "src/features/account/profile/**/*.tsx"
```

Expected: all commands exit 0 with no errors.

- [ ] **Step 8: Commit Task 3**

```bash
git add client/src/pages/profile/profile.tsx client/src/features/account/profile
git commit -m "polish(client): verify profile states and responsive behavior"
```
