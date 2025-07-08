import React, { useEffect, useState } from 'react';
import Header from '../components/Header';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const NewsManagement = () => {
  const [newsList, setNewsList] = useState([]);
  const [form, setForm] = useState({
    id: null,
    name: '',
    title: '',
    description: '',
    image: null,
    date: new Date().toISOString().split('T')[0], // default to current date in yyyy-mm-dd format
    author: '',
  });
  const [editing, setEditing] = useState(false);

  const fetchNews = async () => {
    const res = await fetch(API_URL + '/api/news');
    const data = await res.json();
    setNewsList(data);
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleChange = e => {
    if (e.target.name === 'image') {
      setForm({ ...form, image: e.target.files[0] });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('title', form.title);
    formData.append('description', form.description);
    formData.append('date', form.date);
    formData.append('author', form.author);
    if (form.image) {
      formData.append('image', form.image);
    }

    if (editing) {
      await fetch(API_URL + '/api/news/' + form.id, {
        method: 'PUT',
        body: formData,
      });
    } else {
      await fetch(API_URL + '/api/news', {
        method: 'POST',
        body: formData,
      });
    }
                setForm({
                  id: null,
                  name: '',
                  title: '',
                  description: '',
                  image: null,
                  date: new Date().toISOString().split('T')[0],
                  author: '',
                });
                setEditing(false);
    fetchNews();
  };

  const handleEdit = news => {
    setForm({
      id: news.id,
      name: news.name || '',
      title: news.title,
      description: news.description,
      image: null,
      date: news.date,
      author: news.author,
    });
    setEditing(true);
  };

  const handleDelete = async id => {
    if (window.confirm('Are you sure you want to delete this news item?')) {
      await fetch(API_URL + '/api/news/' + id, { method: 'DELETE' });
      fetchNews();
    }
  };

  return (
    <>
      <Header />

      <div className="p-6 bg-gray-100 min-h-screen">
        <h1 className="text-2xl font-bold mb-4">News Management</h1>
        <form
          onSubmit={handleSubmit}
          className="mb-6 bg-white p-4 rounded shadow"
          encType="multipart/form-data"
        >
          <div className="mb-2">
            <label className="block font-semibold">Name News</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div className="mb-2">
            <label className="block font-semibold">Title</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div className="mb-2">
            <label className="block font-semibold">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div className="mb-2">
            <label className="block font-semibold">Image</label>
            <input
              type="file"
              name="image"
              onChange={handleChange}
              required={!editing}
              className="w-full border rounded px-2 py-1"
            />
            {editing && form.image === null && (
              <p className="text-sm text-gray-600 mt-1">
                Leave empty to keep existing image
              </p>
            )}
          </div>
          <div className="flex space-x-4 mb-2">
            <div className="flex-1">
              <label className="block font-semibold">Date</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
                className="w-full border rounded px-2 py-1"
              />
            </div>
            <div className="flex-1">
              <label className="block font-semibold">Author</label>
              <input
                type="text"
                name="author"
                value={form.author}
                onChange={handleChange}
                className="w-full border rounded px-2 py-1"
              />
            </div>
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {editing ? 'Update' : 'Add'} News
          </button>
          {editing && (
            <button
              type="button"
              onClick={() => {
                setForm({
                  id: null,
                  name: '',
                  title: '',
                  description: '',
                  image: null,
                  date: new Date().toISOString().split('T')[0],
                  author: '',
                });
                setEditing(false);
              }}
              className="ml-4 bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              Cancel
            </button>
          )}
        </form>

        <div className="bg-white rounded shadow p-4">
          <h2 className="text-xl font-semibold mb-4">News List</h2>
          <table className="w-full table-auto border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 px-2 py-1">Title</th>
                <th className="border border-gray-300 px-2 py-1">Date</th>
                <th className="border border-gray-300 px-2 py-1">Author</th>
                <th className="border border-gray-300 px-2 py-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {newsList.map(news => (
                <tr key={news.id}>
                  <td className="border border-gray-300 px-2 py-1">
                    {news.title}
                  </td>
                  <td className="border border-gray-300 px-2 py-1">
                    {news.date}
                  </td>
                  <td className="border border-gray-300 px-2 py-1">
                    {news.author}
                  </td>
                  <td className="border border-gray-300 px-2 py-1 space-x-2">
                    <button
                      onClick={() => handleEdit(news)}
                      className="bg-yellow-400 px-2 py-1 rounded hover:bg-yellow-500"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(news.id)}
                      className="bg-red-600 px-2 py-1 rounded text-white hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {newsList.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-4">
                    No news found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default NewsManagement;
