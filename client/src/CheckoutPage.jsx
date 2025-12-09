// src/CheckoutPage.jsx
import { useState } from 'react';

function CheckoutPage({ cartItems, onOrderPlaced, goBack, token }) {
  const [form, setForm] = useState({
    customerName: '',
    address: '',
    city: '',
    state: '',
    zip: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const total = cartItems.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  );

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (!token) {
        throw new Error('Please login before placing an order');
      }

      // 1) Create Stripe Checkout session
      const stripeRes = await fetch(
        'http://localhost:5002/api/pay/create-checkout-session',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: cartItems }),
        }
      );

      const stripeData = await stripeRes.json().catch(() => null);

      if (!stripeRes.ok || !stripeData?.url) {
        throw new Error(stripeData?.message || 'Failed to start payment');
      }

      // 2) Save data so App.jsx can create the order after payment success
      localStorage.setItem('lastCheckoutCart', JSON.stringify(cartItems));
      localStorage.setItem(
        'lastCheckoutAddress',
        JSON.stringify({
          customerName: form.customerName,
          address: form.address,
          city: form.city,
          state: form.state,
          zip: form.zip,
        })
      );

      // 3) Redirect to Stripe
      window.location.href = stripeData.url;
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main style={{ padding: '24px 0' }}>
      <button
        onClick={goBack}
        style={{
          marginBottom: 20,
          backgroundColor: '#e5e7eb',
          border: 'none',
          padding: '6px 12px',
          borderRadius: 999,
          cursor: 'pointer',
          fontSize: 12,
        }}
      >
        ← Back to cart
      </button>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr)',
          gap: 24,
          alignItems: 'flex-start',
        }}
      >
        <section
          style={{
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 20,
            boxShadow:
              '0 12px 30px rgba(15,23,42,0.12), 0 0 0 1px rgba(148,163,184,0.18)',
          }}
        >
          <h2
            style={{
              margin: '0 0 12px',
              fontSize: 20,
              fontWeight: 600,
              color: '#0f172a',
            }}
          >
            Shipping details
          </h2>

          <form
            onSubmit={handleSubmit}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
            }}
          >
            <input
              name="customerName"
              placeholder="Full name"
              value={form.customerName}
              onChange={handleChange}
              required
              style={{
                gridColumn: '1 / -1',
                padding: '8px 10px',
                borderRadius: 8,
                border: '1px solid #d1d5db',
                fontSize: 14,
              }}
            />
            <input
              name="address"
              placeholder="Address"
              value={form.address}
              onChange={handleChange}
              required
              style={{
                gridColumn: '1 / -1',
                padding: '8px 10px',
                borderRadius: 8,
                border: '1px solid #d1d5db',
                fontSize: 14,
              }}
            />
            <input
              name="city"
              placeholder="City"
              value={form.city}
              onChange={handleChange}
              required
              style={{
                padding: '8px 10px',
                borderRadius: 8,
                border: '1px solid #d1d5db',
                fontSize: 14,
              }}
            />
            <input
              name="state"
              placeholder="State"
              value={form.state}
              onChange={handleChange}
              required
              style={{
                padding: '8px 10px',
                borderRadius: 8,
                border: '1px solid #d1d5db',
                fontSize: 14,
              }}
            />
            <input
              name="zip"
              placeholder="ZIP"
              value={form.zip}
              onChange={handleChange}
              required
              style={{
                gridColumn: '1 / -1',
                padding: '8px 10px',
                borderRadius: 8,
                border: '1px solid #d1d5db',
                fontSize: 14,
              }}
            />

            {error && (
              <p
                style={{
                  gridColumn: '1 / -1',
                  color: '#b91c1c',
                  fontSize: 13,
                }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || cartItems.length === 0}
              style={{
                gridColumn: '1 / -1',
                marginTop: 4,
                width: '100%',
                background:
                  'linear-gradient(135deg,#2563eb,#60a5fa)',
                color: 'white',
                border: 'none',
                padding: '10px 16px',
                borderRadius: 999,
                cursor: submitting ? 'default' : 'pointer',
                fontSize: 14,
                fontWeight: 500,
                boxShadow: '0 10px 24px rgba(37,99,235,0.5)',
                opacity: submitting || cartItems.length === 0 ? 0.7 : 1,
              }}
            >
              {submitting ? 'Redirecting to Stripe...' : 'Pay with Stripe'}
            </button>
          </form>
        </section>

        <aside
          style={{
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 20,
            boxShadow:
              '0 12px 30px rgba(15,23,42,0.12), 0 0 0 1px rgba(148,163,184,0.18)',
          }}
        >
          <h3
            style={{
              margin: '0 0 12px',
              fontSize: 18,
              fontWeight: 600,
              color: '#0f172a',
            }}
          >
            Order summary
          </h3>
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: '0 0 12px',
              maxHeight: 220,
              overflowY: 'auto',
            }}
          >
            {cartItems.map((item) => (
              <li
                key={item._id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 13,
                  color: '#4b5563',
                  padding: '4px 0',
                }}
              >
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span>
                  $
                  {(
                    (item.price || 0) * (item.quantity || 1)
                  ).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 8,
              fontSize: 15,
              fontWeight: 600,
              color: '#111827',
            }}
          >
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default CheckoutPage;
