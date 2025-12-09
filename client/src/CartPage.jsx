// src/CartPage.jsx
function CartPage({
  cartItems,
  removeFromCart,
  updateQuantity,
  goToCheckout,
}) {
  const total = cartItems.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  );

  if (cartItems.length === 0) {
    return (
      <main style={{ padding: '24px 0' }}>
        <h2 style={{ marginBottom: 8, fontSize: 22, color: '#0f172a' }}>
          Your cart
        </h2>
        <p style={{ color: '#6b7280' }}>Your cart is empty.</p>
      </main>
    );
  }

  return (
    <main style={{ padding: '24px 0' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr)',
          gap: 24,
          alignItems: 'flex-start',
        }}
      >
        <section
          style={{
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 16,
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
            Cart ({cartItems.length} items)
          </h2>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {cartItems.map((item) => (
              <li
                key={item._id}
                style={{
                  display: 'flex',
                  gap: 12,
                  padding: '10px 0',
                  borderBottom: '1px solid #e5e7eb',
                }}
              >
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 12,
                      objectFit: 'cover',
                      flexShrink: 0,
                    }}
                  />
                )}
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: 4,
                    }}
                  >
                    <h3
                      style={{
                        margin: 0,
                        fontSize: 15,
                        fontWeight: 500,
                        color: '#111827',
                      }}
                    >
                      {item.name}
                    </h3>
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: '#111827',
                      }}
                    >
                      ${Number(item.price || 0).toFixed(2)}
                    </span>
                  </div>
                  <p
                    style={{
                      margin: '0 0 8px',
                      fontSize: 12,
                      color: '#6b7280',
                    }}
                  >
                    {item.description}
                  </p>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <button
                        onClick={() => updateQuantity(item._id, -1)}
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: 999,
                          border: 'none',
                          backgroundColor: '#e5e7eb',
                          cursor: 'pointer',
                          fontSize: 16,
                          lineHeight: 1,
                        }}
                      >
                        −
                      </button>
                      <span
                        style={{
                          minWidth: 20,
                          textAlign: 'center',
                          fontSize: 14,
                        }}
                      >
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item._id, 1)}
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: 999,
                          border: 'none',
                          backgroundColor: '#e5e7eb',
                          cursor: 'pointer',
                          fontSize: 16,
                          lineHeight: 1,
                        }}
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item._id)}
                      style={{
                        fontSize: 12,
                        border: 'none',
                        background: 'none',
                        color: '#b91c1c',
                        cursor: 'pointer',
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <aside
          style={{
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 16,
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
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 8,
              fontSize: 14,
              color: '#4b5563',
            }}
          >
            <span>Items total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 16,
              fontSize: 15,
              fontWeight: 600,
              color: '#111827',
            }}
          >
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <button
            onClick={goToCheckout}
            style={{
              width: '100%',
              background:
                'linear-gradient(135deg,#22c55e,#4ade80)',
              color: 'white',
              border: 'none',
              padding: '10px 16px',
              borderRadius: 999,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500,
              boxShadow: '0 10px 24px rgba(34,197,94,0.5)',
            }}
          >
            Proceed to checkout
          </button>
        </aside>
      </div>
    </main>
  );
}

export default CartPage;
