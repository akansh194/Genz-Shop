// src/AdminProductsPage.jsx
import { useEffect, useState } from 'react';

const emptyForm = {
  _id: null,
  name: '',
  description: '',
  price: '',
  imageUrl: '',
};

function AdminProductsPage({ goBack, token }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const isEditing = !!form._id;

  const fetchProducts = async () => {
    try {
      if (!token) {
        throw new Error('Please login as admin to manage products');
      }

      const res = await fetch('http://localhost:5002/api/admin/products', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || 'Failed to load products');
      }

      setProducts(data);
      setError('');
    } catch (err) {
      console.error('Error fetching admin products:', err);
      setError(err.message || 'Error loading products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'price' ? value.replace(/[^0-9.]/g, '') : value,
    }));
  };

  const handleEdit = (product) => {
    setForm({
      _id: product._id,
      name: product.name || '',
      description: product.description || '',
      price: product.price != null ? String(product.price) : '',
      imageUrl: product.imageUrl || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setForm(emptyForm);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;

    try {
      const res = await fetch(
        `http://localhost:5002/api/admin/products/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || 'Failed to delete product');
      }

      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error('Delete error:', err);
      alert(err.message || 'Failed to delete product');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (!token) {
        throw new Error('Please login as admin to save products');
      }

      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        imageUrl: form.imageUrl,
      };

      const url = isEditing
        ? `http://localhost:5002/api/admin/products/${form._id}`
        : 'http://localhost:5002/api/admin/products';

      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || 'Failed to save product');
      }

      if (isEditing) {
        setProducts((prev) =>
          prev.map((p) => (p._id === data._id ? data : p))
        );
      } else {
        setProducts((prev) => [...prev, data]);
      }

      setForm(emptyForm);
    } catch (err) {
      console.error('Save error:', err);
      setError(err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p style={{ padding: '16px' }}>Loading products...</p>;
  }

  return (
    <main style={{ padding: '24px' }}>
      <button onClick={goBack} style={{ marginBottom: 16 }}>
        ← Back
      </button>

      <h2 style={{ marginBottom: 16 }}>Admin Products</h2>

      <section
        style={{
          marginBottom: 24,
          padding: 16,
          border: '1px solid #e5e7eb',
          borderRadius: 8,
        }}
      >
        <h3 style={{ marginBottom: 12 }}>
          {isEditing ? 'Edit Product' : 'Add New Product'}
        </h3>
        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            maxWidth: 400,
          }}
        >
          <input
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            rows={3}
          />
          <input
            name="price"
            placeholder="Price"
            value={form.price}
            onChange={handleChange}
            required
          />
          <input
            name="imageUrl"
            placeholder="Image URL (public HTTP URL)"
            value={form.imageUrl}
            onChange={handleChange}
          />

          {form.imageUrl && (
            <div style={{ marginTop: 8 }}>
              <p style={{ fontSize: 12, marginBottom: 4 }}>Preview:</p>
              <img
                src={form.imageUrl}
                alt={form.name}
                style={{ width: 120, height: 80, objectFit: 'cover' }}
              />
            </div>
          )}

          {error && <p style={{ color: 'red' }}>{error}</p>}

          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button type="submit" disabled={saving}>
              {saving
                ? isEditing
                  ? 'Saving...'
                  : 'Creating...'
                : isEditing
                ? 'Save Changes'
                : 'Create Product'}
            </button>
            {isEditing && (
              <button type="button" onClick={handleCancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section>
        <h3 style={{ marginBottom: 12 }}>All Products</h3>
        {products.length === 0 ? (
          <p>No products yet.</p>
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
                <th style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb', padding: 8 }}>Name</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb', padding: 8 }}>Price</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb', padding: 8 }}>Image</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb', padding: 8 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td style={{ padding: 8 }}>{p.name}</td>
                  <td style={{ padding: 8 }}>${(p.price || 0).toFixed(2)}</td>
                  <td style={{ padding: 8 }}>
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        style={{
                          width: 60,
                          height: 40,
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      '-'
                    )}
                  </td>
                  <td style={{ padding: 8 }}>
                    <button
                      onClick={() => handleEdit(p)}
                      style={{ marginRight: 8 }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p._id)}
                      style={{ backgroundColor: '#ef4444', color: 'white' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}

export default AdminProductsPage;
