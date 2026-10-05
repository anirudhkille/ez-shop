import { PolicyPage, PolicySection } from "@/shared/components/policy-page";

export default function PrivacyPolicyPage() {
  return (
    <PolicyPage title="Privacy Policy">
      <PolicySection title="1. Information We Collect">
        <p className="mb-4">
          We collect information you provide directly to us, such as when you
          create or modify your account, request on-demand services, contact
          customer support, or otherwise communicate with us.
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Name, email address, physical address, and phone number.</li>
          <li>Payment information and transaction history.</li>
          <li>Demographic data and preferences.</li>
        </ul>
      </PolicySection>

      <PolicySection title="2. How We Use Your Information">
        <p>
          We use the information we collect to provide, maintain, and improve
          our services. This includes using the information to process
          transactions, send related information, including confirmations and
          invoices, and provide customer service. We also use the information to
          personalize and improve the services and provide content or features
          that match user profiles or interests.
        </p>
      </PolicySection>

      <PolicySection title="3. Sharing of Information">
        <p>
          We may share the information we collect about you as described in this
          Policy or as described at the time of collection or sharing, including
          selectively with external business partners and service providers that
          perform services on our behalf. These services include payment
          processing, shipping providers, and data analytics platforms.
        </p>
      </PolicySection>

      <PolicySection title="4. Data Security">
        <p>
          We implement industry-standard security measures designed to safeguard
          your information. However, no data transmission over the internet or
          storage system can be guaranteed to be 100% secure.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
