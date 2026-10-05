import { PolicyPage, PolicySection } from "@/shared/components/policy-page";

export default function ReturnsPage() {
  return (
    <PolicyPage
      title="Returns & Exchanges"
      subtitle="Hassle-free returns within 30 days of purchase."
    >
      <PolicySection title="Return Policy">
        <p>
          If you are not completely satisfied with your purchase, you can return
          unworn, unwashed, and unaltered items within 30 days of receipt for a
          full refund back to your original payment method. Items must be
          returned with all original tags attached.
        </p>
      </PolicySection>

      <PolicySection title="How to Return">
        <ol className="list-decimal space-y-2 pl-6">
          <li>
            Login to your account and go to the <strong>Orders</strong> section.
          </li>
          <li>
            Select the item(s) you wish to return and follow the provided
            prompts.
          </li>
          <li>Print the generated return shipping label.</li>
          <li>
            Pack your item(s) securely and attach the label to the outside of
            the package.
          </li>
          <li>
            Drop off your package at the nearest authorized carrier Drop Off
            Location.
          </li>
        </ol>
      </PolicySection>

      <PolicySection title="Exchanges">
        <p>
          Need a different size or color? The fastest way to ensure you get what
          you want is to return the item you have, and once the return is
          accepted, make a separate purchase for the new item.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
