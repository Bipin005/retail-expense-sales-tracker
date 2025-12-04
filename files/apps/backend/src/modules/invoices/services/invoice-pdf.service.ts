import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';

@Injectable()
export class InvoicePdfService {
  async generateInvoicePdf(invoice: any, format: 'A4' | 'THERMAL' = 'A4'): Promise<Buffer> {
    const html = this.generateInvoiceHtml(invoice, format);
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: 'networkidle0' });

    let pdfOptions: any = {
      margin: { top: 10, right: 10, bottom: 10, left: 10 },
    };

    if (format === 'THERMAL') {
      pdfOptions.width = '80mm';
      pdfOptions. height = 'auto';
    } else {
      pdfOptions. format = 'A4';
    }

    const pdf = await page.pdf(pdfOptions);
    await browser.close();

    return pdf;
  }

  private generateInvoiceHtml(invoice: any, format: string): string {
    const itemsHtml = invoice.items
      .map(
        (item: any) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.product.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.qty}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">₹${parseFloat(item.unitPrice).toFixed(2)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">₹${parseFloat(item. discount || 0).toFixed(2)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">₹${parseFloat(item.taxAmount || 0).toFixed(2)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">₹${parseFloat(item. lineTotal).toFixed(2)}</td>
      </tr>
    `,
      )
      .join('');

    return `
      <! DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
          }
          . invoice {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #0f766e;
            padding-bottom: 15px;
          }
          . store-name {
            font-size: 24px;
            font-weight: bold;
            color: #0f766e;
          }
          .invoice-details {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            font-size: 12px;
          }
          . items-table {
            width: 100%;
            margin: 20px 0;
            border-collapse: collapse;
          }
          .items-table th {
            background-color: #0f766e;
            color: white;
            padding: 10px;
            text-align: left;
          }
          . totals {
            text-align: right;
            margin-top: 20px;
          }
          .total-row {
            font-size: 18px;
            font-weight: bold;
            color: #0f766e;
            margin-top: 10px;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 11px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="invoice">
          <div class="header">
            <div class="store-name">${invoice.store.name}</div>
            <div style="color: #666; font-size: 12px;">${invoice.store.address}</div>
            <div style="color: #666; font-size: 12px;">${invoice.store.phone || ''}</div>
          </div>

          <div class="invoice-details">
            <div>
              <strong>Invoice #:</strong> ${invoice.invoiceNo}<br/>
              <strong>Date:</strong> ${new Date(invoice.createdAt). toLocaleDateString()}<br/>
              <strong>Time:</strong> ${new Date(invoice.createdAt).toLocaleTimeString()}
            </div>
            <div>
              ${invoice.customer ?  `<strong>Customer:</strong> ${invoice.customer.name}<br/>` : ''}
              ${invoice.customer?. phone ?  `<strong>Phone:</strong> ${invoice.customer. phone}` : ''}
            </div>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Price</th>
                <th style="text-align: right;">Discount</th>
                <th style="text-align: right;">Tax</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="totals">
            <div>Subtotal: ₹${parseFloat(invoice.subtotal).toFixed(2)}</div>
            <div>Discount: -₹${parseFloat(invoice. discountTotal).toFixed(2)}</div>
            <div>Tax: ₹${parseFloat(invoice.taxTotal).toFixed(2)}</div>
            <div class="total-row">Total: ₹${parseFloat(invoice.total).toFixed(2)}</div>
          </div>

          <div class="footer">
            <p>Thank you for your purchase!</p>
            <p>Return/Refund Policy: Items can be returned within 7 days with original receipt. </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}