// src/AdminOrdersPage.jsx
import { useEffect, useState } from 'react';

const STATUS_OPTIONS = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
];

function AdminOrdersPage({ goBack, token }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (!token) {
          throw new Error('Please login as admin to view orders');
        }

        const res = await fetch('http://localhost:5002/api/admin/orders', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json().catch(() => null);

        if (!res.ok) {
          throw new Error(data?.message || 'Failed to load orders');
        }

        setOrders(data);
      } catch (err) {
        console.error('Error fetching admin orders:', err);
        setError(err.message || 'Error loading orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  const handleStatusChange = (id, newStatus) => {
    setOrders((prev) =>
      prev.map((order) =>
        order._id === id ? { ...order, status: newStatus } : order
      )
    );
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      setUpdatingId(id);

      const res = await fetch(
        `http://localhost:5002/api/admin/orders/${id}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || 'Failed to update status');
      }

      setOrders((prev) =>
        prev.map((order) => (order._id === id ? data : order))
      );
    } catch (err) {
      console.error('Update status error:', err);
      alert(err.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return <p style={{ padding: '16px' }}>Loading orders...</p>;
  }

  if (error) {
    return (
      <main style={{ padding: '24px' }}>
        <button onClick={goBack} style={{ marginBottom: 16 }}>
          ← Back
        </button>
        <p style={{ color: 'red' }}>{error}</p>
      </main>
    );
  }

  return (
    <main style={{ padding: '24px' }}>
      <button onClick={goBack} style={{ marginBottom: 16 }}>
        ← Back
      </button>

      <h2 style={{ marginBottom: 16 }}>All Orders (Admin)</h2>

      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 14,
          }}
        >
          <thead>
            <tr>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb', padding: 8 }}>Order ID</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb', padding: 8 }}>User</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb', padding: 8 }}>Customer</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb', padding: 8 }}>Total</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb', padding: 8 }}>Items</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb', padding: 8 }}>Status</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb', padding: 8 }}>Created</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb', padding: 8 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td style={{ padding: 8 }}>{order._id}</td>
                <td style={{ padding: 8 }}>
                  {order.user
                    ? `${order.user.name || ''} (${order.user.email})`
                    : '-'}
                </td>
                <td style={{ padding: 8 }}>{order.customerName || '-'}</td>
                <td style={{ padding: 8 }}>${(order.total || 0).toFixed(2)}</td>
                <td style={{ padding: 8 }}>
                  {Array.isArray(order.items) ? order.items.length : 0}
                </td>
                <td style={{ padding: 8 }}>
                  <select
                    value={order.status || 'pending'}
                    onChange={(e) =>
                      handleStatusChange(order._id, e.target.value)
                    }
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
                <td style={{ padding: 8 }}>
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleString()
                    : '-'}
                </td>
                <td style={{ padding: 8 }}>
                  <button
                    onClick={() =>
                      handleUpdateStatus(order._id, order.status || 'pending')
                    }
                    disabled={updatingId === order._id}
                  >
                    {updatingId === order._id
                      ? 'Updating...'
                      : 'Update Status'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}

export default AdminOrdersPage;
