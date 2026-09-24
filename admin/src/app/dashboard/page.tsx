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
      value: stats.totalProducts,
      icon: Package,
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingCart,
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
    },
    {
      title: "Total Revenue",
      value: `₹${stats.totalRevenue.toFixed(2)}`,
      icon: IndianRupee,
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <Icon className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
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
