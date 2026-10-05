"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import {
  Heart,
  IndianRupee,
  MapPin,
  Package,
  ShoppingCart,
  Trash2,
  TrendingUp,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IUserAdminDetail } from "@/types";
import { clientFetch } from "@/lib/client-api";

interface UserDetailProps {
  detail: IUserAdminDetail;
}

const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value ?? 0);

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString("en-IN") : "—";

const effectivePrice = (price: number, discountPrice?: number) =>
  discountPrice ?? price;

export default function UserDetail({ detail }: UserDetailProps) {
  const router = useRouter();
  const { user, stats, orders, wishlist, addresses } = detail;
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Delete ${user.name || user.email}? This cannot be undone.`
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const response = await clientFetch(`/api/user/${user._id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        toast.success("User deleted");
        router.push("/dashboard/users");
      } else {
        toast.error("Failed to delete user");
      }
    } catch {
      toast.error("Failed to delete user");
    } finally {
      setIsDeleting(false);
    }
  };

  const cards = [
    {
      title: "Total Orders",
      value: stats.orderCount,
      icon: ShoppingCart,
    },
    {
      title: "Lifetime Value",
      value: formatPrice(stats.totalSpent),
      icon: IndianRupee,
    },
    {
      title: "Avg. Order",
      value: formatPrice(stats.averageOrderValue),
      icon: TrendingUp,
    },
    {
      title: "Wishlist",
      value: stats.wishlistCount,
      icon: Heart,
    },
    {
      title: "Addresses",
      value: stats.addressCount,
      icon: MapPin,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Last order {formatDate(stats.lastOrderAt)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            {user.avatar ? (
              <Image
                height={80}
                width={80}
                src={user.avatar}
                alt={user.name || "User"}
                className="object-cover w-20 h-20 rounded-full"
              />
            ) : (
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-muted">
                <span className="text-2xl font-medium text-muted-foreground">
                  {(user.name || user.email)?.[0]?.toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <h3 className="text-xl font-semibold">
                {user.name || "Unnamed"}
              </h3>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Phone" value={user.phone} />
            <Field label="Role" value={user.role} capitalize />
            <Field
              label="Email Verified"
              value={user.isEmailVerified ? "Yes" : "No"}
            />
            <Field
              label="Profile Completed"
              value={user.isProfileCompleted ? "Yes" : "No"}
            />
            <Field label="Items Bought" value={String(stats.itemCount)} />
            <Field label="Joined" value={formatDate(user.createdAt)} />
            <Field
              label="Last Updated"
              value={formatDate(user.updatedAt)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Recent Orders
          </CardTitle>
          <CardDescription>
            {stats.orderCount === 0
              ? "This customer has not placed any orders."
              : `Showing the ${orders.length} most recent of ${stats.orderCount}.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell className="font-mono text-xs">
                        {order._id.slice(-8)}
                      </TableCell>
                      <TableCell>{formatDate(order.createdAt)}</TableCell>
                      <TableCell>
                        {order.products?.reduce(
                          (sum, item) => sum + (item.quantity ?? 0),
                          0
                        ) ?? 0}
                      </TableCell>
                      <TableCell className="capitalize">
                        {order.paymentType}
                      </TableCell>
                      <TableCell className="capitalize">
                        {order.orderStatus}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatPrice(order.totalAmount)}
                        {order.discount ? (
                          <span className="block text-xs font-normal text-green-600">
                            saved {formatPrice(order.discount)}
                          </span>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Wishlist
            </CardTitle>
            <CardDescription>
              {wishlist.length === 0
                ? "Nothing saved yet."
                : `${wishlist.length} saved item${wishlist.length === 1 ? "" : "s"}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {wishlist.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                This customer&apos;s wishlist is empty.
              </p>
            ) : (
              <ul className="space-y-3">
                {wishlist.map((item) => (
                  <li
                    key={item._id}
                    className="flex items-center gap-3 rounded-md border p-2"
                  >
                    {item.image ? (
                      <Image
                        height={48}
                        width={48}
                        src={item.image}
                        alt={item.name}
                        className="h-12 w-12 rounded-md object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-md bg-muted" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatPrice(
                          effectivePrice(item.price, item.discountPrice)
                        )}
                      </p>
                    </div>
                    {item.publish === false ? (
                      <span className="text-xs text-muted-foreground">
                        Unpublished
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Addresses
            </CardTitle>
            <CardDescription>
              {addresses.length === 0
                ? "No saved addresses."
                : `${addresses.length} saved`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {addresses.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                This customer has no saved addresses.
              </p>
            ) : (
              <ul className="space-y-3">
                {addresses.map((address) => (
                  <li key={address._id} className="rounded-md border p-3">
                    <p className="font-medium">{address.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {address.addressLine1}
                      {address.addressLine2 ? `, ${address.addressLine2}` : ""}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {address.city}, {address.state} {address.zipCode}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {address.country} · {address.phone}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator />

      <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
        <Trash2 className="mr-2 h-4 w-4" />
        {isDeleting ? "Deleting…" : "Delete User"}
      </Button>
    </div>
  );
}

function Field({
  label,
  value,
  capitalize,
}: {
  label: string;
  value?: string;
  capitalize?: boolean;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-muted-foreground">
        {label}
      </label>
      <p className={capitalize ? "capitalize" : undefined}>
        {value || "—"}
      </p>
    </div>
  );
}
