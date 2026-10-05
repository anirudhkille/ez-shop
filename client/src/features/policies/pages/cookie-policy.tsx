import { PolicyPage, PolicySection } from "@/shared/components/policy-page";

export default function CookiePolicyPage() {
  return (
    <PolicyPage title="Cookie Policy">
      <PolicySection title="1. What Are Cookies?">
        <p>
          Cookies are small text files that are stored on your computer or
          mobile device when you visit a website. They are widely used to make
          websites work more efficiently and provide information to the owners
          of the site.
        </p>
      </PolicySection>

      <PolicySection title="2. How We Use Cookies">
        <p className="mb-4">
          We use cookies and similar tracking technologies to track the activity
          on our Service and hold certain information. We use cookies for the
          following purposes:
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong className="text-foreground">Essential Cookies:</strong>{" "}
            Necessary for the website to function properly, such as
            authenticating users and preventing fraudulent use of user accounts.
          </li>
          <li>
            <strong className="text-foreground">Analytics Cookies:</strong>{" "}
            Allow us to understand how visitors interact with the website by
            collecting and reporting information anonymously.
          </li>
          <li>
            <strong className="text-foreground">Preference Cookies:</strong>{" "}
            Enable a website to remember information that changes the way the
            website behaves or looks, like your preferred language.
          </li>
        </ul>
      </PolicySection>

      <PolicySection title="3. Managing Cookies">
        <p>
          You can instruct your browser to refuse all cookies or to indicate
          when a cookie is being sent. However, if you do not accept cookies,
          you may not be able to use some portions of our Service. Check your
          browser specific settings to clear or delete cookies.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
