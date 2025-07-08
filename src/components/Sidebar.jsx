import { Link, NavLink } from 'react-router-dom';
import {
  FiBox,
  FiUser,
  FiShoppingCart,
  FiGrid,
  FiSettings,
  FiFileText,
} from 'react-icons/fi';

function Sidebar() {
  const navItems = [
    { id: 1, name: 'Dashboard', link: '/', icon: <FiGrid /> },
    { id: 2, name: 'Sản phẩm', link: 'product', icon: <FiBox /> },
    // { id: 3, name: 'Đơn hàng', link: 'order', icon: <FiShoppingCart /> },
    { id: 4, name: 'Người dùng', link: 'user', icon: <FiUser /> },
    { id: 5, name: 'News', link: 'news', icon: <FiFileText /> },
    // { name: 'Cài đặt', icon: <FiSettings /> },
  ];

  return (
    <>
      <div className="fixed">
        <div className="flex min-h-screen w-full bg-gray-100 flex-1">
          {/* Sidebar */}
          <aside className="w-64 bg-green-600 text-white p-4 space-y-6 h-screen overflow-y-auto">
            <h2 className="text-2xl font-bold">SUKIMOKO</h2>
            <ul className="space-y-2">
              {navItems.map(item => (
                <NavLink
                  key={item.id}
                  to={item.link}
                  className={({ isActive }) =>
                    [
                      'flex items-center space-x-2 p-2 mb-0 rounded cursor-pointer transition hover:bg-green-500',
                      isActive ? 'bg-green-500 text-white' : '',
                    ].join(' ')
                  }
                >
                  <span className="mr-2">{item.icon}</span>
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
