// import { useState } from 'react';
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DefaultLayout from './layout/DefaultLayout';
import Login from './components/Login';

import Home from './pages/Home';
import Order from './pages/Order';
import User from './pages/User';

import './App.css';
import NewsManagement from './pages/NewsManagement';
import ProductList from './pages/product/ProductList';
import Contact from './pages/Contact';
import DiscountAdmin from './pages/Discounts';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Example check for login status, e.g., token in localStorage
    const token = localStorage.getItem('token_sk');
    setIsLoggedIn(!!token);
    setLoading(false);
  }, []);

  if (loading) {
    return null; // or a loading spinner component
  }
  if (!isLoggedIn) {
    return <Login />;
  }

  return (
    <>
      <BrowserRouter>
        <DefaultLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/user" element={<User />} />
            <Route path="/product" element={<ProductList />} />
            <Route path="/news" element={<NewsManagement />} />
            <Route path="/orders" element={<Order />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/discounts" element={<DiscountAdmin />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </DefaultLayout>
      </BrowserRouter>
    </>
  );
}

export default App;
