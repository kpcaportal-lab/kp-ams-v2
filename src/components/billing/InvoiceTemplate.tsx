'use client';

import React from 'react';
import { formatIndianCurrency } from '@/lib/utils';
import { formatDate, type Invoice } from '@/types';

interface InvoiceTemplateProps {
  invoice: Invoice;
}

export const InvoiceTemplate = React.forwardRef<HTMLDivElement, InvoiceTemplateProps>(
  ({ invoice }, ref) => {
    return (
      <div
        ref={ref}
        className="p-12 bg-white text-slate-900 w-[794px] min-h-[1123px] mx-auto font-sans shadow-none border border-slate-100"
        style={{ color: '#0f172a' }}
      >
        {/* Header Section */}
        <div className="flex justify-between items-start border-b border-slate-200 pb-8 mb-8">
          <div>
            <div className="text-3xl font-black tracking-tight text-blue-600 mb-2">KP AMS</div>
            <div className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Tax & Audit Consultants</div>
          </div>
          <div className="text-right text-slate-500 text-xs leading-relaxed max-w-[200px]">
            123 Business Tower, Tech Park,<br />
            Bengaluru, Karnataka 560001<br />
            GSTIN: 29ABCDE1234F1Z5
          </div>
        </div>

        {/* Invoice Title & Date */}
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">TAX INVOICE</h1>
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-white bg-blue-600 px-2.5 py-1 rounded-full uppercase tracking-wider">
                #{invoice.id.toUpperCase()}
              </span>
              <span className="text-sm font-medium text-slate-400">
                Generated: {formatDate(invoice.created_at)}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Invoice Date</div>
            <div className="text-lg font-bold">{formatDate(invoice.invoice_date)}</div>
          </div>
        </div>

        {/* Bill To Section */}
        <div className="grid grid-cols-2 gap-12 mb-12">
          <div>
            <div className="text-[11px] font-bold text-blue-600 uppercase tracking-widest mb-3">Bill To</div>
            <div className="text-xl font-bold mb-1">{invoice.client_name}</div>
            <div className="text-sm text-slate-500 mb-2 leading-relaxed">
              {invoice.address || 'Address information not provided'}
            </div>
            {invoice.gst_no && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">GSTIN</span>
                <span className="text-sm font-mono font-semibold bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                  {invoice.gst_no}
                </span>
              </div>
            )}
          </div>
          <div>
            {invoice.kind_attention && (
              <div className="mb-4">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Kind Attention</div>
                <div className="text-sm font-semibold">{invoice.kind_attention}</div>
              </div>
            )}
            {invoice.reference && (
              <div className="mb-4">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Reference No.</div>
                <div className="text-sm font-mono">{invoice.reference}</div>
              </div>
            )}
            {invoice.udin && (
              <div>
                <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest mb-1">UDIN</div>
                <div className="text-sm font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 inline-block">
                  {invoice.udin}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Description Table */}
        <div className="mb-12 border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Description of Services</th>
                <th className="px-6 py-4 text-right text-[11px] font-bold text-slate-400 uppercase tracking-widest">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50">
              <tr>
                <td className="px-6 py-8">
                  <div className="font-bold text-slate-800 mb-1">{invoice.new_sales_ledger || 'Professional Fees'}</div>
                  <div className="text-sm text-slate-500 leading-relaxed max-w-[400px]">
                    {invoice.narration}
                  </div>
                </td>
                <td className="px-6 py-8 text-right font-bold align-top">
                  {formatIndianCurrency(invoice.professional_fees)}
                </td>
              </tr>
              {invoice.out_of_pocket > 0 && (
                <tr>
                  <td className="px-6 py-4 text-slate-600 italic">
                    Out of Pocket Expenses
                  </td>
                  <td className="px-6 py-4 text-right text-slate-600 italic">
                    {formatIndianCurrency(invoice.out_of_pocket)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Summary Footer */}
        <div className="flex justify-end mb-16">
          <div className="w-72 space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="font-semibold text-slate-400">Subtotal</span>
              <span className="font-bold">{formatIndianCurrency(invoice.professional_fees + invoice.out_of_pocket)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="font-semibold text-slate-400 text-xs">GST (18%)</span>
              <span className="font-bold">{formatIndianCurrency((invoice.professional_fees + invoice.out_of_pocket) * 0.18)}</span>
            </div>
            <div className="pt-4 border-t-2 border-slate-100 flex justify-between items-center">
              <span className="text-lg font-black tracking-tight">TOTAL</span>
              <span className="text-2xl font-black text-blue-600">
                {formatIndianCurrency(invoice.net_amount || (invoice.professional_fees + invoice.out_of_pocket) * 1.18)}
              </span>
            </div>
            <div className="pt-2 text-[10px] text-slate-400 text-right italic uppercase tracking-tighter">
              (Inclusive of all taxes)
            </div>
          </div>
        </div>

        {/* Notes & Signature */}
        <div className="grid grid-cols-2 gap-12 mt-auto pt-20">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Notes</div>
            <ul className="text-[11px] text-slate-400 space-y-1.5 leading-relaxed list-disc pl-4">
              <li>Please quote the Invoice number in all communications.</li>
              <li>Payment is due within 15 days from the date of invoice.</li>
              <li>All disputes are subject to local jurisdiction.</li>
            </ul>
          </div>
          <div className="text-center pt-8">
            <div className="w-48 h-[1px] bg-slate-200 mx-auto mb-3" />
            <div className="text-[11px] font-bold text-slate-900 uppercase tracking-widest">Authorized Signatory</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">KP AMS Consulting</div>
          </div>
        </div>
      </div>
    );
  }
);

InvoiceTemplate.displayName = 'InvoiceTemplate';
