import React, { useState, useEffect } from 'react';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const Contact = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/contact`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setContacts(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch contacts');
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  if (loading) {
    return <div className="max-w-7xl mx-auto p-5">Loading contacts...</div>;
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-5 text-red-600">Error: {error}</div>
    );
  }

  const handleDelete = id => {
    const isDelete = confirm('Are you sure you want to delete this contact?');
    if (isDelete) {
      fetch(`${API_BASE_URL}/contact/${id}`, {
        method: 'DELETE',
      }).then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        if (response.ok) {
          setContacts(contacts.filter(contact => contact.id !== id));
        }
      });
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-5">
      <h2 className="text-xl font-semibold mb-4">
        Danh sách liên hệ từ người dùng
      </h2>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-black">
            <th className="text-left px-4 py-2 whitespace-nowrap">Họ và tên</th>
            <th className="text-left px-4 py-2">Email</th>
            <th className="text-left px-4 py-2">Điện thoại</th>
            <th className="text-left px-4 py-2">Nội dung</th>
            <th className="text-left px-4 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map(({ id, name, email, phone, message }) => (
            <tr key={id} className="border-b border-gray-300">
              <td className="px-4 py-2 whitespace-nowrap">{name}</td>
              <td className="px-4 py-2">{email}</td>
              <td className="px-4 py-2">{phone}</td>
              <td className="px-4 py-2">{message}</td>
              <td className="px-4 py-2">
                <button
                  className="bg-red-500 text-white px-3 py-1 rounded cursor-pointer hover:bg-red-600"
                  onClick={() => {
                    handleDelete(id);
                  }}
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Contact;
