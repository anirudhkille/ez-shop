# Profile Redesign Design

Date: 2026-09-25
Scope: `client/src/pages/profile/profile.tsx` and focused `client/src/features/account/profile/*` components.

## Goal

Turn `/profile` into a dense, trustworthy account workspace that fits the existing dark EZ Shop theme. The page should show real customer data, make account destinations obvious, and remove empty or unsupported UI.

## Problems in the current page

- A large hero consumes the top third of the page without providing useful actions.
- A detached pill tab bar competes with the header and behaves like four equal destinations even though the sections are not equal in importance.
- Personal info shows unsupported fields: phone, date of birth, and gender.
- The camera button has no upload implementation.
- Reviews is hard-coded to `0` instead of real data.
- Logout appears twice.
- Empty order and wishlist states are large voids.
- The page is a single 649-line component with tab, settings-subview, form, order, and wishlist state together.

## Design direction: account workspace

### Visual system

- Reuse the existing near-black surfaces, `Barlow Condensed` display type, `Outfit` body type, orange brand accent, border tokens, and 15–18px radius.
- Do not add a new palette, font, or decorative gradient.
- Reserve orange for the active navigation item, focus, and primary actions.
- Use one orange identity mark (avatar initial) and quieter supporting surfaces.
- Use information rows and sections rather than a grid of identical stat cards.

### Layout

Desktop:

- Sticky account rail on the left containing identity, Overview, Orders, Saved items, Delivery addresses, Update password, and Logout.
- Focused content panel on the right.
- Rail width approximately 15–16rem; content uses the remaining page width.

Mobile:

- Identity summary first.
- Compact horizontally scrollable account navigation below identity, with the existing hidden-scrollbar utility.
- Content stacks below navigation.
- Touch targets remain at least 44px.

The current view is stored in the `view` search parameter (`overview`, `orders`, or `saved`) so browser back/forward works. Addresses and password use their existing routes.

## Content

### Identity

- Avatar initial.
- Display name.
- Email address.
- No avatar camera control until upload is implemented.

### Overview

- Greeting with display name.
- Real counts for orders and saved items.
- Display-name editing only; email is read-only.
- Recent orders (up to three) with order reference, date, item count, status, and total.
- Saved-items preview (up to four products) with remove action and a link to the full wishlist.
- Quick links to delivery addresses and password.
- Empty states explain what happened and provide one clear action.

### Orders

- Full order history.
- Clear order reference, date, item count, status, and total.
- No decorative chevron because rows are not clickable unless a real detail route is added.
- Compact loading skeleton while the query runs.
- Empty state: “No orders yet” with a Browse products action.

### Saved items

- Product grid using the existing product image/name/price pattern.
- Remove action on each item.
- View all link to `/wishlist`.
- Empty state: “Nothing saved yet” with a Browse products action.

### Account destinations

- Delivery addresses: `/account/delivery-addresses`.
- Update password: `/account/update-password`.
- Logout appears once at the bottom of the account rail.

## Component boundaries

- `pages/profile/profile.tsx`: URL-backed view state, queries, and section selection.
- `features/account/profile/account-rail.tsx`: identity, navigation, active state, external account links, and logout.
- `features/account/profile/profile-overview.tsx`: overview composition and name editing.
- `features/account/profile/order-list.tsx`: order rows, status, loading, and empty state.
- `features/account/profile/saved-items.tsx`: product preview/grid and empty state.

Shared order-summary and status types move out of the page into the account feature or `types/order.ts`.

## Interaction and motion

- Navigation and buttons use 150–180ms color/border/transform transitions.
- Content changes use one subtle 160ms opacity and small vertical transition.
- No entrance animation on every card, no gradient wash, and no continuous decoration.
- Active scale on buttons is at most `0.98`.
- Focus-visible styling is preserved.
- Global reduced-motion rules continue to disable non-essential motion.

## Accessibility

- Use semantic `nav` with an accessible label.
- Mark the current view with `aria-current="page"`.
- Associate the editable name label, input, and validation/status messaging.
- Use `aria-busy` on loading regions.
- Keep visible keyboard focus.
- Do not rely on color alone for order status; status text remains visible.
- Ensure mobile navigation is keyboard accessible and horizontally scrollable without a visible scrollbar.

## Verification

- Overview, Orders, and Saved items render with real data and with empty data.
- Name editing saves through `useUpdateProfile` and updates the identity everywhere.
- Order counts and saved-item counts come from live queries, never hard-coded values.
- No unsupported personal fields, camera control, fake Reviews stat, or duplicate Logout remain.
- View selection is reflected in `?view=` and browser back/forward works.
- Desktop rail is sticky; mobile rail scrolls horizontally.
- Loading skeletons prevent layout shift.
- Keyboard navigation, focus visibility, and reduced motion are verified.
- Client typecheck/build, lint, and formatting checks pass.
- Desktop and mobile screenshots are reviewed against the approved design.

## Out of scope

- Avatar upload and image storage.
- Phone, date of birth, or gender support.
- Review history.
- Order detail pages.
- Redesigning the standalone `/wishlist` page.
- Backend API changes.
