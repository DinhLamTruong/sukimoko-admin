import { useState } from 'react';
import {
  FiBox,
  FiUser,
  FiShoppingCart,
  FiGrid,
  FiSettings,
} from 'react-icons/fi';

const navItems = [
  { name: 'Dashboard', icon: <FiGrid /> },
  { name: 'Sản phẩm', icon: <FiBox /> },
  { name: 'Đơn hàng', icon: <FiShoppingCart /> },
  { name: 'Người dùng', icon: <FiUser /> },
  // { name: 'Cài đặt', icon: <FiSettings /> },
];

function Main() {
  const [active, setActive] = useState('Dashboard');

  return (
    <>
      <div className="flex h-screen w-full bg-gray-100">
        {/* Main */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Header */}
          <header className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">{active}</h1>
            <div className="flex items-center space-x-4">
              <span>Admin</span>
              <img
                src="https://khangiaysukimoko.com/img/More/header_img.png"
                className="w-8 h-8 rounded-full border"
              />
            </div>
          </header>

          {/* Content */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-4 rounded-xl shadow">
              📦 Tổng sản phẩm: 24
            </div>
            <div className="bg-white p-4 rounded-xl shadow">
              💰 Doanh thu hôm nay
            </div>
            <div className="bg-white p-4 rounded-xl shadow">
              🛒 Đơn hàng mới
            </div>
          </section>
        </main>
      </div>
    </>
  );
}

export default Main;
