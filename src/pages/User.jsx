import { useEffect, useState } from 'react';

import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Header from '../components/Header';

// Helper function to decode JWT token payload
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Failed to parse JWT token', e);
    return null;
  }
}

const PasswordSchema = Yup.object().shape({
  currentPassword: Yup.string()
    .min(6, 'Mật khẩu hiện tại phải có ít nhất 6 ký tự')
    .required('Vui lòng nhập mật khẩu hiện tại'),
  password: Yup.string()
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .required('Vui lòng nhập mật khẩu mới'),
});

const CreateUserSchema = Yup.object().shape({
  username: Yup.string().required('Vui lòng nhập tên'),
  email: Yup.string()
    .email('Email không hợp lệ')
    .required('Vui lòng nhập email'),
  role: Yup.string().required('Vui lòng nhập vai trò'),
  password: Yup.string()
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .required('Vui lòng nhập mật khẩu'),
});

function User() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchUsers();
    // Decode token and set currentUser
    const token = localStorage.getItem('token_sk');
    if (token) {
      const user = parseJwt(token);
      setCurrentUser(user);
    }
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token_sk');
      if (!token) {
        throw new Error('No authentication token found');
      }
      const res = await fetch('http://localhost:3001/api/user', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) {
        throw new Error(
          `Failed to fetch users: ${res.status} ${res.statusText}`
        );
      }
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users', err);
      setUsers([]);
    }
  };

  const handlePasswordChange = async (values, { setSubmitting }) => {
    try {
      const token = localStorage.getItem('token_sk');
      if (!token) {
        throw new Error('No authentication token found');
      }
      const res = await fetch(
        `http://localhost:3001/api/user/change-password`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            currentPassword: values.currentPassword,
            newPassword: values.password,
          }),
        }
      );
      if (!res.ok) {
        throw new Error('Failed to update password');
      }
      alert('Password updated');
      setShowModal(false);
      setSelectedUser(null);
    } catch (err) {
      console.error('Failed to update password', err);
      alert('Failed to update password');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateUser = async (values, { setSubmitting }) => {
    try {
      const token = localStorage.getItem('token_sk');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Send user data without avatar
      const userData = { ...values };
      delete userData.image;

      const res = await fetch('http://localhost:3001/api/user/register', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      if (!res.ok) {
        throw new Error('Failed to create user');
      }
      const data = await res.json();

      // If avatar file selected, upload it
      if (selectedAvatarFile) {
        const formData = new FormData();
        formData.append('file', selectedAvatarFile);
        const uploadResponse = await fetch(
          `http://localhost:3001/api/user/upload-avatar`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );
        if (!uploadResponse.ok) {
          throw new Error('Failed to upload avatar');
        }
      }

      alert('User created successfully');
      setShowCreateModal(false);
      fetchUsers();
    } catch (err) {
      console.error('Failed to create user', err);
      alert('Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async userId => {
    const choice = window.confirm('Are you sure you want to delete this user?');
    if (!choice) {
      return;
    }
    try {
      const token = localStorage.getItem('token_sk');
      if (!token) {
        throw new Error('No authentication token found');
      }
      const res = await fetch(`http://localhost:3001/api/user`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: userId }),
      });
      if (!res.ok) {
        throw new Error(
          `Failed to delete user: ${res.status} ${res.statusText}`
        );
      }
      alert('User deleted successfully');
      fetchUsers();
    } catch (err) {
      console.error('Failed to delete user', err);
      alert('Failed to delete user');
    }
  };
  console.log(currentUser);

  return (
    <div className="p-6 w-full">
      <Header />
      <h2 className="text-xl font-semibold mb-4">User Management</h2>
      <button
        className="mb-4 px-4 py-2 bg-green-600 text-white rounded"
        onClick={() => setShowCreateModal(true)}
      >
        Tạo người dùng mới
      </button>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Email</th>
            <th className="p-2 text-left">Role</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.userId} className="border-t">
              <td className="p-2">{user.username || user.email}</td>
              <td className="p-2">{user.email}</td>
              <td className="p-2">{user.role}</td>
              <td className="p-2 text-center">
                <div className="flex justify-end space-x-2">
                  {/* currentUser?.id === user.id check removed because currentUser is no longer in this component */}
                  {user.email === currentUser?.email && (
                    <button
                      className="bg-blue-500 cursor-pointer text-white px-3 py-1 rounded"
                      onClick={() => {
                        setSelectedUser(user);
                        setShowModal(true);
                      }}
                    >
                      Đổi mật khẩu
                    </button>
                  )}
                  <button
                    className="bg-red-500 cursor-pointer text-white px-3 py-1 rounded ml-4"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    Xóa người dùng
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black/70 bg-opacity-30 flex items-start justify-center z-50">
          <div className="bg-white p-6 mt-[10%] rounded shadow-md w-96">
            <h3 className="text-lg font-medium mb-4">
              Đổi mật khẩu cho {selectedUser.username || selectedUser.email}
            </h3>
            <Formik
              initialValues={{ currentPassword: '', password: '' }}
              validationSchema={PasswordSchema}
              onSubmit={handlePasswordChange}
            >
              {({ isSubmitting }) => (
                <Form>
                  <label
                    htmlFor="currentPassword"
                    className="block mb-1 font-medium"
                  >
                    Mật khẩu hiện tại
                  </label>
                  <Field
                    type="password"
                    name="currentPassword"
                    className="w-full border p-2 mb-4"
                    placeholder="Mật khẩu hiện tại"
                  />
                  <ErrorMessage
                    name="currentPassword"
                    component="div"
                    className="text-red-600 mb-4"
                  />
                  <label htmlFor="password" className="block mb-1 font-medium">
                    Mật khẩu mới
                  </label>
                  <Field
                    type="password"
                    name="password"
                    className="w-full border p-2 mb-4"
                    placeholder="Mật khẩu mới"
                  />
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="text-red-600 mb-4"
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      className="px-4 py-2 bg-gray-300 rounded"
                      onClick={() => {
                        setShowModal(false);
                        setSelectedUser(null);
                      }}
                      disabled={isSubmitting}
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-600 text-white rounded"
                      disabled={isSubmitting}
                    >
                      Cập nhật
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 bg-opacity-30 flex items-start justify-center z-50">
          <div className="bg-white p-6 mt-[4%] rounded shadow-md w-96">
            <h3 className="text-lg font-medium mb-4">Tạo người dùng mới</h3>
            <Formik
              initialValues={{
                username: '',
                email: '',
                role: '',
                password: '',
                image: '',
              }}
              validationSchema={CreateUserSchema}
              onSubmit={handleCreateUser}
            >
              {({ isSubmitting, setFieldValue }) => (
                <Form>
                  <label htmlFor="username" className="block mb-1 font-medium">
                    Tên
                  </label>
                  <Field
                    type="text"
                    name="username"
                    className="w-full border p-2 mb-2"
                    placeholder="Tên"
                  />
                  <ErrorMessage
                    name="username"
                    component="div"
                    className="text-red-600 mb-2"
                  />

                  <label htmlFor="email" className="block mb-1 font-medium">
                    Email
                  </label>
                  <Field
                    type="email"
                    name="email"
                    className="w-full border p-2 mb-2"
                    placeholder="Email"
                  />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="text-red-600 mb-2"
                  />

                  <label htmlFor="image" className="block mb-1 font-medium">
                    Avatar
                  </label>
                  <input
                    type="file"
                    name="image"
                    className="w-full border p-2 mb-2"
                    accept="image/*"
                    onChange={event => {
                      const file = event.currentTarget.files?.[0] || null;
                      setSelectedAvatarFile(file);
                      if (file) {
                        setFieldValue('image', file.name);
                      } else {
                        setFieldValue('image', '');
                      }
                    }}
                  />
                  <ErrorMessage
                    name="image"
                    component="div"
                    className="text-red-600 mb-2"
                  />

                  <label htmlFor="role" className="block mb-1 font-medium">
                    Vai trò
                  </label>
                  <Field
                    type="text"
                    name="role"
                    className="w-full border p-2 mb-2"
                    placeholder="Vai trò"
                  />
                  <ErrorMessage
                    name="role"
                    component="div"
                    className="text-red-600 mb-2"
                  />

                  <label htmlFor="password" className="block mb-1 font-medium">
                    Mật khẩu
                  </label>
                  <Field
                    type="password"
                    name="password"
                    className="w-full border p-2 mb-4"
                    placeholder="Mật khẩu"
                  />
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="text-red-600 mb-4"
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      className="px-4 py-2 bg-gray-300 rounded"
                      onClick={() => {
                        setShowCreateModal(false);
                      }}
                      disabled={isSubmitting}
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-600 text-white rounded"
                      disabled={isSubmitting}
                    >
                      Tạo
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      )}
    </div>
  );
}
export default User;
