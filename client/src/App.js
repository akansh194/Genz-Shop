// src/App.jsx
import { useEffect, useState } from 'react';
import ProductsPage from './ProductsPage';
import CartPage from './CartPage';
import CheckoutPage from './CheckoutPage';
import AdminOrdersPage from './AdminOrdersPage';
import AdminProductsPage from './AdminProductsPage';
import AuthPage from './AuthPage';
import MyOrdersPage from './MyOrdersPage';
import ProductDetailsPage from './ProductDetailsPage';

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [cartItems, setCartItems] = useState([]);
  const [view, setView] = useState('products');
  const [lastOrderId, setLastOrderId] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentStatus, setPaymentStatus] = useState(null); // 'success' | 'cancel' | null

  const [auth, setAuth] = useState(() => {
    const stored = localStorage.getItem('auth');
    return stored ? JSON.parse(stored) : { user: null, token: null };
  });

  const isLoggedIn = !!auth.token;

  const updateAuth = (value) => {
    setAuth(value);
    localStorage.setItem('auth', JSON.stringify(value));
  };

  const logout = () => {
    updateAuth({ user: null, token: null });
    setView('products');
  };

  const addToCart = (product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item._id === product._id);
      if (existing) {
        return prev.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item._id !== id));
  };

  const updateQuantity = (id, delta) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item._id === id
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('http://localhost:5002/api/products');
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Read payment status from URL and (demo) create order after Stripe success
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment');

    if (payment === 'success') {
      setPaymentStatus('success');

      const storedCart = localStorage.getItem('lastCheckoutCart');
      const storedAddress = localStorage.getItem('lastCheckoutAddress');

      if (storedCart && storedAddress && auth?.token) {
        const items = JSON.parse(storedCart);
        const addressData = JSON.parse(storedAddress);

        fetch('http://localhost:5002/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth.token}`,
          },
          body: JSON.stringify({
            items,
            ...addressData,
          }),
        })
          .then((res) => res.json())
          .then((order) => {
            localStorage.removeItem('lastCheckoutCart');
            localStorage.removeItem('lastCheckoutAddress');
            setLastOrderId(order._id);
            setView('myOrders');
          })
          .catch((err) => {
            console.error('Failed to create order after payment:', err);
          });
      }
    } else if (payment === 'cancel') {
      setPaymentStatus('cancel');
    }
  }, [auth?.token]);

  const handleOrderPlaced = (order) => {
    setLastOrderId(order._id);
    setCartItems([]);
    setView('myOrders');
    alert(`Order placed! ID: ${order._id}`);
  };

  const openProductDetails = (id) => {
    setSelectedProductId(id);
    setView('productDetails');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'linear-gradient(180deg,#0f172a 0,#020617 220px,#f3f4f6 220px,#f3f4f6 100%)',
      }}
    >
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 32px',
          backgroundColor: 'rgba(15,23,42,0.96)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 10px 30px rgba(15,23,42,0.6)',
        }}
      >
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 12 }}
          onClick={() => setView('products')}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 999,
              background:
                'radial-gradient(circle at 30% 20%, #38bdf8, #6366f1 45%, #ec4899 80%)',
            }}
          />
          <h1
            style={{
              cursor: 'pointer',
              margin: 0,
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: 0.4,
              color: 'white',
            }}
          >
            GENZ Shop
          </h1>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 10,
            alignItems: 'center',
          }}
        >
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '7px 12px',
              borderRadius: 999,
              border: '1px solid #4b5563',
              backgroundColor: '#020617',
              color: '#e5e7eb',
              fontSize: 13,
              minWidth: 200,
              outline: 'none',
            }}
          />
          {isLoggedIn && (
            <>
              <button
                onClick={() => setView('myOrders')}
                style={{
                  backgroundColor: '#0f766e',
                  color: 'white',
                  border: 'none',
                  padding: '8px 14px',
                  borderRadius: 999,
                  cursor: 'pointer',
                  fontSize: 13,
                }}
              >
                My Orders
              </button>
              {auth.user?.isAdmin && (
                <>
                  <button
                    onClick={() => setView('adminOrders')}
                    style={{
                      backgroundColor: '#4b5563',
                      color: 'white',
                      border: 'none',
                      padding: '8px 14px',
                      borderRadius: 999,
                      cursor: 'pointer',
                      fontSize: 13,
                    }}
                  >
                    Admin Orders
                  </button>
                  <button
                    onClick={() => setView('adminProducts')}
                    style={{
                      background:
                        'linear-gradient(135deg,#8b5cf6,#ec4899)',
                      color: 'white',
                      border: 'none',
                      padding: '8px 14px',
                      borderRadius: 999,
                      cursor: 'pointer',
                      fontSize: 13,
                    }}
                  >
                    Admin Products
                  </button>
                </>
              )}
            </>
          )}
          <button
            onClick={() => setView('cart')}
            style={{
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              padding: '8px 14px',
              borderRadius: 999,
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            Cart ({cartCount})
          </button>
          {isLoggedIn ? (
            <>
              <span style={{ fontSize: 13, color: '#cbd5f5' }}>
                {auth.user?.name || auth.user?.email}
              </span>
              <button
                onClick={logout}
                style={{
                  backgroundColor: '#b91c1c',
                  color: 'white',
                  border: 'none',
                  padding: '7px 12px',
                  borderRadius: 999,
                  cursor: 'pointer',
                  fontSize: 12,
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => setView('auth')}
              style={{
                backgroundColor: '#22c55e',
                color: 'white',
                border: 'none',
                padding: '8px 14px',
                borderRadius: 999,
                cursor: 'pointer',
                fontSize: 13,
              }}
            >
              Login / Register
            </button>
          )}
        </div>
      </header>

      <main
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '24px 16px 40px',
        }}
      >
        {paymentStatus && (
          <div
            style={{
              marginBottom: 16,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                position: 'relative',
                padding: '10px 16px',
                borderRadius: 14,
                minWidth: 0,
                maxWidth: 520,
                width: '100%',
                backgroundColor:
                  paymentStatus === 'success'
                    ? '#ecfdf3'
                    : '#fef2f2',
                border:
                  paymentStatus === 'success'
                    ? '1px solid #bbf7d0'
                    : '1px solid #fecaca',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow:
                  '0 14px 30px rgba(15,23,42,0.15)',
              }}
            >
              {paymentStatus === 'success' ? (
                <span
                  style={{
                    fontSize: 18,
                  }}
                >
                  🎉
                </span>
              ) : (
                <span
                  style={{
                    fontSize: 18,
                  }}
                >
                  ⚠️
                </span>
              )}

              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    fontWeight: 600,
                    color:
                      paymentStatus === 'success'
                        ? '#166534'
                        : '#b91c1c',
                  }}
                >
                  {paymentStatus === 'success'
                    ? 'Payment successful'
                    : 'Payment cancelled'}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: 12,
                    color: '#4b5563',
                  }}
                >
                  {paymentStatus === 'success'
                    ? 'Thank you for your order. You can track it from the My Orders page.'
                    : 'Your payment did not complete. You can try again from your cart when you’re ready.'}
                </p>
              </div>

              <button
                onClick={() => setPaymentStatus(null)}
                style={{
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  fontSize: 16,
                  lineHeight: 1,
                  color: '#6b7280',
                }}
              >
                ×
              </button>
            </div>
          </div>
        )}

        {view === 'products' && (
          <ProductsPage
            products={products}
            loading={loading}
            addToCart={addToCart}
            onOpenDetails={openProductDetails}
            searchTerm={searchTerm}
          />
        )}

        {view === 'productDetails' && selectedProductId && (
          <ProductDetailsPage
            productId={selectedProductId}
            goBack={() => setView('products')}
            addToCart={addToCart}
          />
        )}

        {view === 'cart' && (
          <CartPage
            cartItems={cartItems}
            removeFromCart={removeFromCart}
            updateQuantity={updateQuantity}
            goToCheckout={() => setView('checkout')}
          />
        )}

        {view === 'checkout' && (
          <CheckoutPage
            cartItems={cartItems}
            onOrderPlaced={handleOrderPlaced}
            goBack={() => setView('cart')}
            token={auth.token}
          />
        )}

        {view === 'adminOrders' && (
          <AdminOrdersPage
            goBack={() => setView('products')}
            token={auth.token}
          />
        )}

        {view === 'adminProducts' && (
          <AdminProductsPage
            goBack={() => setView('products')}
            token={auth.token}
          />
        )}

        {view === 'myOrders' && (
          <MyOrdersPage
            goBack={() => setView('products')}
            token={auth.token}
          />
        )}

        {view === 'auth' && (
          <AuthPage
            onAuthSuccess={(data) => {
              updateAuth(data);
              setView('products');
            }}
          />
        )}

        {lastOrderId && view !== 'checkout' && (
          <p style={{ padding: '8px 4px', fontSize: 12, color: '#6b7280' }}>
            Last order ID: {lastOrderId}
          </p>
        )}
      </main>
    </div>
  );
}

export default App;
