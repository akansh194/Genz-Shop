// src/ProductsPage.jsx
function ProductsPage({
  products,
  loading,
  addToCart,
  onOpenDetails,
  searchTerm = '',
}) {
  if (loading) {
    return <p style={{ padding: '16px', color: '#4b5563' }}>Loading products...</p>;
  }

  if (!products || products.length === 0) {
    return <p style={{ padding: '16px', color: '#4b5563' }}>No products available.</p>;
  }

  const term = searchTerm.trim().toLowerCase();

  const filtered = term
    ? products.filter((product) => {
        const name = (product.name || '').toLowerCase();
        const desc = (product.description || '').toLowerCase();
        return name.includes(term) || desc.includes(term);
      })
    : products;

  return (
    <main style={{ padding: '8px 0 0' }}>
      {/* Hero section */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1.2fr) minmax(0,1fr)',
          gap: 24,
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <div>
          <p
            style={{
              fontSize: 12,
              textTransform: 'uppercase',
              letterSpacing: 0.18,
              color: '#9ca3af',
              margin: 0,
            }}
          >
            New season, new picks
          </p>
          <h2
            style={{
              margin: '6px 0 8px',
              fontSize: 30,
              lineHeight: 1.2,
              fontWeight: 700,
              color: '#48c4dfff',
            }}
          >
            Discover products that fit your flow.
          </h2>
          <p
            style={{
              margin: '0 0 16px',
              fontSize: 14,
              color: '#2d73ffff',
              maxWidth: 420,
            }}
          >
            Curated items, a clean interface, and a silky‑smooth checkout—crafted with the GENZ
            stack and Stripe.
          </p>
          <div
            style={{
              display: 'flex',
              gap: 10,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={() => {
                const listEl = document.getElementById('products-grid');
                if (listEl) {
                  listEl.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                  });
                }
              }}
              style={{
                background:
                  'linear-gradient(135deg,#2563eb,#60a5fa)',
                color: 'white',
                border: 'none',
                padding: '10px 18px',
                borderRadius: 999,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 500,
                boxShadow: '0 14px 30px rgba(37,99,235,0.5)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span>Shop now</span>
              <span>→</span>
            </button>
            <span
              style={{
                fontSize: 12,
                color: '#9ca3af',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: '#22c55e',
                }}
              />
              Secure Stripe payments · Fast order updates
            </span>
          </div>
        </div>

        <div
          style={{
            justifySelf: 'center',
            width: '100%',
            maxWidth: 320,
          }}
        >
          <div
            style={{
              position: 'relative',
              borderRadius: 999,
              padding: 18,
              background:
                'radial-gradient(circle at 0 0,#38bdf8,transparent 55%), radial-gradient(circle at 100% 0,#a855f7,transparent 55%), radial-gradient(circle at 50% 100%,#22c55e,transparent 55%)',
              boxShadow:
                '0 26px 70px rgba(15,23,42,0.3), 0 0 0 1px rgba(148,163,184,0.3)',
            }}
          >
            <div
              style={{
                borderRadius: 32,
                backgroundColor: '#020617',
                padding: 16,
                color: 'white',
              }}
            >
              <p
                style={{
                  margin: '0 0 4px',
                  fontSize: 12,
                  color: '#9ca3af',
                }}
              >
                Today&apos;s highlight
              </p>
              <h3
                style={{
                  margin: '0 0 6px',
                  fontSize: 16,
                  fontWeight: 600,
                }}
              >
                Modern GENZ storefront
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  color: '#9ca3af',
                }}
              >
                Explore products, manage orders, and pay securely in a clean, minimal interface.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* No matches message when search filters everything out */}
      {filtered.length === 0 ? (
        <section style={{ paddingTop: 8 }}>
          <p style={{ color: '#4b5563' }}>No products match “{searchTerm}”.</p>
        </section>
      ) : (
        <section id="products-grid">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 20,
            }}
          >
            {filtered.map((product) => {
              const productId = product._id || product.id;

              return (
                <div
                  key={productId}
                  style={{
                    borderRadius: 16,
                    padding: 16,
                    backgroundColor: 'white',
                    boxShadow:
                      '0 18px 45px rgba(15,23,42,0.12), 0 0 0 1px rgba(148,163,184,0.2)',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow =
                      '0 20px 50px rgba(15,23,42,0.18), 0 0 0 1px rgba(148,163,184,0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow =
                      '0 18px 45px rgba(15,23,42,0.12), 0 0 0 1px rgba(148,163,184,0.2)';
                  }}
                >
                  <div
                    onClick={() =>
                      onOpenDetails && productId
                        ? onOpenDetails(productId)
                        : undefined
                    }
                    style={{
                      cursor: onOpenDetails && productId ? 'pointer' : 'default',
                      marginBottom: 12,
                    }}
                  >
                    {product.imageUrl && (
                      <div
                        style={{
                          borderRadius: 12,
                          overflow: 'hidden',
                          marginBottom: 10,
                          backgroundColor: '#e5e7eb',
                        }}
                      >
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          style={{
                            width: '100%',
                            height: 180,
                            objectFit: 'cover',
                            display: 'block',
                          }}
                        />
                      </div>
                    )}

                    <h3
                      style={{
                        margin: '0 0 4px',
                        fontSize: 16,
                        fontWeight: 600,
                        color: '#0f172a',
                      }}
                    >
                      {product.name}
                    </h3>
                  </div>

                  <p
                    style={{
                      margin: '0 0 10px',
                      fontSize: 13,
                      color: '#6b7280',
                      minHeight: 40,
                    }}
                  >
                    {product.description}
                  </p>
                  <p
                    style={{
                      margin: '0 0 14px',
                      fontWeight: 600,
                      fontSize: 16,
                      color: '#111827',
                    }}
                  >
                    ${Number(product.price || 0).toFixed(2)}
                  </p>
                  <button
                    onClick={() => addToCart(product)}
                    style={{
                      marginTop: 'auto',
                      width: '100%',
                      background:
                        'linear-gradient(135deg,#2563eb,#60a5fa)',
                      color: 'white',
                      border: 'none',
                      padding: '10px 16px',
                      borderRadius: 999,
                      cursor: 'pointer',
                      fontSize: 14,
                      fontWeight: 500,
                    }}
                  >
                    Add to Cart
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}

export default ProductsPage;
