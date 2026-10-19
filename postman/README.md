# Postman collection

Generated from the actual route files in `server/src/modules/*/*.routes.ts` — 81 requests covering all 80 API routes (plus a second `/product/filter` example).

## Files

| File | Purpose |
| --- | --- |
| `ez-shop.postman_collection.json` | The collection. |
| `ez-shop-local.postman_environment.json` | `baseUrl = http://localhost:7777/api` |
| `ez-shop-render.postman_environment.json` | `baseUrl = https://ez-shop-server.onrender.com/api` |

## Import

1. Postman → **Import** → drop in the collection **and** one environment.
2. Select the environment in the top-right picker.
3. Fill `userEmail` / `userPassword` and `adminEmail` / `adminPassword` (seeded accounts — signup needs an emailed OTP, so it can't be scripted end to end).

## Suggested run order

```
GET /api/health
GET /product            -> captures productId, productSlug
GET /category           -> captures categoryId
POST /user/login        -> captures accessToken
GET /user/profile
POST /address           -> captures addressId
POST /cart
POST /order/cod         -> captures orderId
POST /admin/login       -> captures adminToken
GET /order (admin)      -> captures orderId
```

IDs are captured automatically by the test scripts of the requests that list or create them, so run the parent first rather than pasting ObjectIds by hand.

## Auth model

- Access token: JWT in the response body at `data.token`, sent as `Authorization: Bearer <token>`.
- Refresh token: httpOnly `refreshToken` cookie, set by login. Postman keeps cookies per session, so `GET /user/refresh` works immediately after login.
- Collection auth is `Bearer {{accessToken}}`; the Admin folders override it with `{{adminToken}}`; public catalog reads override it with **No Auth**.

## Things that will look like failures but aren't

- **`POST /webhook`** always returns 400 as shipped. It needs a real Stripe signature — use `stripe listen --forward-to localhost:7777/api/webhook`.
- **`GET /invoice/:orderId/download`** returns a PDF, not JSON. Use **Send and Download**; the envelope test skips non-JSON responses.
- **Auth endpoints** are limited to 10 requests / 15 min per IP. Running the auth folder repeatedly gives 429.
- **`POST /user/refresh`** only works in the same Postman session that logged in — the credential is a cookie, not a header.

## Regenerating

The collection mirrors the route table. If a route changes, update the matching folder; the paths are grouped the same way the routers are (`/api/<module>`).
