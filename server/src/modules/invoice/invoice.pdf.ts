import PDFDocument from "pdfkit";

import { env } from "@/config/env.config";
import type { IInvoice } from "@/modules/invoice/invoice.model";

type Invoice = IInvoice & { products?: IInvoice["products"] };

const INK = "#1c1917";
const MUTED = "#78716c";
const LINE = "#e7e5e4";
const BRAND = "#ea580c";

const PAGE_MARGIN = 50;
const CONTENT_WIDTH = 595 - PAGE_MARGIN * 2;

const money = (value: number) => `Rs. ${(value ?? 0).toFixed(2)}`;

const formatDate = (value?: Date | string | null) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "-";

/** Streams a printable invoice PDF into `doc`. */
export const buildInvoicePdf = (doc: PDFKit.PDFDocument, invoice: Invoice) => {
  const rows = invoice.products ?? [];

  doc.rect(0, 0, 595, 90).fill(BRAND);
  doc.fillColor("#ffffff").fontSize(22).font("Helvetica-Bold");
  doc.text("EZ SHOP", PAGE_MARGIN, 30);
  doc.fontSize(9).font("Helvetica");
  doc.text("INVOICE", PAGE_MARGIN, 58);

  doc
    .fontSize(9)
    .fillColor("#ffffff")
    .text(invoice.invoiceNumber, PAGE_MARGIN, 58, {
      width: CONTENT_WIDTH,
      align: "right",
    });

  let y = 120;

  doc.fillColor(INK).fontSize(10).font("Helvetica-Bold");
  doc.text("Billed to", PAGE_MARGIN, y);
  doc.text("Invoice details", PAGE_MARGIN + 300, y);

  y += 16;
  doc.font("Helvetica").fontSize(9).fillColor(MUTED);

  const billed = [
    invoice.customerName,
    invoice.customerEmail,
    invoice.customerPhone,
  ].filter(Boolean);

  const details = [
    `Invoice no: ${invoice.invoiceNumber}`,
    `Issued: ${formatDate(invoice.issuedAt)}`,
    `Payment: ${invoice.paymentType ?? "-"} (${invoice.paymentStatus ?? "-"})`,
  ];

  doc.text(billed.join("\n") || "Guest customer", PAGE_MARGIN, y, {
    width: 260,
  });
  doc.text(details.join("\n"), PAGE_MARGIN + 300, y, { width: 245 });

  y += 70;

  if (invoice.address) {
    doc.font("Helvetica-Bold").fontSize(9).fillColor(INK);
    doc.text("Ship to", PAGE_MARGIN, y);
    y += 13;
    doc.font("Helvetica").fontSize(9).fillColor(MUTED);
    doc.text(
      [
        invoice.address.name,
        invoice.address.addressLine1,
        invoice.address.addressLine2,
        `${invoice.address.city}, ${invoice.address.state} ${invoice.address.zipCode}`,
        invoice.address.country,
        invoice.address.phone,
      ]
        .filter(Boolean)
        .join("\n"),
      PAGE_MARGIN,
      y,
      { width: CONTENT_WIDTH },
    );
    y += 60;
  }

  // Table header
  doc.rect(PAGE_MARGIN, y, CONTENT_WIDTH, 22).fill("#f5f5f4");
  doc.fillColor(MUTED).font("Helvetica-Bold").fontSize(9);
  doc.text("Item", PAGE_MARGIN + 10, y + 7, { width: 250 });
  doc.text("Qty", PAGE_MARGIN + 265, y + 7, { width: 40, align: "right" });
  doc.text("Rate", PAGE_MARGIN + 315, y + 7, { width: 70, align: "right" });
  doc.text("Amount", PAGE_MARGIN + 400, y + 7, {
    width: CONTENT_WIDTH - 410,
    align: "right",
  });

  y += 22;

  doc.font("Helvetica").fontSize(9);
  for (const item of rows) {
    const height = Math.max(
      24,
      doc.heightOfString(item.name, { width: 250 }) + 14,
    );

    if (y + height > 700) {
      doc.addPage();
      y = 50;
    }

    doc.fillColor(INK);
    const variant = [item.size && `Size ${item.size}`]
      .filter(Boolean)
      .join(" · ");

    doc.text(
      variant ? `${item.name}\n${variant}` : item.name,
      PAGE_MARGIN + 10,
      y + 7,
      { width: 250 },
    );
    doc.text(String(item.quantity), PAGE_MARGIN + 265, y + 7, {
      width: 40,
      align: "right",
    });
    doc.text(money(item.price), PAGE_MARGIN + 315, y + 7, {
      width: 70,
      align: "right",
    });
    doc.text(money(item.price * item.quantity), PAGE_MARGIN + 400, y + 7, {
      width: CONTENT_WIDTH - 410,
      align: "right",
    });

    y += height;
    doc
      .moveTo(PAGE_MARGIN, y)
      .lineTo(PAGE_MARGIN + CONTENT_WIDTH, y)
      .stroke(LINE);
  }

  y += 12;

  if (y > 660) {
    doc.addPage();
    y = 50;
  }

  const totals: [string, string, boolean?][] = [
    ["Subtotal", money(invoice.subtotal)],
  ];

  if (invoice.discount) {
    totals.push([
      `Discount${invoice.couponCode ? ` (${invoice.couponCode})` : ""}`,
      `-${money(invoice.discount)}`,
    ]);
  }

  if (invoice.deliveryCharge) {
    totals.push(["Delivery", money(invoice.deliveryCharge)]);
  }

  totals.push(["Total", money(invoice.totalAmount), true]);

  const boxX = PAGE_MARGIN + 250;

  for (const [label, value, strong] of totals) {
    if (strong) {
      doc
        .moveTo(boxX, y)
        .lineTo(PAGE_MARGIN + CONTENT_WIDTH, y)
        .stroke(LINE);
      y += 8;
    }

    doc
      .font(strong ? "Helvetica-Bold" : "Helvetica")
      .fontSize(strong ? 11 : 9)
      .fillColor(strong ? INK : MUTED);
    doc.text(label, boxX, y, { width: 160 });
    doc.text(value, PAGE_MARGIN + CONTENT_WIDTH - 140, y, {
      width: 140,
      align: "right",
    });

    y += strong ? 20 : 15;
  }

  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor(MUTED)
    .text(
      `Thank you for shopping with EZ Shop. Questions about this invoice? Contact ${env.CLIENT_URL}`,
      PAGE_MARGIN,
      760,
      { width: CONTENT_WIDTH, align: "center" },
    );

  doc.end();
};
