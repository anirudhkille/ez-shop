import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, Users, IndianRupee } from "lucide-react";
import { serverFetch } from "@/lib/server-api";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { IPaginatedResponse, IOrder, IProduct } from "@/types";

export const metadata = {
  title: "Dashboard | EZ Shop Admin",
};

async function getStats() {
  try {
    const [productsRes, ordersRes, usersRes] = await Promise.all([
      serverFetch("/api/product?limit=1000", { cache: "no-store" }),
      serverFetch("/api/order?limit=1000", { cache: "no-store" }),
      serverFetch("/api/user?limit=1000", { cache: "no-store" }),
    ]);

    const products: IPaginatedResponse<IProduct> = await productsRes.json();
    const orders: IPaginatedResponse<IOrder> = await ordersRes.json();
    const users: IPaginatedResponse<{ _id: string }> = await usersRes.json();

    const ordersList: IOrder[] = orders.data || [];
    const productsList: IProduct[] = products.data || [];

    const totalRevenue = ordersList.reduce(
      (sum: number, order) => sum + (order.totalAmount || 0),
      0,
    );

    return {
      totalProducts: products.pagination?.total ?? productsList.length,
      totalOrders: orders.pagination?.total ?? ordersList.length,
      totalUsers: users.pagination?.total ?? (users.data || []).length,
      totalRevenue,
      orders: ordersList,
      products: productsList,
    };
  } catch {
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
        <h2 className="font-display text-foreground text-3xl font-bold tracking-tight uppercase">
          Dashboard
        </h2>
        <p className="font-body text-muted-foreground mt-1 text-sm">
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
                <CardTitle className="font-body text-muted-foreground text-xs font-medium tracking-wider uppercase">
                  {card.title}
                </CardTitle>
                <span className="bg-brand-orange/10 text-brand-orange flex size-8 shrink-0 items-center justify-center rounded-lg">
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
