import { PolicyPage, PolicySection } from "@/shared/components/policy-page";

export default function TermsPage() {
  return (
    <PolicyPage title="Terms of Use">
      <PolicySection title="1. Acceptance of Terms">
        <p>
          By accessing and using EZ Shop, you accept and agree to be bound by
          the terms and provision of this agreement. In addition, when using
          these particular services, you shall be subject to any posted
          guidelines or rules applicable to such services.
        </p>
      </PolicySection>

      <PolicySection title="2. Intellectual Property">
        <p>
          The site and its original content, features, and functionality are
          owned by EZ Shop and are protected by international copyright,
          trademark, patent, trade secret, and other intellectual property or
          proprietary rights laws. No material from the site may be copied,
          reproduced, republished, uploaded, posted, transmitted, or distributed
          in any way without explicit permission.
        </p>
      </PolicySection>

      <PolicySection title="3. User Accounts">
        <p>
          If you create an account on the EZ Shop platform, you are responsible
          for maintaining the security of your account, and you are fully
          responsible for all activities that occur under the account and any
          other actions taken in connection with it. You must immediately notify
          us of any unauthorized uses of your account or any other breaches of
          security.
        </p>
      </PolicySection>

      <PolicySection title="4. Products and Pricing">
        <p>
          We reserve the right to refuse service to anyone for any reason at any
          time. Prices for our products are subject to change without notice. We
          reserve the right at any time to modify or discontinue the Service (or
          any part or content thereof) without notice at any time.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
