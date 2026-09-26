import assert from "node:assert/strict";
import { describe, it } from "node:test";

import PDFDocument from "pdfkit";

import Invoice from "@/modules/invoice/invoice.model.js";
import { buildInvoicePdf } from "@/modules/invoice/invoice.pdf.js";

/** Captures the strings the PDF actually renders, independent of font encoding. */
const renderText = (invoice: unknown) => {
  const doc = new PDFDocument({ size: "A4", margin: 50, compress: false });
  const seen: string[] = [];

  const original = doc.text.bind(doc);
  doc.text = ((chunk: unknown, ...rest: unknown[]) => {
    if (typeof chunk === "string") seen.push(chunk);
    return original(chunk as never, ...(rest as []));
  }) as typeof doc.text;

  doc.on("data", () => {});
  const done = new Promise<void>((resolve) => doc.on("end", resolve));

  buildInvoicePdf(doc, invoice as never);

  return done.then(() => seen);
};

const invoiceFixture = {
  invoiceNumber: "INV-2026-000001",
  customerName: "Anirudh Kille",
  customerEmail: undefined,
  customerPhone: "9876543210",
  address: {
    name: "Anirudh Kille",
    addressLine1: "12 MG Road",
    addressLine2: "Near City Mall",
    city: "Bengaluru",
    state: "Karnataka",
    zipCode: "560001",
    country: "India",
    phone: "9876543210",
  },
  products: [
    {
      name: "EZ Pro X1 Running Shoes",
      quantity: 1,
      price: 22696,
      size: "UK 9",
    },
    { name: "EZ Classic Tee", quantity: 2, price: 1199, size: "M" },
  ],
  subtotal: 25094,
  discount: 500,
  couponCode: "WELCOME10",
  deliveryCharge: 0,
  totalAmount: 24594,
  paymentType: "cod",
  paymentStatus: "pending",
  issuedAt: new Date("2026-04-09T10:00:00Z"),
};

describe("buildInvoicePdf", () => {
  it("renders invoice data without leaking undefined", async () => {
    const text = (await renderText(invoiceFixture)).join("\n");

    assert.equal(text.includes("undefined"), false);
    assert.ok(text.includes("INV-2026-000001"));
    assert.ok(text.includes("Anirudh Kille"));
    assert.ok(text.includes("12 MG Road"));
    assert.ok(text.includes("Rs. 25094.00"));
    assert.ok(text.includes("Rs. 24594.00"));
  });

  it("tolerates missing optional fields", async () => {
    const text = (
      await renderText({
        invoiceNumber: "INV-2026-000002",
        customerName: undefined,
        customerEmail: undefined,
        customerPhone: undefined,
        address: undefined,
        products: [],
        subtotal: 0,
        totalAmount: 0,
        issuedAt: new Date("2026-04-09T10:00:00Z"),
      })
    ).join("\n");

    assert.equal(text.includes("undefined"), false);
    assert.ok(text.includes("Guest customer"));
  });
});

describe("invoice document shape", () => {
  // Regression: spreading a mongoose document yields undefined for every
  // schema path, which silently blanked the whole PDF.
  it("must be converted with toObject before being spread", () => {
    const doc = new Invoice({
      invoiceNumber: "INV-2026-000003",
      order: "65f1a2b3c4d5e6f7a8b9c0d1",
      customerName: "Anirudh Kille",
      subtotal: 100,
      totalAmount: 100,
    });

    const spread = { ...doc } as Record<string, unknown>;

    assert.equal(spread.invoiceNumber, undefined);
    assert.equal(spread.totalAmount, undefined);
    assert.equal(doc.toObject().invoiceNumber, "INV-2026-000003");
    assert.equal(doc.toObject().totalAmount, 100);
  });
});
