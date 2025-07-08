import React, { useState, useRef, useEffect, memo } from 'react';
import { fetchWithAuth } from '../utils/fetchWithAuth';

function Header() {
  const [currentUser, setCurrentUser] = useState(null);
  const [showLogout, setShowLogout] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const apiBaseUrl = 'http://localhost:3001';
        const res = await fetchWithAuth(`${apiBaseUrl}/api/user/profile`, {
          method: 'GET',
        });
        if (!res || !res.ok) {
          throw new Error(
            `Failed to fetch current user: ${res ? res.status : 'No response'}`
          );
        }
        const userData = await res.json();
        setCurrentUser(userData);
      } catch (err) {
        console.error('Failed to fetch current user', err);
        setCurrentUser(null);
      }
    };

    fetchCurrentUser();
  }, []);

  // useEffect(() => {
  //   if (currentUser === null) {
  //     // Redirect to admin login page if currentUser is null
  //     window.location.href = '/login'; // Adjust path if needed
  //   }
  // }, [currentUser]);

  const showMenu = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setShowLogout(true);
  };

  const hideMenu = () => {
    timeoutRef.current = setTimeout(() => {
      setShowLogout(false);
    }, 200);
  };

  const toggleLogout = () => {
    setShowLogout(prev => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem('token_sk');
    // Redirect to login page or update UI accordingly
    window.location.href = '/login'; // Adjust path as needed
  };
  // console.log(currentUser);

  return (
    <>
      <div className="flex items-center justify-end my-4 space-x-4 mb-14">
        <span>{currentUser?.name || 'Admin'}</span>
        <div
          className="relative"
          onMouseEnter={showMenu}
          onMouseLeave={hideMenu}
        >
          <img
            src={
              currentUser?.avatar ||
              'https://khangiaysukimoko.com/img/More/header_img.png'
            }
            className="w-8 h-8 rounded-full border cursor-pointer"
            onClick={toggleLogout}
            alt="User Avatar"
          />
          {showLogout && (
            <div
              className="absolute right-0 mt-2 w-56 bg-white border rounded shadow-lg z-10 p-4"
              onMouseEnter={showMenu}
              onMouseLeave={hideMenu}
            >
              <div className="flex items-center space-x-4 mb-4">
                <img
                  src={
                    currentUser?.avatar ||
                    'https://khangiaysukimoko.com/img/More/header_img.png'
                  }
                  alt="User Avatar"
                  className="w-12 h-12 rounded-full border"
                />
                <div>
                  <p className="font-semibold text-gray-900">
                    {currentUser?.name || ''}
                  </p>
                  <p className="text-sm text-gray-600">
                    {currentUser?.email || ''}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full bg-red-600 cursor-pointer text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default memo(Header);
