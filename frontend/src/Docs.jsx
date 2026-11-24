const SNIPPETS = {
  create: `const res = await fetch("https://your-relay-server.com/payments", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: \`Bearer \${RELAY_API_KEY}\`
  },
  body: JSON.stringify({ amount: 499, currency: "USD", country: "US" })
});

const payment = await res.json();
// { id, provider: "stripe", providerRef, status: "pending", ... }`,
  keys: `PUT /provider-keys
Authorization: Bearer <your relay JWT>

{
  "stripeSecretKey": "sk_test_...",
  "razorpayKeyId": "rzp_test_...",
  "razorpayKeySecret": "..."
}`,
  webhook: `https://your-relay-server.com/webhooks/stripe
https://your-relay-server.com/webhooks/razorpay

// paste these as the webhook endpoint URL inside
// your own Stripe / Razorpay dashboard, one time`,
  status: `GET /payments/:id
GET /payments            // list all your payments
GET /webhooks/payment/:id  // event history for a payment`
};

function Code({ children }) {
  return (
    <pre
      style={{
        background: "var(--surface-2)",
        border: "1px solid var(--border)",
        borderRadius: "8px",
        padding: "14px 16px",
        fontSize: "12.5px",
        lineHeight: 1.6,
        overflowX: "auto",
        color: "var(--text-primary)",
        margin: 0
      }}
    >
      <code>{children}</code>
    </pre>
  );
}

function Step({ number, title, children, code }) {
  return (
    <div style={{ marginBottom: "24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
        <span
          style={{
            width: "22px",
            height: "22px",
            borderRadius: "6px",
            background: "var(--accent-soft)",
            color: "var(--accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            fontWeight: 700,
            flexShrink: 0
          }}
        >
          {number}
        </span>
        <h3 style={{ margin: 0, fontSize: "14.5px" }}>{title}</h3>
      </div>
      <p style={{ margin: "0 0 10px 32px", fontSize: "13px", color: "var(--text-secondary)" }}>{children}</p>
      {code && <div style={{ marginLeft: "32px" }}><Code>{code}</Code></div>}
    </div>
  );
}

export default function Docs() {
  return (
    <div className="fade-in" style={{ maxWidth: "720px" }}>
      <h2 style={{ margin: "0 0 6px", fontSize: "22px" }}>Documentation</h2>
      <p style={{ margin: "0 0 24px", fontSize: "13px", color: "var(--text-secondary)" }}>
        Integrate Relay into your own backend in a few minutes.
      </p>

      <div className="card">
        <Step number="1" title="Create an account & get an API key" code={null}>
          Sign up at <code>/auth/signup</code>, log in at <code>/auth/login</code> to get a JWT, then
          call <code>POST /api-keys</code> to generate your Relay API key.
        </Step>

        <Step number="2" title="Connect your own Stripe / Razorpay keys" code={SNIPPETS.keys}>
          Relay never holds your money — it uses your own provider credentials to create payments.
        </Step>

        <Step number="3" title="Point your provider's webhook at Relay" code={SNIPPETS.webhook}>
          One-time setup inside your Stripe/Razorpay dashboard.
        </Step>

        <Step number="4" title="Create a payment from your code" code={SNIPPETS.create}>
          That's the entire integration. Relay auto-routes to Stripe or Razorpay based on
          <code> country</code>/<code>currency</code>, or you can pass <code>provider</code> explicitly.
        </Step>

        <Step number="5" title="Check status & webhook history" code={SNIPPETS.status}>
          Relay verifies every webhook signature and updates payment status automatically — you just read it back.
        </Step>
      </div>
    </div>
  );
}
