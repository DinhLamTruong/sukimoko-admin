import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Email không hợp lệ')
    .required('Vui lòng nhập email'),
  password: Yup.string()
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .required('Vui lòng nhập mật khẩu'),
});

const Login = () => {
  const handleSubmit = (values, { setSubmitting }) => {
    fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: values.email, password: values.password }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.access_token) {
          // Save JWT token to localStorage
          localStorage.setItem('token_sk', data.access_token);
          alert('Đăng nhập thành công!');
          // TODO: Add logic to redirect or update UI after login
          window.location.href = '/';
        } else {
          alert('Đăng nhập thất bại: ' + (data.message || 'Unknown error'));
        }
        setSubmitting(false);
      })
      .catch(error => {
        alert('Lỗi mạng hoặc server: ' + error.message);
        setSubmitting(false);
      });

    console.log('Login submitted:', values);
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow">
      <h2 className="text-2xl font-semibold mb-6 text-center">
        Đăng nhập Admin Sukimoko
      </h2>
      <Formik
        initialValues={{ email: '', password: '' }}
        validationSchema={LoginSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form>
            <div className="mb-4">
              <label htmlFor="email" className="block mb-1 font-medium">
                Email
              </label>
              <Field
                type="email"
                name="email"
                id="email"
                className="w-full border p-2 rounded"
                placeholder="Nhập email"
              />
              <ErrorMessage
                name="email"
                component="div"
                className="text-red-600 mt-1"
              />
            </div>
            <div className="mb-6">
              <label htmlFor="password" className="block mb-1 font-medium">
                Mật khẩu
              </label>
              <Field
                type="password"
                name="password"
                id="password"
                className="w-full border p-2 rounded"
                placeholder="Nhập mật khẩu"
              />
              <ErrorMessage
                name="password"
                component="div"
                className="text-red-600 mt-1"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            >
              Đăng nhập
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default Login;
