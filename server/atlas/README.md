# Atlas Search

`product-search-index.json` is the Atlas Search index used by the storefront
when `ATLAS_SEARCH_INDEX=product_search` is set. It is shaped as an Atlas Admin
API payload: name `product_search`, database `ez-shop`, collection `products`.

Create it once in the Atlas UI (**Search** → **Create Search Index** → JSON
editor) by pasting the `mappings` object, or send the whole file to the Atlas
Admin API. The index is free on the M0 tier. Set `database`/`collection` to
match your deployment if they differ from `ez-shop`/`products`.

When the variable is blank, or the index is not available, the API falls back
to the MongoDB text index and prefix index declared in
`server/src/modules/product/product.model.ts`. The fallback keeps local
development and CI working, but Atlas Search is what provides typo tolerance
and edge-gram autocomplete in production.
