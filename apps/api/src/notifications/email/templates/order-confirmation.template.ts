export function orderConfirmationTemplate(data: {
  customerName: string;
  invoiceNumber: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
  address: string;
  paymentMethod: string;
}): string {
  const itemRows = data.items
    .map(
      (i) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;">${i.name}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:center;">${i.quantity}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:right;">EGP ${(i.price * i.quantity).toFixed(2)}</td>
      </tr>`,
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:30px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
    <tr><td style="background:#1a1a2e;padding:24px 32px;text-align:center;">
      <h1 style="color:#e8b86d;margin:0;font-size:24px;">PrintByFalcon</h1>
      <p style="color:#fff;margin:8px 0 0;font-size:14px;">Order Confirmed!</p>
    </td></tr>
    <tr><td style="padding:32px;">
      <p style="font-size:16px;color:#333;">Hi <strong>${data.customerName}</strong>,</p>
      <p style="color:#555;">Your order has been placed successfully. Here's a summary:</p>

      <div style="background:#f9f9f9;border-radius:6px;padding:16px;margin:20px 0;">
        <p style="margin:0 0 8px;font-size:13px;color:#888;">ORDER NUMBER</p>
        <p style="margin:0;font-size:20px;font-weight:bold;color:#1a1a2e;">#${data.invoiceNumber}</p>
      </div>

      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:20px 0;">
        <thead>
          <tr style="background:#f0f0f0;">
            <th style="padding:10px 12px;text-align:left;font-size:13px;color:#555;">Product</th>
            <th style="padding:10px 12px;text-align:center;font-size:13px;color:#555;">Qty</th>
            <th style="padding:10px 12px;text-align:right;font-size:13px;color:#555;">Price</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">
        <tr>
          <td style="padding:6px 0;color:#555;font-size:14px;">Delivery Address</td>
          <td style="padding:6px 0;color:#333;font-size:14px;text-align:right;">${data.address}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#555;font-size:14px;">Payment Method</td>
          <td style="padding:6px 0;color:#333;font-size:14px;text-align:right;">${data.paymentMethod}</td>
        </tr>
        <tr style="border-top:2px solid #e8b86d;">
          <td style="padding:12px 0 6px;font-size:16px;font-weight:bold;color:#1a1a2e;">Total</td>
          <td style="padding:12px 0 6px;font-size:16px;font-weight:bold;color:#1a1a2e;text-align:right;">EGP ${data.total.toFixed(2)}</td>
        </tr>
      </table>

      <p style="color:#555;font-size:14px;">Estimated delivery: <strong>3-5 business days</strong></p>
      <p style="color:#555;font-size:14px;">You can track your order at <a href="https://printbyfalcon.com/orders" style="color:#e8b86d;">printbyfalcon.com/orders</a></p>
    </td></tr>
    <tr><td style="background:#1a1a2e;padding:20px 32px;text-align:center;">
      <p style="color:#aaa;font-size:12px;margin:0;">&copy; ${new Date().getFullYear()} PrintByFalcon. All rights reserved.</p>
    </td></tr>
  </table>
</body>
</html>`;
}
