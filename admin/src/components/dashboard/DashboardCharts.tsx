"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IOrder, IProduct } from "@/types";

function formatINR(value: number) {
  return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
}

function groupByDate(orders: IOrder[]) {
  const map = new Map<string, { revenue: number; orders: number }>();

  for (const order of orders) {
    const date = new Date(order.createdAt).toISOString().split("T")[0];
    const current = map.get(date) || { revenue: 0, orders: 0 };
    current.revenue += order.totalAmount || 0;
    current.orders += 1;
    map.set(date, current);
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, values]) => ({
      date,
      label: formatDate(date),
      ...values,
    }));
}

function topProducts(orders: IOrder[]) {
  const map = new Map<string, { name: string; revenue: number }>();

  for (const order of orders) {
    for (const item of order.products) {
      const product =
        typeof item.product === "object" && item.product !== null
          ? item.product
          : { name: "Unknown" };
      const name = (product as { name?: string }).name || "Unknown";
      const current = map.get(name) || { name, revenue: 0 };
      current.revenue += (item.price || 0) * (item.quantity || 0);
      map.set(name, current);
    }
  }

  return Array.from(map.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
}

export function DashboardCharts({
  orders,
  products,
}: {
  orders: IOrder[];
  products: IProduct[];
}) {
  const data = React.useMemo(() => groupByDate(orders), [orders]);
  const top = React.useMemo(() => topProducts(orders), [orders]);
  const totalProducts = products.length;

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          No order data available for charts.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data} margin={{ left: 0, right: 16, top: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(value) => `₹${value}`}
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={60}
              />
              <Tooltip
                formatter={(value) => [formatINR(Number(value) || 0), "Revenue"]}
                labelClassName="font-medium"
                contentStyle={{ borderRadius: 8 }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--primary))"
                fillOpacity={1}
                fill="url(#revenueGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Orders Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data} margin={{ left: 0, right: 16, top: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip
                formatter={(value) => [value, "Orders"]}
                contentStyle={{ borderRadius: 8 }}
              />
              <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Top Products</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={top}
              layout="vertical"
              margin={{ left: 24, right: 16, top: 8, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fontSize: 11 }}
                width={100}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value) => [formatINR(Number(value) || 0), "Revenue"]}
                contentStyle={{ borderRadius: 8 }}
              />
              <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Catalog Overview</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col justify-center">
          <div className="text-3xl font-bold">{totalProducts}</div>
          <p className="text-sm text-muted-foreground">Total active products</p>
        </CardContent>
      </Card>
    </div>
  );
}
