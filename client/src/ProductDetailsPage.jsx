// src/ProductDetailsPage.jsx
import { useEffect, useState } from 'react';

function ProductDetailsPage({ productId, goBack, addToCart }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(
          `http://localhost:5002/api/products/${productId}`
        );
        const data = await res.json().catch(() => null);

        if (!res.ok) {
          throw new Error(data?.message || 'Failed to load product');
        }

        setProduct(data);
      } catch (err) {
        console.error('Error loading product:', err);
        setError(err.message || 'Error loading product');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    } else {
      setLoading(false);
      setError('No product selected');
    }
  }, [productId]);

  if (loading) {
    return <p style={{ padding: '16px', color: '#4b5563' }}>Loading product...</p>;
  }

  if (error || !product) {
    return (
      <main style={{ padding: '24px' }}>
        <button
          onClick={goBack}
          style={{
            marginBottom: 16,
            backgroundColor: '#e5e7eb',
            border: 'none',
            padding: '6px 12px',
            borderRadius: 999,
            cursor: 'pointer',
            fontSize: 12,
          }}
        >
          ← Back
        </button>
        <p style={{ color: '#b91c1c' }}>{error || 'Product not found.'}</p>
      </main>
    );
  }

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
        ← Back to products
      </button>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1.1fr) minmax(0,1fr)',
          gap: 32,
          alignItems: 'flex-start',
        }}
      >
        <div>
          <div
            style={{
              borderRadius: 20,
              overflow: 'hidden',
              boxShadow:
                '0 20px 50px rgba(15,23,42,0.35), 0 0 0 1px rgba(148,163,184,0.35)',
              backgroundColor: '#020617',
            }}
          >
            {product.imageUrl && (
              <img
                src={product.imageUrl}
                alt={product.name}
                style={{
                  width: '100%',
                  height: 360,
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            )}
          </div>
        </div>

        <div>
          <h2
            style={{
              margin: '0 0 8px',
              fontSize: 26,
              fontWeight: 600,
              color: '#0f172a',
            }}
          >
            {product.name}
          </h2>
          <p
            style={{
              margin: '0 0 16px',
              fontSize: 14,
              color: '#6b7280',
              lineHeight: 1.6,
            }}
          >
            {product.description}
          </p>
          <p
            style={{
              margin: '0 0 20px',
              fontSize: 24,
              fontWeight: 700,
              color: '#111827',
            }}
          >
            ${Number(product.price || 0).toFixed(2)}
          </p>

          <button
            onClick={() => addToCart(product)}
            style={{
              background:
                'linear-gradient(135deg,#2563eb,#60a5fa)',
              color: 'white',
              border: 'none',
              padding: '12px 20px',
              borderRadius: 999,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500,
              boxShadow: '0 12px 25px rgba(37,99,235,0.5)',
            }}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </main>
  );
}

export default ProductDetailsPage;
