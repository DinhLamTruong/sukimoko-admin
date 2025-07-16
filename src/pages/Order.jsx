import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { fetchWithAuth } from '../utils/fetchWithAuth';

const ORDER_STATUSES = [
  'Pending',
  'Processing',
  'Shipped',
  'Delivered',
  'Cancelled',
];

const PAYMENT_STATUSES = ['Pending', 'Paid', 'Failed', 'Refunded'];

function Order() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  // Fetch orders from backend API
  const fetchOrders = async fetchLatestFlag => {
    setLoading(true);
    setError(null);
    try {
      let url = 'http://localhost:3001/api/order';
      const params = new URLSearchParams(window.location.search);
      if (fetchLatestFlag) {
        url = `http://localhost:3001/api/order/latest`;
      } else if (params.get('status')) {
        url = `http://localhost:3001/api/order/status/${params.get('status')}`;
      }
      const response = await fetchWithAuth(url);
      if (!response || !response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const data = await response.json();
      // console.log(data);
      if (fetchLatestFlag) {
        // If data is array, set directly, else wrap in array
        if (Array.isArray(data)) {
          setOrders(data);
        } else {
          setOrders(data ? [data] : []);
        }
      } else {
        setOrders(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(false);
  }, []);

  // Handle order status update
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await fetchWithAuth(
        `http://localhost:3001/api/order/${orderId}`,
        {
          method: 'PUT',
          body: JSON.stringify({ status: newStatus }),
        }
      );
      if (!response || !response.ok) {
        throw new Error('Failed to update order status');
      }
      // Update local state
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      alert(err.message);
    }
  };

  // Handle fetch latest orders button click
  const handleFetchLatestClick = () => {
    // Update URL to /orders?status=Pending
    const newUrl =
      window.location.origin + window.location.pathname + '?status=Pending';
    window.history.pushState({ path: newUrl }, '', newUrl);

    fetchOrders(true);
  };

  // Handle fetch all orders (reset)
  const handleFetchAllClick = () => {
    // Update URL to /orders (no query params)
    const newUrl = window.location.origin + window.location.pathname;
    window.history.pushState({ path: newUrl }, '', newUrl);

    fetchOrders(false);
  };

  // Handle View Products click - fetch order details and open modal
  const handleViewProductsClick = async orderId => {
    try {
      const response = await fetchWithAuth(
        `http://localhost:3001/api/order/${orderId}`
      );
      if (!response || !response.ok) {
        throw new Error('Failed to fetch order details');
      }
      const data = await response.json();
      setSelectedOrderDetails(data);
      setModalOpen(true);
    } catch (err) {
      alert(err.message);
    }
  };

  // Close modal
  const closeModal = () => {
    setModalOpen(false);
    setSelectedOrderDetails(null);
  };

  return (
    <>
      <div className="flex h-screen w-full bg-gray-100">
        {/* Main */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Header */}
          <Header />

          {/* Content */}
          <section className="mt-6">
            <h1 className="text-2xl font-semibold mb-4">Quản lý đơn hàng</h1>

            {/* Buttons */}
            <div className="mb-4 flex items-center space-x-2">
              <button
                onClick={handleFetchLatestClick}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Xem đơn hàng mới nhất
              </button>
              <button
                onClick={handleFetchAllClick}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
              >
                Xem tất cả đơn hàng
              </button>
            </div>

            {loading && <p>Loading orders...</p>}
            {error && <p className="text-red-500">Error: {error}</p>}

            {!loading && !error && orders.length === 0 && (
              <p>Không có đơn hàng nào.</p>
            )}

            {!loading && !error && orders.length > 0 && (
              <>
                <table className="min-w-full bg-white rounded shadow overflow-hidden">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="text-left px-4 py-2">Order ID</th>
                      <th className="text-left px-4 py-2">Customer</th>
                      <th className="text-left px-4 py-2">Date</th>
                      <th className="text-left px-4 py-2">Phone</th>
                      <th className="text-left px-4 py-2">Address</th>
                      <th className="text-left px-4 py-2">Note</th>
                      <th className="text-left px-4 py-2">Discount Code</th>
                      <th className="text-left px-4 py-2">Shipping Method</th>
                      <th className="text-left px-4 py-2">Total Price</th>
                      <th className="text-left px-4 py-2">Status</th>
                      <th className="text-left px-4 py-2">Payment</th>
                      <th className="text-left px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.id} className="border-t">
                        <td className="px-4 py-2">{order.id}</td>
                        <td className="px-4 py-2">
                          {order.user?.fullName ||
                            order.fullName ||
                            order.customerEmail ||
                            'N/A'}
                        </td>
                        <td className="px-4 py-2">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2">{order.phone || 'N/A'}</td>
                        <td className="px-4 py-2">
                          {order.address || 'N/A'}
                          <br />
                          <small className="text-gray-600">
                            {order.province && <span>{order.province}</span>}
                            {order.district && <span>, {order.district}</span>}
                            {order.ward && <span>, {order.ward}</span>}
                          </small>
                        </td>
                        <td className="px-4 py-2">{order.note || 'N/A'}</td>
                        <td className="px-4 py-2">{order.discountCode || 'N/A'}</td>
                        <td className="px-4 py-2">{order.shippingMethod || 'N/A'}</td>

                        <td className="px-4 py-2">
                          {Number(order.totalPrice)?.toLocaleString('vi-VN')}₫
                        </td>
                        <td className="px-4 py-2">
                          <select
                            value={order.status}
                            onChange={e =>
                              handleStatusChange(order.id, e.target.value)
                            }
                            className="border rounded px-2 py-1"
                          >
                            {ORDER_STATUSES.map(status => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-2">
                          <select
                            value={order.paymentStatus || 'Pending'}
                            onChange={async e => {
                              const newPaymentStatus = e.target.value;
                              try {
                                const response = await fetch(
                                  `http://localhost:3001/api/order/${order.id}/payment-status`,
                                  {
                                    method: 'PATCH',
                                    headers: {
                                      'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                      paymentStatus: newPaymentStatus,
                                    }),
                                  }
                                );
                                if (!response.ok) {
                                  throw new Error(
                                    'Failed to update payment status'
                                  );
                                }
                                setOrders(prevOrders =>
                                  prevOrders.map(o =>
                                    o.id === order.id
                                      ? {
                                          ...o,
                                          paymentStatus: newPaymentStatus,
                                        }
                                      : o
                                  )
                                );
                              } catch (err) {
                                alert(err.message);
                              }
                            }}
                            className="border rounded px-2 py-1"
                          >
                            {PAYMENT_STATUSES.map(status => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-2">
                          {/* Removed Update button */}
                          <button
                            onClick={() => handleViewProductsClick(order.id)}
                            className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                          >
                            View Products
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Modal */}
                {modalOpen && selectedOrderDetails && (
                  <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-start pt-[10%] justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-5xl w-full max-h-[80vh] overflow-y-auto relative">
                      <button
                        onClick={closeModal}
                        className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
                        aria-label="Close modal"
                      >
                        &#x2715;
                      </button>
                      <h2 className="text-xl font-semibold mb-4">
                        Order Details (ID: {selectedOrderDetails.id})
                      </h2>
                      <p className="mb-1">
                        <strong>Customer:</strong>{' '}
                        {selectedOrderDetails.user?.name ||
                          selectedOrderDetails.fullName ||
                          selectedOrderDetails.customerEmail ||
                          'N/A'}
                      </p>
                      <p className="mb-1">
                        <strong>Status:</strong> {selectedOrderDetails.status}
                      </p>
                      <p className="mb-4">
                        <strong>Date:</strong>{' '}
                        {new Date(
                          selectedOrderDetails.createdAt
                        ).toLocaleDateString()}
                      </p>
                      <h3 className="mt-4 font-semibold mb-2">Products:</h3>
                      {selectedOrderDetails.items &&
                      selectedOrderDetails.items.length > 0 ? (
                        <table className="w-full border-collapse border border-gray-300">
                          <thead>
                            <tr>
                              <th className="border border-gray-300 px-2 py-1 text-left">
                                Product ID
                              </th>
                              <th className="border border-gray-300 px-2 py-1 text-left">
                                Product Image
                              </th>
                              <th className="border border-gray-300 px-2 py-1 text-left">
                                Description
                              </th>
                              <th className="border border-gray-300 px-2 py-1 text-left">
                                Quantity
                              </th>
                              <th className="border border-gray-300 px-2 py-1 text-left">
                                Price
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedOrderDetails.items.map(item => (
                              <tr key={item.id}>
                                <td className="border border-gray-300 px-2 py-1 w-16 align-middle text-left">
                                  {item.id}
                                </td>
                                <td className="border border-gray-300 px-2 py-1 w-40 align-middle text-left">
                                  {item.imageUrl && (
                                    <img
                                      // src={`http://localhost:3001/uploads/product/${item.img}`}
                                      src={item.imageUrl}
                                      alt={item.description || 'Product image'}
                                      className="w-30 h-30 object-cover rounded"
                                    />
                                  )}
                                </td>
                                <td className="border border-gray-300 px-2 py-1 align-middle text-left">
                                  <span>
                                    {item.description ||
                                      item.productName ||
                                      'Unnamed product'}
                                  </span>
                                </td>
                                <td className="border border-gray-300 px-2 py-1 w-16 text-center align-middle">
                                  {item.quantity}
                                </td>
                                <td className="border border-gray-300 px-2 py-1 w-24 text-right align-middle">
                                  {Number(item.price)?.toLocaleString('vi-VN')}₫
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p>No products found for this order.</p>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        </main>
      </div>
    </>
  );
}

export default Order;
