'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { Loader2, TrendingUp, CreditCard } from 'lucide-react';
import { formatINR } from '@/lib/utils';
import { 
    BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid
} from 'recharts';

interface ChartDataPoint {
    month: string;
    billed: string | number;
    target: string | number;
    collected?: string | number;
}

interface TableDataRow {
    month_name: string;
    amount_billed: string | number;
    amount_collected: string | number;
}

interface BillingTabProps {
    managerId: string;
    fiscalYear: string;
}

export function BillingTab({ managerId, fiscalYear }: BillingTabProps) {
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [tableData, setTableData] = useState<TableDataRow[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(`/api/managers/${managerId}/billing`, {
                params: { period: fiscalYear }
            });
            setChartData(res.data.chartData);
            setTableData(res.data.tableData);
        } catch (err) {
            console.error('Failed to fetch billing data:', err);
        } finally {
            setLoading(false);
        }
    }, [managerId, fiscalYear]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const formattedChartData = chartData.map(d => ({
        ...d,
        name: monthNames[parseInt(String(d.month)) - 1],
        billed: parseFloat(String(d.billed)),
        collected: parseFloat(String(d.collected))
    }));

const toNumber = (val: string | number | undefined) => parseFloat(String(val ?? 0));

    return (
        <div className="space-y-6">
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 size={32} className="text-[var(--brand-navy)] animate-spin mb-4" />
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em] font-accent">Analyzing Revenue</p>
                </div>
            ) : chartData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <TrendingUp size={32} className="text-slate-300 mb-4" />
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em] font-accent">No billing data available</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Chart Section */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider font-accent">Revenue Trend</h4>
                                <p className="text-xs text-slate-500 font-medium">Monthly Billed vs Collected</p>
                            </div>
                            <div className="p-2 bg-[var(--navy-50)] text-[var(--brand-navy)] rounded-lg">
                                <TrendingUp size={18} />
                            </div>
                        </div>

                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={formattedChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis 
                                        dataKey="name" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} 
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                                        tickFormatter={(val) => `₹${val >= 100000 ? val/100000 + 'L' : val/1000 + 'K'}`}
                                    />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontFamily: 'Public Sans' }}
                                        formatter={(value: number | string) => formatINR(Number(value))}
                                    />
                                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '11px', fontWeight: 700, fontFamily: 'Urbanist' }} />
                                    <Bar dataKey="billed" name="Billed Amount" fill="var(--brand-navy)" radius={[4, 4, 0, 0]} barSize={20} />
                                    <Bar dataKey="collected" name="Collected Amount" fill="var(--color-mid-blue)" radius={[4, 4, 0, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Table Section */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider font-accent">Monthly Breakdown</h4>
                                <p className="text-xs text-slate-500 font-medium">Detailed figures per month</p>
                            </div>
                            <div className="p-2 bg-[var(--navy-50)] text-[var(--brand-navy)] rounded-lg">
                                <CreditCard size={18} />
                            </div>
                        </div>

                        <div className="overflow-hidden">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        <th className="pb-3 text-[10px] font-black text-slate-400 uppercase tracking-wider font-accent">Month</th>
                                        <th className="pb-3 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right font-accent">Billed</th>
                                        <th className="pb-3 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right font-accent">Collected</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {tableData.map((row, idx) => (
                                        <tr key={idx} className="group">
                                            <td className="py-3.5 text-sm font-bold text-slate-700">{row.month_name}</td>
                                            <td className="py-3.5 text-sm font-black text-slate-900 text-right">{formatINR(toNumber(row.amount_billed))}</td>
                                            <td className="py-3.5 text-sm font-bold text-[var(--brand-navy)] text-right">{formatINR(toNumber(row.amount_collected))}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
