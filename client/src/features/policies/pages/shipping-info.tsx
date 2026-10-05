import { PolicyPage, PolicySection } from "@/shared/components/policy-page";

export default function ShippingInfoPage() {
  return (
    <PolicyPage
      title="Shipping Information"
      subtitle="Everything you need to know about our shipping policies."
    >
      <PolicySection title="Delivery Times">
        <p className="mb-4">
          We strive to process and ship your orders as swiftly as possible.
          Typical delivery times are:
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong className="text-foreground">Standard Delivery:</strong> 3-5
            business days. Free on orders above ₹1,500.
          </li>
          <li>
            <strong className="text-foreground">Express Delivery:</strong> 1-2
            business days. Available for selected locations at an additional
            cost.
          </li>
        </ul>
      </PolicySection>

      <PolicySection title="Order Processing">
        <p>
          Orders placed before 2:00 PM will be processed the same day. Orders
          placed after 2:00 PM or on weekends/holidays will be processed the
          following business day. Once your order has been dispatched, you will
          receive an email with your tracking number.
        </p>
      </PolicySection>

      <PolicySection title="International Shipping">
        <p>
          Currently, we only ship within designated domestic zones. We are
          working actively to expand our shipping networks globally. Stay tuned!
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
