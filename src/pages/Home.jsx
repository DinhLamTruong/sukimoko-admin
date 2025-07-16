import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();
  const [productCount, setProductCount] = useState(null);
  const [totalRevenue, setTotalRevenue] = useState(null);
  const [totalRevenueToday, setTotalRevenueToday] = useState(null);

  useEffect(() => {
    // Fetch product count
    fetch('http://localhost:3001/api/dashboard/product-count', {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        if (data.totalProductTypes !== undefined) {
          setProductCount(data.totalProductTypes);
        }
      })
      .catch(err => {
        console.error('Failed to fetch product count:', err);
      });

    // Fetch total revenue
    fetch('http://localhost:3001/api/dashboard/total-revenue', {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        if (data.totalRevenue !== undefined) {
          setTotalRevenue(data.totalRevenue);
        }
      })
      .catch(err => {
        console.error('Failed to fetch total revenue:', err);
      });
    // /dashboard
    // Fetch total revenue today
    fetch('http://localhost:3001/api/dashboard/total-revenue-today', {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        if (data.totalRevenueToday !== undefined) {
          setTotalRevenueToday(data.totalRevenueToday);
        }
      })
      .catch(err => {
        console.error('Failed to fetch total revenue today:', err);
      });
  }, []);

  return (
    <>
      <div className="flex h-screen w-full bg-gray-100">
        {/* Main */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Header */}
          <Header />

          {/* Content */}
          <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div
              className="bg-white p-4 rounded-xl shadow cursor-pointer hover:bg-gray-200"
              onClick={() => navigate('/product')}
            >
              📦 Quản lý sản phẩm{' '}
              {productCount !== null ? `: ${productCount}` + ' sản phẩm' : ''}
            </div>
            <div className="bg-white p-4 rounded-xl shadow">
              💰 Tổng doanh thu{' '}
              {totalRevenue !== null
                ? `: ${totalRevenue.toLocaleString() + 'đ'}`
                : ''}
            </div>
            <div className="bg-white p-4 rounded-xl shadow">
              💰 Doanh thu hôm nay{' '}
              {totalRevenueToday !== null
                ? `: ${totalRevenueToday.toLocaleString()}`
                : ': 0đ'}
            </div>
            <div
              className="bg-white p-4 rounded-xl shadow cursor-pointer hover:bg-gray-200"
              onClick={() => {
                // Navigate to Order page with query param to show orders with status Pending
                window.location.href = '/orders?status=Pending';
              }}
            >
              🛒 Đơn hàng mới
            </div>
          </section>
        </main>
      </div>
    </>
  );
}

export default Home;
