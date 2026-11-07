// ============================================================================
// Hourly Tourism - Tax Invoice & Official PDF Receipt Generator
// ============================================================================

import { formatCurrency, formatDate } from './utils'

export interface InvoiceDetails {
  bookingNumber: string
  invoiceNumber?: string
  bookingDate: string
  startTime: string
  endTime: string
  durationHours: number
  serviceTitle: string
  serviceCategory?: string
  customerName: string
  customerEmail?: string
  customerPhone?: string
  providerName?: string
  providerGst?: string
  pickupLocation?: string
  hourlyRate?: number
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
  if (typeof window === 'undefined') return

  const origin = window.location.origin
  const logoUrl = `${origin}/images/logo.png`
  const invoiceNum = details.invoiceNumber || `HT-INV-${details.bookingNumber.replace(/[^a-zA-Z0-9]/g, '')}`
  const formattedDate = details.bookingDate ? formatDate(details.bookingDate) : new Date().toLocaleDateString('en-IN')

  const invoiceHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hourly Tourism Tax Invoice - ${details.bookingNumber}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 30px;
      color: #111827;
      background: #f8fafc;
      -webkit-font-smoothing: antialiased;
    }
    .invoice-container {
      max-width: 820px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 20px;
      padding: 40px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
    }
    .action-bar {
      max-width: 820px;
      margin: 0 auto 20px auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #0a4d29;
      color: #fff;
      padding: 12px 24px;
      border-radius: 14px;
    }
    .btn {
      background: #ff7a00;
      color: #ffffff;
      border: none;
      padding: 8px 20px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: background 0.15s ease;
    }
    .btn:hover { background: #e06c00; }
    .btn-secondary {
      background: rgba(255, 255, 255, 0.15);
      color: #ffffff;
    }
    .btn-secondary:hover { background: rgba(255, 255, 255, 0.25); }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0a4d29;
      padding-bottom: 24px;
      margin-bottom: 30px;
    }
    .logo-img {
      height: 52px;
      width: auto;
      object-fit: contain;
      margin-bottom: 6px;
      display: block;
    }
    .brand {
      font-size: 24px;
      font-weight: 900;
      color: #0a4d29;
      letter-spacing: -0.5px;
    }
    .tagline {
      font-size: 11px;
      font-weight: 800;
      color: #ff7a00;
      text-transform: uppercase;
      letter-spacing: 1.2px;
    }
    .invoice-title { text-align: right; }
    .invoice-title h1 {
      margin: 0;
      font-size: 22px;
      color: #0a4d29;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .invoice-title p {
      margin: 4px 0 0;
      font-size: 12px;
      color: #475569;
      font-weight: 600;
    }
    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 6px;
    }
    .badge-paid { background: #dcfce7; color: #15803d; }
    .badge-pending { background: #fef3c7; color: #b45309; }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 30px;
    }
    .card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 18px;
    }
    .card h3 {
      margin: 0 0 10px;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #0a4d29;
      font-weight: 800;
    }
    .card p {
      margin: 3px 0;
      font-size: 13px;
      font-weight: 600;
      color: #1e293b;
    }
    .card span.muted {
      color: #64748b;
      font-weight: normal;
    }
    .table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
      border-radius: 12px;
      overflow: hidden;
    }
    .table th {
      background: #0a4d29;
      color: #ffffff;
      text-align: left;
      padding: 12px 16px;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.6px;
    }
    .table td {
      padding: 14px 16px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 13px;
      background: #ffffff;
    }
    .totals {
      width: 360px;
      margin-left: auto;
      margin-bottom: 35px;
      background: #f8fafc;
      padding: 20px;
      border-radius: 14px;
      border: 1px solid #e2e8f0;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      font-size: 13px;
      color: #475569;
    }
    .totals-row.grand-total {
      border-top: 2px solid #0a4d29;
      padding-top: 12px;
      margin-top: 8px;
      font-size: 17px;
      font-weight: 900;
      color: #0a4d29;
    }
    .footer {
      text-align: center;
      border-top: 1px solid #e2e8f0;
      padding-top: 24px;
      font-size: 11px;
      color: #64748b;
      line-height: 1.6;
    }
    @media print {
      body { background: #ffffff; padding: 0; }
      .invoice-container { border: none; box-shadow: none; padding: 0; max-width: 100%; }
      .no-print { display: none !important; }
      @page { margin: 15mm; size: A4 portrait; }
    }
  </style>
</head>
<body>
  <div class="no-print action-bar">
    <div style="font-weight: 700; font-size: 14px; display: flex; align-items: center; gap: 8px;">
      <span>Hourly Tourism Tax Invoice Voucher</span>
    </div>
    <div style="display: flex; gap: 10px;">
      <button class="btn" onclick="window.print()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
        Print / Save as PDF
      </button>
      <button class="btn btn-secondary" onclick="window.close()">✕ Close</button>
    </div>
  </div>

  <div class="invoice-container">
    <div class="header">
      <div>
        <img src="${logoUrl}" alt="Hourly Tourism Logo" class="logo-img" onerror="this.style.display='none'" />
        <div class="brand">Hourly Tourism</div>
        <div class="tagline">Discover More. One Hour at a Time.</div>
        <p style="font-size: 11px; color: #64748b; margin: 6px 0 0; line-height: 1.4;">
          Hourly Marketplace Mobility & Guided Tours Pvt Ltd<br>
          SAC Code: 996412 (Passenger Transportation & Guided Tours)<br>
          GSTIN: 33AAACH1234F1Z5 • support@hourlytourism.com
        </p>
      </div>
      <div class="invoice-title">
        <h1>Tax Invoice</h1>
        <p><strong>Invoice #:</strong> ${invoiceNum}</p>
        <p><strong>Booking #:</strong> ${details.bookingNumber}</p>
        <p><strong>Date Issued:</strong> ${formattedDate}</p>
        <div>
          <span class="badge ${details.paymentStatus?.toLowerCase() === 'completed' || details.paymentStatus?.toLowerCase() === 'paid' ? 'badge-paid' : 'badge-pending'}">
            Payment: ${(details.paymentStatus || 'PENDING').toUpperCase()}
          </span>
        </div>
      </div>
    </div>

    <div class="grid">
      <div class="card">
        <h3>Billed To (Tourist / Customer)</h3>
        <p>${details.customerName}</p>
        ${details.customerEmail ? `<p><span class="muted">Email:</span> ${details.customerEmail}</p>` : ''}
        ${details.customerPhone ? `<p><span class="muted">Phone:</span> ${details.customerPhone}</p>` : ''}
        ${details.pickupLocation ? `<p><span class="muted">Pickup Spot:</span> ${details.pickupLocation}</p>` : ''}
      </div>
      <div class="card">
        <h3>Fulfillment Host & Service</h3>
        <p>${details.providerName || 'Hourly Verified Partner Host'}</p>
        <p><span class="muted">Experience:</span> ${details.serviceTitle}</p>
        <p><span class="muted">Category:</span> ${(details.serviceCategory || 'Mobility & Tour').toUpperCase()}</p>
        <p><span class="muted">Trip Schedule:</span> ${details.startTime} to ${details.endTime} (${details.durationHours} hrs)</p>
      </div>
    </div>

    <table class="table">
      <thead>
        <tr>
          <th>Service Description & Schedule</th>
          <th style="text-align: center;">Hours</th>
          <th style="text-align: right;">Rate / Hr</th>
          <th style="text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>${details.serviceTitle}</strong><br>
            <span style="font-size: 11px; color: #64748b;">
              Scheduled for ${formattedDate} (${details.startTime} - ${details.endTime})
            </span>
          </td>
          <td style="text-align: center; font-weight: 700;">${details.durationHours} hr(s)</td>
          <td style="text-align: right;">${details.hourlyRate ? formatCurrency(details.hourlyRate) : '-'}</td>
          <td style="text-align: right; font-weight: 700;">${formatCurrency(details.basePrice)}</td>
        </tr>
      </tbody>
    </table>

    <div class="totals">
      <div class="totals-row">
        <span>Base Service Subtotal:</span>
        <span style="font-weight: 600;">${formatCurrency(details.basePrice)}</span>
      </div>
      ${details.extraCharges ? `
      <div class="totals-row">
        <span>Add-ons / Fuel / Extensions:</span>
        <span style="font-weight: 600;">${formatCurrency(details.extraCharges)}</span>
      </div>` : ''}
      <div class="totals-row">
        <span>Platform Service Fee:</span>
        <span>${formatCurrency(details.platformFee)}</span>
      </div>
      <div class="totals-row">
        <span>GST & Applicable Taxes (18%):</span>
        <span>${formatCurrency(details.taxes)}</span>
      </div>
      ${details.discount ? `
      <div class="totals-row" style="color: #059669; font-weight: 600;">
        <span>Promo Voucher Applied:</span>
        <span>-${formatCurrency(details.discount)}</span>
      </div>` : ''}
      <div class="totals-row grand-total">
        <span>Total Amount:</span>
        <span>${formatCurrency(details.totalAmount)}</span>
      </div>
      <div style="font-size: 11px; color: #0a4d29; text-align: right; margin-top: 8px; font-weight: 700;">
        Settlement: ${details.paymentMethod || 'UPI QR / Online Gateway / On-Site Settlement'}
      </div>
    </div>

    <div class="footer">
      <p>
        This is an electronically generated authentic Tax Invoice issued under Section 31 of the CGST Act, 2017.<br>
        Hourly Tourism ensures passenger protection, verified background-checked hosts, and 24x7 safety assistance.<br>
        Questions regarding your ride? Reach our passenger care team at <strong>support@hourlytourism.com</strong>.
      </p>
    </div>
  </div>
</body>
</html>`

  const printWindow = window.open('', '_blank', 'width=880,height=960')
  if (printWindow) {
    printWindow.document.write(invoiceHtml)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      try {
        printWindow.print()
      } catch (e) {
        console.debug('Print trigger skipped or blocked:', e)
      }
    }, 600)
  }
}

/**
 * Convenience helper to format any booking object into an InvoiceDetails payload
 * and trigger the print/download flow.
 */
export function generateInvoiceForBooking(booking: any, userProfile?: any) {
  if (!booking) return

  const customerName =
    booking.profiles?.full_name ||
    userProfile?.full_name ||
    booking.customer_name ||
    'Valued Customer'
  const customerEmail =
    booking.profiles?.email ||
    userProfile?.email ||
    booking.customer_email ||
    ''
  const customerPhone =
    booking.profiles?.phone ||
    userProfile?.phone ||
    booking.customer_phone ||
    ''

  const providerName =
    booking.provider_profiles?.business_name ||
    booking.service_listings?.provider_profiles?.business_name ||
    'Hourly Verified Partner Host'

  const serviceTitle =
    booking.service_listings?.title ||
    booking.service_title ||
    'Hourly Tourism Experience'

  const serviceCategory =
    booking.service_listings?.category ||
    'tour'

  const details: InvoiceDetails = {
    bookingNumber: booking.booking_number || 'HT-XXXX',
    bookingDate: booking.booking_date,
    startTime: booking.start_time || '09:00',
    endTime: booking.end_time || '10:00',
    durationHours: Number(booking.duration_hours) || 1,
    serviceTitle,
    serviceCategory,
    customerName,
    customerEmail,
    customerPhone,
    providerName,
    pickupLocation: booking.pickup_location || 'Confirmed with host',
    hourlyRate: Number(booking.hourly_rate) || undefined,
    basePrice: Number(booking.base_price) || Number(booking.total_amount) || 0,
    platformFee: Number(booking.platform_fee) || 20,
    taxes: Number(booking.tax_amount) || 0,
    totalAmount: Number(booking.total_amount) || 0,
    paymentMethod: booking.payment_method || (booking.payment_status === 'completed' || booking.payment_status === 'paid' ? 'Paid (Online / Host QR)' : 'On-Site Settlement / Post-Trip'),
    paymentStatus: booking.payment_status === 'completed' || booking.payment_status === 'paid' ? 'COMPLETED' : 'PENDING',
  }

  printBookingInvoice(details)
}
