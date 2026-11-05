// ============================================================================
// Hourly Tourism - Tax Invoice & Receipt Generator
// ============================================================================

import { formatCurrency, formatDate } from './utils'

export interface InvoiceDetails {
  bookingNumber: string
  invoiceNumber: string
  bookingDate: string
  startTime: string
  endTime: string
  durationHours: number
  serviceTitle: string
  serviceCategory: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  providerName: string
  providerGst?: string
  pickupLocation?: string
  hourlyRate: number
  basePrice: number
  extraCharges?: number
  platformFee: number
  taxes: number
  discount?: number
  totalAmount: number
  paymentMethod?: string
  paymentStatus?: string
  paymentId?: string
}

export function printBookingInvoice(details: InvoiceDetails) {
  const invoiceHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Tax Invoice - ${details.bookingNumber}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 40px; color: #111827; background: #fff; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0a4d29; padding-bottom: 24px; margin-bottom: 30px; }
    .brand { font-size: 24px; font-weight: 900; color: #0a4d29; }
    .tagline { font-size: 11px; font-weight: 700; color: #ff7a00; text-transform: uppercase; letter-spacing: 1px; }
    .invoice-title { text-align: right; }
    .invoice-title h1 { margin: 0; font-size: 20px; color: #111827; font-weight: 800; text-transform: uppercase; }
    .invoice-title p { margin: 4px 0 0; font-size: 12px; color: #6b7280; font-family: monospace; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
    .card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; }
    .card h3 { margin: 0 0 8px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; font-weight: 700; }
    .card p { margin: 2px 0; font-size: 13px; font-weight: 600; }
    .table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    .table th { background: #0a4d29; color: #fff; text-align: left; padding: 12px; font-size: 12px; text-transform: uppercase; }
    .table td { padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
    .totals { width: 320px; margin-left: auto; margin-bottom: 40px; }
    .totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; color: #4b5563; }
    .totals-row.grand-total { border-top: 2px solid #111827; padding-top: 10px; margin-top: 6px; font-size: 16px; font-weight: 800; color: #0a4d29; }
    .footer { text-align: center; border-top: 1px solid #e5e7eb; padding-top: 20px; font-size: 11px; color: #9ca3af; line-height: 1.5; }
    @media print {
      body { padding: 0; }
      @page { margin: 15mm; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">Hourly Tourism</div>
      <div class="tagline">Discover More. One Hour at a Time.</div>
      <p style="font-size: 11px; color: #6b7280; margin: 4px 0 0;">Hourly Marketplace Mobility & Guided Tours Pvt Ltd<br>SAC: 996412 / GSTIN: 33AAACH1234F1Z5</p>
    </div>
    <div class="invoice-title">
      <h1>Tax Invoice / Receipt</h1>
      <p>Invoice #: ${details.invoiceNumber || `INV-${details.bookingNumber}`}</p>
      <p>Booking #: ${details.bookingNumber}</p>
      <p>Date: ${formatDate(details.bookingDate)}</p>
    </div>
  </div>

  <div class="grid">
    <div class="card">
      <h3>Billed To (Customer)</h3>
      <p>${details.customerName}</p>
      <p style="color: #6b7280; font-weight: normal;">${details.customerEmail}</p>
      ${details.customerPhone ? `<p style="color: #6b7280; font-weight: normal;">${details.customerPhone}</p>` : ''}
    </div>
    <div class="card">
      <h3>Fulfillment Host (Provider)</h3>
      <p>${details.providerName}</p>
      <p style="color: #6b7280; font-weight: normal;">Category: ${details.serviceCategory.toUpperCase()}</p>
      ${details.pickupLocation ? `<p style="color: #6b7280; font-weight: normal;">Pickup: ${details.pickupLocation}</p>` : ''}
    </div>
  </div>

  <table class="table">
    <thead>
      <tr>
        <th>Service Description</th>
        <th style="text-align: center;">Duration</th>
        <th style="text-align: right;">Hourly Rate</th>
        <th style="text-align: right;">Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          <strong>${details.serviceTitle}</strong><br>
          <span style="font-size: 11px; color: #6b7280;">Time: ${details.startTime} - ${details.endTime} on ${formatDate(details.bookingDate)}</span>
        </td>
        <td style="text-align: center;">${details.durationHours} Hour(s)</td>
        <td style="text-align: right;">${formatCurrency(details.hourlyRate)}/hr</td>
        <td style="text-align: right; font-weight: 700;">${formatCurrency(details.basePrice)}</td>
      </tr>
    </tbody>
  </table>

  <div class="totals">
    <div class="totals-row">
      <span>Base Service Subtotal:</span>
      <span>${formatCurrency(details.basePrice)}</span>
    </div>
    ${details.extraCharges ? `
    <div class="totals-row">
      <span>Add-ons / Fuel / Extras:</span>
      <span>${formatCurrency(details.extraCharges)}</span>
    </div>` : ''}
    <div class="totals-row">
      <span>Platform Access Fee:</span>
      <span>${formatCurrency(details.platformFee)}</span>
    </div>
    <div class="totals-row">
      <span>GST / Taxes (18% SAC 9964):</span>
      <span>${formatCurrency(details.taxes)}</span>
    </div>
    ${details.discount ? `
    <div class="totals-row" style="color: #059669;">
      <span>Promotional Discount:</span>
      <span>-${formatCurrency(details.discount)}</span>
    </div>` : ''}
    <div class="totals-row grand-total">
      <span>Total Paid:</span>
      <span>${formatCurrency(details.totalAmount)}</span>
    </div>
    <div style="font-size: 11px; color: #059669; text-align: right; margin-top: 6px; font-weight: 700;">
      Payment Method: ${details.paymentMethod || 'Online (Razorpay / UPI / Card)'} [${details.paymentStatus || 'PAID'}]
    </div>
  </div>

  <div class="footer">
    <p>This is an electronically generated valid tax invoice issued by Hourly Tourism under Section 31 of the CGST Act, 2017.<br>
    For support, disputes, or inquiries, please visit your account dashboard or write to support@hourlytourism.com.</p>
  </div>
</body>
</html>`

  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(invoiceHtml)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
    }, 500)
  }
}

