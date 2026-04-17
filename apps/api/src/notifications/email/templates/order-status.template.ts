export function orderStatusTemplate(data: {
  customerName: string;
  invoiceNumber: string;
  status: string;
  message: string;
}): string {
  const statusColors: Record<string, string> = {
    PAYMENT_CONFIRMED: '#2ecc71',
    PROCESSING: '#3498db',
    SHIPPED: '#9b59b6',
    OUT_FOR_DELIVERY: '#8e44ad',
    DELIVERED: '#27ae60',
    CANCELLED: '#e74c3c',
    REFUNDED: '#f39c12',
  };
  const color = statusColors[data.status] || '#555';

  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:30px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
    <tr><td style="background:#1a1a2e;padding:24px 32px;text-align:center;">
      <h1 style="color:#e8b86d;margin:0;font-size:24px;">PrintByFalcon</h1>
      <p style="color:#fff;margin:8px 0 0;font-size:14px;">Order Update</p>
    </td></tr>
    <tr><td style="padding:32px;">
      <p style="font-size:16px;color:#333;">Hi <strong>${data.customerName}</strong>,</p>
      <p style="color:#555;">Your order <strong>#${data.invoiceNumber}</strong> has been updated.</p>

      <div style="text-align:center;margin:32px 0;">
        <span style="display:inline-block;background:${color};color:#fff;padding:12px 32px;border-radius:24px;font-size:16px;font-weight:bold;letter-spacing:1px;">
          ${data.status.replace(/_/g, ' ')}
        </span>
      </div>

      <p style="color:#555;font-size:15px;text-align:center;">${data.message}</p>
      <p style="color:#555;font-size:14px;text-align:center;margin-top:24px;">
        <a href="https://printbyfalcon.com/orders" style="color:#e8b86d;">View your order &rarr;</a>
      </p>
    </td></tr>
    <tr><td style="background:#1a1a2e;padding:20px 32px;text-align:center;">
      <p style="color:#aaa;font-size:12px;margin:0;">&copy; ${new Date().getFullYear()} PrintByFalcon. All rights reserved.</p>
    </td></tr>
  </table>
</body>
</html>`;
}
