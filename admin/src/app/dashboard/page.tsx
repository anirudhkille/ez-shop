import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, Users, DollarSign } from "lucide-react";

export const metadata = {
  title: "Dashboard | EZ Shop Admin",
};

async function getStats() {
  try {
    const [productsRes, ordersRes, usersRes] = await Promise.all([
      fetch(`${process.env.NEXT_DOMAIN_NAME}/api/products`, { cache: "no-store" }),
      fetch(`${process.env.NEXT_DOMAIN_NAME}/api/orders`, { cache: "no-store" }),
      fetch(`${process.env.NEXT_DOMAIN_NAME}/api/users`, { cache: "no-store" }),
    ]);

    const products = await productsRes.json();
    const orders = await ordersRes.json();
    const users = await usersRes.json();

    const totalRevenue = (orders.data || []).reduce(
      (sum: number, order: { totalAmount: number }) => sum + (order.totalAmount || 0),
      0
    );

    return {
      totalProducts: (products.data || []).length,
      totalOrders: (orders.data || []).length,
      totalUsers: (users.data || []).length,
      totalRevenue,
    };
  } catch {
    return { totalProducts: 0, totalOrders: 0, totalUsers: 0, totalRevenue: 0 };
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
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
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
    </div>
  );
}
