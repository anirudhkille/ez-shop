// Mirrors the server's pagination cap (paginationQuerySchema / productQuerySchema).
// The API rejects any `limit` above this with a 400, so request it by name
// rather than scattering magic numbers across the dashboard.
export const MAX_PAGE_SIZE = 100;
