// src/MyOrdersPage.jsx
import { useEffect, useState } from 'react';

function MyOrdersPage({ goBack, token }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (!token) {
          throw new Error('Please login to view your orders');
        }

        const res = await fetch('http://localhost:5002/api/my-orders', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json().catch(() => null);

        if (!res.ok) {
          throw new Error(data?.message || 'Failed to load your orders');
        }

        setOrders(data);
      } catch (err) {
        console.error('Error fetching my orders:', err);
        setError(err.message || 'Error loading orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  if (loading) {
    return <p style={{ padding: '16px', color: '#4b5563' }}>Loading your orders...</p>;
  }

  if (error) {
    return (
      <main style={{ padding: '24px 0' }}>
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
        <p style={{ color: '#b91c1c' }}>{error}</p>
      </main>
    );
  }

  return (
    <main style={{ padding: '24px 0' }}>
      <button
        onClick={goBack}
        style={{
          marginBottom: 18,
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

      <div
        style={{
          backgroundColor: 'white',
          borderRadius: 16,
          padding: 18,
          boxShadow:
            '0 16px 40px rgba(15,23,42,0.18), 0 0 0 1px rgba(148,163,184,0.25)',
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
          My Orders
        </h2>

        {orders.length === 0 ? (
          <p style={{ color: '#6b7280', fontSize: 14 }}>
            You have no orders yet.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: 13,
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: '#f9fafb',
                    borderBottom: '1px solid #e5e7eb',
                  }}
                >
                  <th
                    style={{
                      textAlign: 'left',
                      padding: 8,
                      fontWeight: 500,
                      color: '#6b7280',
                    }}
                  >
                    Order ID
                  </th>
                  <th
                    style={{
                      textAlign: 'left',
                      padding: 8,
                      fontWeight: 500,
                      color: '#6b7280',
                    }}
                  >
                    Items
                  </th>
                  <th
                    style={{
                      textAlign: 'left',
                      padding: 8,
                      fontWeight: 500,
                      color: '#6b7280',
                    }}
                  >
                    Total
                  </th>
                  <th
                    style={{
                      textAlign: 'left',
                      padding: 8,
                      fontWeight: 500,
                      color: '#6b7280',
                    }}
                  >
                    Status
                  </th>
                  <th
                    style={{
                      textAlign: 'left',
                      padding: 8,
                      fontWeight: 500,
                      color: '#6b7280',
                    }}
                  >
                    Placed on
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, idx) => (
                  <tr
                    key={order._id}
                    style={{
                      borderBottom: '1px solid #e5e7eb',
                      backgroundColor: idx % 2 === 0 ? 'white' : '#f9fafb',
                    }}
                  >
                    <td
                      style={{
                        padding: 8,
                        maxWidth: 200,
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas',
                        fontSize: 12,
                        color: '#4b5563',
                      }}
                    >
                      {order._id}
                    </td>
                    <td style={{ padding: 8, color: '#4b5563' }}>
                      {Array.isArray(order.items) ? order.items.length : 0}
                    </td>
                    <td style={{ padding: 8, color: '#111827', fontWeight: 500 }}>
                      ${(order.total || 0).toFixed(2)}
                    </td>
                    <td style={{ padding: 8 }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '3px 10px',
                          borderRadius: 999,
                          fontSize: 11,
                          textTransform: 'capitalize',
                          backgroundColor:
                            order.status === 'delivered'
                              ? 'rgba(16,185,129,0.12)'
                              : order.status === 'shipped'
                              ? 'rgba(59,130,246,0.12)'
                              : order.status === 'cancelled'
                              ? 'rgba(239,68,68,0.12)'
                              : 'rgba(148,163,184,0.16)',
                          color:
                            order.status === 'delivered'
                              ? '#065f46'
                              : order.status === 'shipped'
                              ? '#1d4ed8'
                              : order.status === 'cancelled'
                              ? '#b91c1c'
                              : '#374151',
                        }}
                      >
                        {order.status || 'pending'}
                      </span>
                    </td>
                    <td style={{ padding: 8, color: '#4b5563' }}>
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleString()
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

export default MyOrdersPage;
