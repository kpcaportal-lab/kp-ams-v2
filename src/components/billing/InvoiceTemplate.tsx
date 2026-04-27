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
        className="p-16 bg-white text-slate-900 w-[794px] min-h-[1123px] mx-auto font-sans shadow-none border-t-[12px] border-t-brand-navy border-x border-b border-slate-100 relative overflow-hidden"
        style={{ color: '#1e3a5f' }}
      >
        {/* Decorative corner element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 rounded-bl-[5rem] -mr-16 -mt-16" />

        {/* Header Section */}
        <div className="flex justify-between items-start border-b border-slate-100 pb-12 mb-12">
          <div>
            <div className="text-4xl font-black tracking-tightest text-brand-navy mb-2 font-accent uppercase">K&P AMS</div>
            <div className="text-[11px] font-black text-brand-gold uppercase tracking-[0.3em]">Chartered Accountants & Consultants</div>
          </div>
          <div className="text-right text-slate-400 text-[11px] font-bold uppercase tracking-widest leading-relaxed max-w-[220px]">
            Kirtane & Pandit LLP<br />
            5th Floor, Pride Silicon Plaza,<br />
            Senapati Bapat Road, Pune 411016<br />
            <span className="text-brand-navy mt-1 inline-block">GSTIN: 27AABCK1234F1Z1</span>
          </div>
        </div>

        {/* Invoice Title & Date */}
        <div className="flex justify-between items-end mb-16">
          <div>
            <h1 className="text-5xl font-black tracking-tighter text-slate-900 mb-4 uppercase">TAX INVOICE</h1>
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Document Reference</span>
                <span className="text-sm font-black text-white bg-brand-navy px-4 py-1.5 rounded-lg uppercase tracking-wider shadow-lg shadow-brand-navy/10">
                  #{invoice.id.slice(0, 12).toUpperCase()}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Generated At</span>
                <span className="text-sm font-bold text-slate-900">
                  {formatDate(invoice.created_at)}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-black text-brand-gold uppercase tracking-[0.2em] mb-2">Invoice Date</div>
            <div className="text-2xl font-black text-slate-900 tabular-nums">{formatDate(invoice.invoice_date)}</div>
          </div>
        </div>

        {/* Bill To Section */}
        <div className="grid grid-cols-2 gap-16 mb-16 px-2">
          <div>
            <div className="text-[11px] font-black text-brand-navy uppercase tracking-[0.3em] mb-4 border-l-4 border-brand-gold pl-3">Client Information</div>
            <div className="text-2xl font-black text-slate-900 mb-2 font-accent">{invoice.client_name}</div>
            <div className="text-xs font-medium text-slate-500 mb-4 leading-relaxed italic">
              {invoice.address || 'Address information not registered in system'}
            </div>
            {invoice.gst_no && (
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Client GSTIN</span>
                <span className="text-sm font-mono font-bold text-brand-navy bg-slate-50 px-3 py-1 rounded-lg border border-slate-100 inline-block w-fit">
                  {invoice.gst_no}
                </span>
              </div>
            )}
          </div>
          <div className="space-y-6 pt-2">
            {invoice.kind_attention && (
              <div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Attn:</div>
                <div className="text-sm font-black text-slate-800 uppercase tracking-wide">{invoice.kind_attention}</div>
              </div>
            )}
            {invoice.reference && (
              <div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Reference Code</div>
                <div className="text-xs font-mono font-bold bg-slate-50 p-1.5 rounded border border-slate-100 text-slate-600">{invoice.reference}</div>
              </div>
            )}
            {invoice.udin && (
              <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 shadow-sm">
                <div className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-1.5">Verification ID (UDIN)</div>
                <div className="text-sm font-mono font-black text-emerald-700 tracking-wider">
                  {invoice.udin}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Description Table */}
        <div className="mb-16 rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-brand-navy text-white">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Professional Service Description</th>
                <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em]">Amount (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="px-8 py-10">
                  <div className="text-lg font-black text-slate-900 mb-2 uppercase tracking-tight">{invoice.new_sales_ledger || 'Professional Consultation Fees'}</div>
                  <div className="text-sm text-slate-500 leading-relaxed max-w-[450px] font-medium italic">
                    {invoice.narration}
                  </div>
                </td>
                <td className="px-8 py-10 text-right font-black text-slate-900 align-top text-lg tabular-nums">
                  {formatIndianCurrency(invoice.professional_fees)}
                </td>
              </tr>
              {invoice.out_of_pocket > 0 && (
                <tr className="bg-slate-50/50">
                  <td className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest">
                    Incidental & Out of Pocket Expenses
                  </td>
                  <td className="px-8 py-5 text-right text-sm font-bold text-slate-700 tabular-nums">
                    {formatIndianCurrency(invoice.out_of_pocket)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Summary Footer */}
        <div className="flex justify-end mb-24 px-4">
          <div className="w-80 space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Taxable Value</span>
              <span className="font-black text-slate-900 tabular-nums">{formatIndianCurrency(invoice.professional_fees + invoice.out_of_pocket)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="font-black text-slate-400 uppercase tracking-widest text-[10px]">GST Aggregate (18%)</span>
              <span className="font-black text-slate-900 tabular-nums">{formatIndianCurrency((invoice.professional_fees + invoice.out_of_pocket) * 0.18)}</span>
            </div>
            <div className="pt-6 border-t-4 border-brand-gold flex justify-between items-center">
              <span className="text-xl font-black tracking-tightest text-brand-navy uppercase">Total Net</span>
              <span className="text-3xl font-black text-brand-gold tabular-nums drop-shadow-sm">
                {formatIndianCurrency(invoice.net_amount || (invoice.professional_fees + invoice.out_of_pocket) * 1.18)}
              </span>
            </div>
            <div className="pt-2 text-[10px] text-slate-400 text-right font-bold italic uppercase tracking-widest">
              (Inclusive of all statutory taxes)
            </div>
          </div>
        </div>

        {/* Notes & Signature */}
        <div className="grid grid-cols-2 gap-16 mt-auto pt-16 border-t border-slate-100 border-dashed">
          <div>
            <div className="text-[10px] font-black text-brand-gold uppercase tracking-[0.3em] mb-4">Terms of Service</div>
            <ul className="text-[10px] text-slate-400 space-y-2 font-bold uppercase tracking-widest leading-loose list-none">
              <li className="flex gap-2"><span>•</span> Please quote Invoice reference in all electronic transfers.</li>
              <li className="flex gap-2"><span>•</span> Payment is due within 15 days of invoice issuance.</li>
              <li className="flex gap-2"><span>•</span> All statutory compliances have been duly considered.</li>
            </ul>
          </div>
          <div className="text-center pt-8">
            <div className="w-56 h-[2px] bg-brand-navy mx-auto mb-4 opacity-20" />
            <div className="text-sm font-black text-brand-navy uppercase tracking-[0.2em] mb-1 font-accent">Authorized Signatory</div>
            <div className="text-[10px] text-brand-gold font-black uppercase tracking-[0.3em]">For Kirtane & Pandit LLP</div>
          </div>
        </div>
      </div>
    );
  }
);

InvoiceTemplate.displayName = 'InvoiceTemplate';
