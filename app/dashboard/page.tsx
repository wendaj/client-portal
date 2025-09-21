'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// ---------- Types (lightweight, to avoid TS errors) ----------
type ClientRow = {
  client_id: string;
  user_id: string;
  name: string;
  company_name: string | null;
  email: string;
};

type PlanRow = {
  plan_id: string;
  name: string;
  price_idr: number;
  price_eur: number | null;
  billing_cycle: 'monthly' | 'yearly';
};

type SubscriptionRow = {
  subscription_id: string;
  client_id: string;
  plan_id: string | null;
  start_date: string; // date
  renew_date: string; // date
  status: 'active' | 'past_due' | 'canceled' | 'on_hold';
  plans?: PlanRow | null; // included via join
};

type InvoiceRow = {
  invoice_id: string;
  client_id: string;
  subscription_id: string | null;
  number: string;
  period_start: string; // date
  period_end: string; // date
  amount_idr: number;
  status: 'open' | 'paid' | 'void' | 'uncollectible';
  payment_due_date: string; // date
  pdf_url: string | null;
};

// ---------- Helpers ----------
const fmtIDR = (n: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(n);

const withinLastDays = (isoDate: string, days: number) => {
  const d = new Date(isoDate);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return d >= cutoff;
};

// ---------- Page ----------
export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState<ClientRow | null>(null);
  const [sub, setSub] = useState<SubscriptionRow | null>(null);
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [authChecked, setAuthChecked] = useState(false);

  // Auth guard
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        window.location.href = '/';
        return;
      }
      setAuthChecked(true);

      // 1) load client by user_id
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) return;

      const { data: clientRows, error: clientErr } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', userId)
        .limit(1);

      if (clientErr) {
        console.error(clientErr);
        setLoading(false);
        return;
      }
      const c = clientRows?.[0] as ClientRow | undefined;
      if (!c) {
        setLoading(false);
        return;
      }
      setClient(c);

      // 2) active subscription (include plan)
      const { data: subRows, error: subErr } = await supabase
        .from('subscriptions')
        .select('*, plans(*)')
        .eq('client_id', c.client_id)
        .in('status', ['active', 'on_hold', 'past_due'])
        .order('renew_date', { ascending: true })
        .limit(1);

      if (subErr) console.error(subErr);
      setSub((subRows?.[0] as SubscriptionRow) || null);

      // 3) recent invoices
      const { data: invRows, error: invErr } = await supabase
        .from('invoices')
        .select('*')
        .eq('client_id', c.client_id)
        .order('period_end', { ascending: false })
        .limit(10);

      if (invErr) console.error(invErr);
      setInvoices((invRows as InvoiceRow[]) || []);

      setLoading(false);
    })();
  }, []);

  const stats = useMemo(() => {
    const openCount = invoices.filter((i) => i.status === 'open').length;
    const paidLast30 = invoices.filter(
      (i) => i.status === 'paid' && withinLastDays(i.period_end, 30)
    ).length;
    const nextRenewal = sub?.renew_date
      ? new Date(sub.renew_date).toLocaleDateString(undefined, { dateStyle: 'medium' })
      : '—';
    const totalInvoices = invoices.length;

    return [
      { label: 'Open Invoices', value: openCount, hint: 'Need your action' },
      { label: 'Paid (30 days)', value: paidLast30, hint: 'Recent payments' },
      { label: 'Total Invoices', value: totalInvoices, hint: 'All time' },
      { label: 'Next Renewal', value: nextRenewal, hint: sub?.status ?? '—' },
    ];
  }, [invoices, sub?.renew_date, sub?.status]);

  if (!authChecked) return null;
  if (loading)
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Loading…</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Header welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">
            Welcome back{client?.name ? `, ${client.name}` : ''}
          </h2>
          <p className="text-sm text-gray-500">SLA: 24–48h turnaround on all requests.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <a href="mailto:support@yourdomain.com">Contact Support</a>
          </Button>
          <Button asChild>
            <a href="/tasks">New Task Request</a>
          </Button>
          <Avatar>
            <AvatarImage
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                client?.name ?? 'Client'
              )}`}
            />
            <AvatarFallback>CL</AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-500">{s.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{s.value}</div>
              <div className="text-xs text-gray-400">{s.hint}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Subscription Panel */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <div className="text-sm text-gray-500">Plan</div>
            <div className="text-base font-medium">
              {sub?.plans?.name ?? '—'}{' '}
              <span className="text-gray-400">({sub?.plans?.billing_cycle ?? '—'})</span>
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Status</div>
            <div className="mt-1">
              {sub ? (
                <Badge
                  className={
                    sub.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : sub.status === 'past_due'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-700'
                  }
                >
                  {sub.status}
                </Badge>
              ) : (
                <span className="text-gray-400">—</span>
              )}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Next Billing</div>
            <div className="text-base font-medium">
              {sub?.renew_date
                ? new Date(sub.renew_date).toLocaleDateString(undefined, { dateStyle: 'medium' })
                : '—'}
            </div>
          </div>
          <div className="flex items-end gap-2">
            <Button asChild>
              <a href="mailto:billing@yourdomain.com?subject=Manage%20Plan">Manage Plan</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="mailto:billing@yourdomain.com?subject=Pause%2FHold%20Request">Pause/Hold</a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Invoices */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Period</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv.invoice_id}>
                  <TableCell className="font-medium">{inv.number}</TableCell>
                  <TableCell>
                    {new Date(inv.period_start).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                    {' – '}
                    {new Date(inv.period_end).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </TableCell>
                  <TableCell className="text-right">{fmtIDR(inv.amount_idr)}</TableCell>
                  <TableCell>
                    {inv.status === 'paid' && (
                      <Badge className="bg-green-100 text-green-700">Paid</Badge>
                    )}
                    {inv.status === 'open' && (
                      <Badge className="bg-yellow-100 text-yellow-800">Open</Badge>
                    )}
                    {inv.status === 'void' && (
                      <Badge className="bg-gray-200 text-gray-700">Void</Badge>
                    )}
                    {inv.status === 'uncollectible' && (
                      <Badge className="bg-red-100 text-red-700">Uncollectible</Badge>
                    )}
                  </TableCell>
                  <TableCell className="space-x-3">
                    {inv.pdf_url && (
                      <a
                        className="text-blue-600 hover:underline"
                        href={inv.pdf_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        PDF
                      </a>
                    )}
                    {inv.status === 'open' && (
                      <a
                        className="text-blue-600 hover:underline"
                        href={`mailto:billing@yourdomain.com?subject=Payment%20for%20${encodeURIComponent(
                          inv.number
                        )}`}
                      >
                        Pay
                      </a>
                    )}
                  </TableCell>
                </TableRow>
              ))}

              {invoices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500">
                    No invoices yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
