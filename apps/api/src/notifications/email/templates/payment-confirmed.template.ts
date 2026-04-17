export function paymentConfirmedTemplate(data: {
  customerName: string;
  amount: number;
  invoiceNumber: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:30px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
    <tr><td style="background:#1a1a2e;padding:24px 32px;text-align:center;">
      <h1 style="color:#e8b86d;margin:0;font-size:24px;">PrintByFalcon</h1>
      <p style="color:#fff;margin:8px 0 0;font-size:14px;">Payment Confirmed</p>
    </td></tr>
    <tr><td style="padding:32px;text-align:center;">
      <div style="font-size:48px;margin-bottom:16px;">&#10003;</div>
      <p style="font-size:18px;color:#333;">Hi <strong>${data.customerName}</strong>!</p>
      <p style="color:#555;font-size:15px;">Your payment has been received successfully.</p>

      <div style="background:#f9f9f9;border-radius:6px;padding:24px;margin:24px auto;max-width:280px;">
        <p style="margin:0 0 8px;font-size:12px;color:#888;text-transform:uppercase;">Amount Paid</p>
        <p style="margin:0 0 16px;font-size:28px;font-weight:bold;color:#1a1a2e;">EGP ${data.amount.toFixed(2)}</p>
        <p style="margin:0 0 4px;font-size:12px;color:#888;text-transform:uppercase;">Order Number</p>
        <p style="margin:0;font-size:16px;font-weight:bold;color:#1a1a2e;">#${data.invoiceNumber}</p>
      </div>

      <p style="color:#555;font-size:14px;">Your order is now being processed and will be shipped soon.</p>
      <p style="margin-top:24px;">
        <a href="https://printbyfalcon.com/orders" style="background:#e8b86d;color:#1a1a2e;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:14px;">Track My Order</a>
      </p>
    </td></tr>
    <tr><td style="background:#1a1a2e;padding:20px 32px;text-align:center;">
      <p style="color:#aaa;font-size:12px;margin:0;">&copy; ${new Date().getFullYear()} PrintByFalcon. All rights reserved.</p>
    </td></tr>
  </table>
</body>
</html>`;
}
