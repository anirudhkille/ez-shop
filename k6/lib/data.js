// Payload builders that satisfy the server's Zod schemas. Every record a test
// creates carries a unique suffix so parallel VUs and repeated runs never collide.

// A syntactically valid ObjectId that matches no document.
export const FAKE_ID = "507f1f77bcf86cd799439011";

export const uid = () =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

export const uniqueEmail = () => `k6.${uid()}@example.test`;

// nameSchema only allows letters, spaces and a few separators (no digits).
export const PERSON_NAME = "K Six Tester";

// A rotating set of search terms for browse/search traffic.
export const SEARCH_TERMS = [
  "shirt",
  "shoe",
  "jacket",
  "dress",
  "watch",
  "bag",
  "jeans",
  "cap",
];

export function shippingAddress(overrides = {}) {
  return Object.assign(
    {
      name: PERSON_NAME,
      addressLine1: "12 Load Test Lane",
      addressLine2: "Suite 4",
      city: "Mumbai",
      state: "Maharashtra",
      zipCode: "400001",
      country: "India",
      phone: "+91 98765 43210",
    },
    overrides,
  );
}

// Body for POST /address (a saved address belongs to the signed-in customer).
export function savedAddressPayload(overrides = {}) {
  return Object.assign(
    {
      label: "Home",
      isDefault: false,
    },
    shippingAddress(),
    overrides,
  );
}

export function categoryPayload(overrides = {}) {
  const id = uid();

  return Object.assign(
    { name: `K6 Category ${id}`, slug: `k6-category-${id}` },
    overrides,
  );
}

export function productPayload(categoryId, overrides = {}) {
  const id = uid();

  return Object.assign(
    {
      name: `K6 Product ${id}`,
      description: "Created by the k6 test suite. Safe to delete.",
      price: 999,
      discountPrice: 799,
      stock: 500,
      category: categoryId,
      publish: true,
      gender: "unisex",
      isFeatured: false,
      isBestSellers: false,
      tag: "New",
      variants: [
        {
          color: "Black",
          colorCode: "#000000",
          images: [],
          sizes: [
            { size: "M", stock: 100 },
            { size: "L", stock: 100 },
          ],
        },
      ],
    },
    overrides,
  );
}

export function couponPayload(overrides = {}) {
  return Object.assign(
    {
      code: `K6${uid()}`.toUpperCase(),
      type: "fixed",
      value: 50,
      description: "k6 test coupon",
      minOrderValue: 0,
    },
    overrides,
  );
}

export function guestOrderPayload(products, overrides = {}) {
  return Object.assign(
    {
      products,
      address: shippingAddress(),
      deliveryMethod: "standard",
      name: PERSON_NAME,
      email: uniqueEmail(),
      phone: "+91 98765 43210",
    },
    overrides,
  );
}

export function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
