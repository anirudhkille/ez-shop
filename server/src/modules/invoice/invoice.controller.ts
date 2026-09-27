import PDFDocument from "pdfkit";

import { asyncHandler } from "@/utils/asyncHandler";
import { buildInvoicePdf } from "@/modules/invoice/invoice.pdf";
import * as invoiceService from "@/modules/invoice/invoice.service";
import { Request, Response } from "express";

export const downloadInvoice = asyncHandler(
  async (req: Request, res: Response) => {
    const invoice = await invoiceService.getInvoiceForOrder(
      req.params.orderId,
      req.user?._id?.toString(),
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${invoice.invoiceNumber}.pdf"`,
    );

    const doc = new PDFDocument({ size: "A4", margin: 50 });
    doc.pipe(res);

    buildInvoicePdf(doc, invoice);
  },
);

export const getInvoice = asyncHandler(async (req: Request, res: Response) => {
  const invoice = await invoiceService.getInvoiceForOrder(
    req.params.orderId,
    req.user?._id?.toString(),
  );

  return res.status(200).json({
    success: true,
    message: "Invoice fetched successfully",
    data: invoice,
  });
});
