"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IOrder } from "@/models/Order";

interface OrderDetailProps {
  order: IOrder;
}

export default function OrderDetail({ order }: OrderDetailProps) {
  const router = useRouter();
  const [orderStatus, setOrderStatus] = useState<string>(order.orderStatus);
  const [paymentStatus, setPaymentStatus] = useState<string>(order.paymentStatus);
  const [updating, setUpdating] = useState(false);

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/orders/${order._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus, paymentStatus }),
      });
      const result = await response.json();
      if (result.success) {
        toast.success("Order updated successfully");
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to update order");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/orders/${order._id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        toast.success("Order deleted");
        router.push("/dashboard/orders");
      }
    } catch {
      toast.error("Failed to delete order");
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Customer Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Name:</strong> {order.name}</p>
            <p><strong>Email:</strong> {order.email}</p>
            <p><strong>Phone:</strong> {order.phone}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delivery Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>{order.address.name}</strong></p>
            <p>{order.address.addressLine1}</p>
            {order.address.addressLine2 && <p>{order.address.addressLine2}</p>}
            <p>
              {order.address.city}, {order.address.state} {order.address.zipCode}
            </p>
            <p>{order.address.country}</p>
            <p><strong>Phone:</strong> {order.address.phone}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2 text-left">Product</th>
                <th className="py-2 text-left">Price</th>
                <th className="py-2 text-left">Qty</th>
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.products.map((item, i) => (
                <tr key={i} className="border-b">
                  <td className="py-2">
                    {item.product && typeof item.product === "object" && "title" in item.product
                      ? (item.product as { title: string }).title
                      : "Product"}
                  </td>
                  <td className="py-2">${item.price.toFixed(2)}</td>
                  <td className="py-2">{item.quantity}</td>
                  <td className="py-2 text-right">
                    ${(item.price * item.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="py-2 font-medium">
                  Subtotal
                </td>
                <td className="py-2 text-right">
                  ${order.subtotal?.toFixed(2)}
                </td>
              </tr>
              <tr>
                <td colSpan={3} className="py-2 font-medium">
                  Delivery
                </td>
                <td className="py-2 text-right">
                  ${order.deliveryCharge?.toFixed(2)}
                </td>
              </tr>
              <tr>
                <td colSpan={3} className="py-2 text-lg font-bold">
                  Total
                </td>
                <td className="py-2 text-lg font-bold text-right">
                  ${order.totalAmount?.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Update Order Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Order Status</label>
              <Select value={orderStatus} onValueChange={setOrderStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Status</label>
              <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleUpdate} disabled={updating}>
              {updating ? "Updating..." : "Update"}
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Order
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
