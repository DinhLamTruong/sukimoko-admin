import React, { useState, useEffect } from 'react';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

import Header from '../components/Header';

// Helper to map backend discount to frontend camelCase fields
const mapBackendDiscount = d => ({
  id: d.id,
  name: d.name,
  code: d.code,
  description: d.description,
  type: d.discount_type,
  value: d.discount_value,
  usage_limit: d.usage_limit,
  used_count: d.used_count,
  minOrder: d.min_order || null,
  startDate: d.start_date ? d.start_date.split('T')[0] : '',
  endDate: d.end_date ? d.end_date.split('T')[0] : '',
  active: d.active,
});

export default function DiscountAdmin() {
  const [discounts, setDiscounts] = useState([]);
  // const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch discounts from backend API
  const fetchDiscounts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/discounts`);
      if (!res.ok) throw new Error('Failed to fetch discounts');
      const data = await res.json();
      // Map backend fields to frontend fields
      const mapped = data.map(mapBackendDiscount);
      setDiscounts(mapped);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  // Fetch products from backend API
  // const fetchProducts = async () => {
  //   try {
  //     const res = await fetch("/api/products");
  //     if (!res.ok) throw new Error("Failed to fetch products");
  //     const data = await res.json();
  //     setProducts(data);
  //   } catch (err) {
  //     // Handle error silently or show message
  //   }
  // };

  useEffect(() => {
    fetchDiscounts();
    // fetchProducts();
  }, []);

  const filteredDiscounts = discounts.filter(d => {
    if (filter === 'active') return d.active;
    if (filter === 'expired') return !d.active;
    return true;
  });
  const handleEdit = discount => {
    setEditingDiscount(discount);
    setShowForm(true);
  };

  const handleDelete = async id => {
    if (window.confirm('Bạn có chắc chắn muốn xóa mã này?')) {
      try {
        const res = await fetch(
          `${API_BASE_URL}/admin/discounts/${id}`,
          { method: 'DELETE' }
        );
        if (!res.ok) throw new Error('Failed to delete discount');
        setDiscounts(discounts.filter(d => d.id !== id));
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleSave = async newDiscount => {
    try {
      // Map frontend fields to backend entity fields
      const payload = {
        ...newDiscount,
        discount_value: newDiscount.value,
        discount_type: newDiscount.type,
        start_date: newDiscount.startDate,
        end_date: newDiscount.endDate,
        usage_limit: newDiscount.usage_limit,
        min_order: newDiscount.minOrder,
        name: newDiscount.name,
      };
      delete payload.value;
      delete payload.type;
      delete payload.startDate;
      delete payload.endDate;
      delete payload.minOrder;

      let res;
      if (editingDiscount) {
        res = await fetch(
          `${API_BASE_URL}/admin/discounts/${newDiscount.id}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          }
        );
      } else {
        res = await fetch(`${API_BASE_URL}/admin/discounts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      if (!res.ok) throw new Error('Failed to save discount');
      const savedDiscount = await res.json();
      // Map backend response to frontend fields
      const mappedDiscount = mapBackendDiscount(savedDiscount);
      if (editingDiscount) {
        setDiscounts(
          discounts.map(d => (d.id === mappedDiscount.id ? mappedDiscount : d))
        );
      } else {
        setDiscounts([...discounts, mappedDiscount]);
      }
      setShowForm(false);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <>
      <Header />

      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Quản lý mã giảm giá</h1>
          <button
            onClick={() => {
              setEditingDiscount(null);
              setShowForm(true);
            }}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            + Tạo mã mới
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded ${
              filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1 rounded ${
              filter === 'active' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            Đang hoạt động
          </button>
          <button
            onClick={() => setFilter('expired')}
            className={`px-3 py-1 rounded ${
              filter === 'expired' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            Hết hạn
          </button>
        </div>

        {loading && <p>Đang tải dữ liệu...</p>}
        {error && <p className="text-red-500">{error}</p>}

        <table className="w-full border border-gray-300 rounded">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Tên</th>
              <th className="p-2 border">Mã</th>
              <th className="p-2 border">Mô tả</th>
              <th className="p-2 border">Loại</th>
              <th className="p-2 border">Giá trị</th>
              <th className="p-2 border">Thời gian</th>
              <th className="p-2 border">Giới hạn sử dụng</th>
              <th className="p-2 border">Đơn hàng tối thiểu</th>
              <th className="p-2 border">Đã dùng</th>
              <th className="p-2 border">Trạng thái</th>
              <th className="p-2 border">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredDiscounts.map(d => (
              <tr key={d.id} className="text-center">
                <td className="p-2 border">{d.name}</td>
                <td className="p-2 border">{d.code}</td>
                <td className="p-2 border">{d.description}</td>
                <td className="p-2 border capitalize">{d.type}</td>
                <td className="p-2 border">
                  {d.type === 'percent'
                    ? `${d.value}%`
                    : d.type === 'fixed'
                    ? `${d.value}₫`
                    : 'Miễn phí vận chuyển'}
                </td>
                <td className="p-2 border">
                  {d.startDate} - {d.endDate}
                </td>
                <td className="p-2 border">{d.usage_limit}</td>
                <td className="p-2 border">{d.minOrder}</td>
                <td className="p-2 border">{d.used_count}</td>
                <td className="p-2 border">
                  {d.active ? (
                    <span className="text-green-600 font-semibold">Active</span>
                  ) : (
                    <span className="text-red-500 font-semibold">Hết hạn</span>
                  )}
                </td>
                <td className="p-2 border">
                  <div className="flex justify-center">
                    <button
                      onClick={() => handleEdit(d)}
                      className="px-2 py-1 mr-2 bg-yellow-400 text-white rounded hover:bg-yellow-500"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(d.id)}
                      className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {showForm && (
          <DiscountForm
            discount={editingDiscount}
            onClose={() => setShowForm(false)}
            onSave={handleSave}
          />
        )}
      </div>
    </>
  );
}

function DiscountForm({ discount, onClose, onSave }) {
  const [form, setForm] = React.useState(
    discount || {
      name: '',
      code: '',
      description: '',
      type: 'percent',
      value: 0,
      usage_limit: 1,
      minOrder: null,
      active: true,
      startDate: '',
      endDate: '',
    }
  );

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = e => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex justify-center items-center">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded p-6 w-[400px] space-y-4"
        >
          <h2 className="text-xl font-bold mb-2">
            {discount ? 'Sửa mã giảm giá' : 'Tạo mã mới'}
          </h2>
          <input
            name="name"
            placeholder="Tên"
            value={form.name}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
          <input
            name="code"
            placeholder="Mã"
            value={form.code}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
          <input
            name="description"
            placeholder="Mô tả"
            value={form.description}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="percent">Phần trăm</option>
            <option value="fixed">Cố định</option>
            <option value="free_shipping">Miễn phí vận chuyển</option>
          </select>
          <label className="ml-1">Value:</label>
          <input
            name="value"
            type="number"
            placeholder="Giá trị"
            value={form.value}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
          <input
            name="usage_limit"
            type="number"
            placeholder="Giới hạn sử dụng"
            value={form.usage_limit}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
          <input
            name="minOrder"
            type="number"
            placeholder="Đơn hàng tối thiểu"
            value={form.minOrder || ''}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
          <div className="flex gap-2">
            <input
              name="startDate"
              type="date"
              value={form.startDate}
              onChange={handleChange}
              className="w-1/2 border px-3 py-2 rounded"
            />
            <input
              name="endDate"
              type="date"
              value={form.endDate}
              onChange={handleChange}
              className="w-1/2 border px-3 py-2 rounded"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              name="active"
              type="checkbox"
              checked={form.active}
              onChange={e => setForm({ ...form, active: e.target.checked })}
            />
            <label>Đang hoạt động</label>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Lưu
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
