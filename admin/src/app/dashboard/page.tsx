import React from "react";

import { IndianRupee, Package, ShoppingCart, Users } from "lucide-react";

import { serverFetch } from "@/lib/server-api";
import { MAX_PAGE_SIZE } from "@/lib/pagination";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { DashboardCharts } from "@/features/dashboard/dashboard-charts";

import { ApiResponse, IOrder, IPaginatedResponse, IProduct } from "@/types";

export const metadata = {
  title: "Dashboard | EZ Shop Admin",
};

const PAGE_SIZE = MAX_PAGE_SIZE;

type OrderStats = {
  totalOrders: number;
  totalRevenue: number;
  paidOrders: number;
  pendingOrders: number;
  failedOrders: number;
};

async function getStats() {
  try {
    const [productsRes, ordersRes, usersRes, statsRes] = await Promise.all([
      serverFetch(`/api/product?limit=${PAGE_SIZE}`, { cache: "no-store" }),
      serverFetch(`/api/order?limit=${PAGE_SIZE}`, { cache: "no-store" }),
      serverFetch(`/api/user?limit=${PAGE_SIZE}`, { cache: "no-store" }),
      serverFetch("/api/order/stats", { cache: "no-store" }),
    ]);

    const products: IPaginatedResponse<IProduct> = await productsRes.json();
    const orders: IPaginatedResponse<IOrder> = await ordersRes.json();
    const users: IPaginatedResponse<{ _id: string }> = await usersRes.json();
    const stats: ApiResponse<OrderStats> = await statsRes.json();

    const ordersList: IOrder[] = orders.data || [];
    const productsList: IProduct[] = products.data || [];

    // Counts come from the server aggregates — the list endpoints cap `limit`
    // at 100, so summing a client-side page would under-report. Revenue is
    // aggregated over every paid order, not just the current page.
    return {
      totalProducts: products.pagination?.total ?? productsList.length,
      totalOrders: stats.data?.totalOrders ?? orders.pagination?.total ?? 0,
      totalUsers: users.pagination?.total ?? (users.data || []).length,
      totalRevenue: stats.data?.totalRevenue ?? 0,
      orders: ordersList,
      products: productsList,
    };
  } catch (error) {
    console.error("Dashboard stats failed to load", error);

    return {
      totalProducts: 0,
      totalOrders: 0,
      totalUsers: 0,
      totalRevenue: 0,
      orders: [] as IOrder[],
      products: [] as IProduct[],
    };
  }
}

export default async function DashboardPage() {
  const stats = await getStats();

  const cards = [
    {
      title: "Total Products",
      value: stats.totalProducts.toLocaleString("en-IN"),
      icon: Package,
    },
    {
      title: "Total Orders",
      value: stats.totalOrders.toLocaleString("en-IN"),
      icon: ShoppingCart,
    },
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString("en-IN"),
      icon: Users,
    },
    {
      title: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString("en-IN", {
        maximumFractionDigits: 0,
      })}`,
      icon: IndianRupee,
      highlight: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl font-bold tracking-tight text-foreground uppercase">
          Dashboard
        </h2>
        <p className="mt-1 font-body text-sm text-muted-foreground">
          Store performance at a glance.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.title}
              className="card-hover border-brand-border/70"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="font-body text-xs font-medium tracking-wider text-muted-foreground uppercase">
                  {card.title}
                </CardTitle>
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-orange/10 text-brand-orange">
                  <Icon className="size-4" aria-hidden />
                </span>
              </CardHeader>
              <CardContent>
                <div
                  className={`font-display text-2xl font-bold ${
                    card.highlight ? "text-brand-orange" : "text-foreground"
                  }`}
                >
                  {card.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <DashboardCharts
        orders={stats.orders}
        products={stats.products}
        totalProducts={stats.totalProducts}
      />
    </div>
  );
}
