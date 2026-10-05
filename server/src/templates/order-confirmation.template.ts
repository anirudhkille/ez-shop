interface TemplateItem {
  name: string;
  quantity: number;
  price: number;
  size?: string;
}

interface TemplateOrder {
  id: string;
  name?: string;
  items: TemplateItem[];
  subtotal: number;
  discount?: number;
  couponCode?: string;
  deliveryCharge?: number;
  total: number;
  deliveryMethod?: string;
  paymentType?: string;
  address?: {
    name?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    phone?: string;
  };
}

const rupee = (value: number) => `\u20b9${Number(value ?? 0).toFixed(2)}`;

const row = (label: string, value: string, emphasis = false) => `
        <tr>
          <td style="padding: 6px 0; color: #555555; font-size: 14px;">${label}</td>
          <td style="padding: 6px 0; text-align: right; color: ${emphasis ? "#333333" : "#555555"}; font-size: ${emphasis ? "17px" : "14px"}; ${emphasis ? "font-weight: bold;" : ""}">${value}</td>
        </tr>`;

export const orderConfirmationTemplate = (
  order: TemplateOrder,
  trackUrl: string,
) => {
  const items = order.items
    .map(
      (item) => `
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #eeeeee; color: #333333; font-size: 14px;">
              ${item.name}${item.size ? ` <span style="color: #999999;">(Size ${item.size})</span>` : ""}
              <span style="color: #999999;"> &times; ${item.quantity}</span>
            </td>
            <td style="padding: 10px 0; border-bottom: 1px solid #eeeeee; text-align: right; color: #333333; font-size: 14px;">
              ${rupee(item.price * item.quantity)}
            </td>
          </tr>`,
    )
    .join("");

  const address = order.address
    ? `
      <div style="margin-top: 24px;">
        <p style="color: #999999; font-size: 12px; letter-spacing: 0.5px; text-transform: uppercase; margin: 0 0 8px 0;">
          Shipping address
        </p>
        <p style="color: #555555; font-size: 14px; line-height: 1.6; margin: 0;">
          ${order.address.name ?? ""}<br>
          ${order.address.addressLine1 ?? ""}${
            order.address.addressLine2 ? `, ${order.address.addressLine2}` : ""
          }<br>
          ${order.address.city ?? ""}, ${order.address.state ?? ""} ${order.address.zipCode ?? ""}<br>
          ${order.address.country ?? ""}
        </p>
      </div>`
    : "";

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f9f9f9; border: 1px solid #e0e0e0; border-radius: 10px;">
      <div style="text-align: center;">
        <img src="https://ez-shop.onrender.com/favicon.ico" alt="EZ Shop Logo" style="max-width: 120px; margin-bottom: 20px;">
      </div>

      <h2 style="color: #333333; text-align: center; margin-top: 0;">
        Thanks for your order
      </h2>

      <p style="color: #555555; font-size: 16px;">
        Hi <strong>${order.name ?? "there"}</strong>,
      </p>

      <p style="color: #555555; font-size: 16px; line-height: 1.6;">
        We have received your order. Your order number is
        <strong>#${order.id.slice(-6).toUpperCase()}</strong>.
      </p>

      <table role="presentation" style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        ${items}
      </table>

      <table role="presentation" style="width: 100%; border-collapse: collapse; margin-top: 16px;">
        ${row("Subtotal", rupee(order.subtotal))}
        ${
          order.discount
            ? row(
                `Discount${order.couponCode ? ` (${order.couponCode})` : ""}`,
                `- ${rupee(order.discount)}`,
              )
            : ""
        }
        ${order.deliveryCharge ? row(`Delivery (${order.deliveryMethod ?? "standard"})`, rupee(order.deliveryCharge)) : ""}
        ${row("Total", rupee(order.total), true)}
      </table>

      ${
        order.paymentType
          ? `<p style="color: #999999; font-size: 13px; margin-top: 6px;">Paying by ${order.paymentType === "cod" ? "cash on delivery" : "card"}.</p>`
          : ""
      }

      ${address}

      <p style="text-align: center; margin: 25px 0;">
        <a href="${trackUrl}" style="display: inline-block; background-color: #000000; color: #ffffff; padding: 14px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
          Track your order
        </a>
      </p>

      <p style="color: #555555; font-size: 16px; line-height: 1.6;">
        Thank you,<br>
        <strong>Anirudh Kille</strong>
      </p>

      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">

      <p style="font-size: 12px; color: #999999; text-align: center; line-height: 1.5;">
        &copy; 2026 EZ Shop. All rights reserved.<br>
        Developed by
        <a href="https://www.anirudhkille.com" style="text-decoration:none;color: #555555;">
          <strong>Anirudh Kille</strong>
        </a>
      </p>
    </div>
  `;
};
