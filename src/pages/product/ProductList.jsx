import React, { useState, useEffect, memo } from 'react';
import { FiEdit, FiTrash2, FiPlus, FiInfo } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import Product from './Product';
import Header from '../../components/Header';

const MemoizedHeader = memo(Header);

const ProductList = () => {
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/product');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddClick = () => {
    setEditProduct(null);
    setShowForm(true);
    navigate('?type=add');
  };

  const handleEditClick = product => {
    setEditProduct(product);
    setShowForm(true);
    navigate(`?type=edit&id=${product.id}`);
  };
  const handleDeleteClick = async product => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:3001/api/product?id=${product.id}`,
        {
          method: 'DELETE',
        }
      );
      if (!response.ok) {
        throw new Error('Failed to delete product');
      }
      // Refresh product list after successful deletion
      fetchProducts();
    } catch (error) {
      alert(error.message || 'Error deleting product');
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditProduct(null);
    navigate('/product');
    fetchProducts();
  };

  return (
    <>
      <div className="w-full">
        <MemoizedHeader />
        <h2 className="font-bold text-2xl my-4">Danh sách sản phẩm</h2>
        {showForm ? (
          <Product product={editProduct} onClose={handleFormClose} />
        ) : loading ? (
          <p>Loading products...</p>
        ) : error ? (
          <p className="text-red-600">Error: {error}</p>
        ) : (
          <div className="overflow-x-auto w-full">
            <button
              onClick={fetchProducts}
              className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Refresh Products
            </button>
            <table className="min-w-full w-full border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Tên SP
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Hình ảnh
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Giá
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Số lượng
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Danh mục
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Best Selling
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Suggestion
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id} className="border-t border-gray-300">
                    <td className="border border-gray-300 px-4 py-2 max-w-xs truncate">
                      {product.name}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-26 h-16 object-cover"
                      />
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
{product.price ? Number(product.price).toLocaleString('vi-VN', { maximumFractionDigits: 0 }) : ''}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {product.quantity}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {product.categoryType}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <select
                        value={product.bestSelling ? 'Yes' : 'No'}
                        onChange={async e => {
                          const newValue = e.target.value === 'Yes';
                          try {
                            const response = await fetch(
                              `http://localhost:3001/api/product?type=edit&id=${product.id}`,
                              {
                                method: 'PUT',
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ bestSelling: newValue }),
                              }
                            );
                            if (!response.ok) {
                              throw new Error('Failed to update bestSelling');
                            }
                            const updatedProduct = await response.json();
                            const updatedProducts = products.map(p =>
                              p.id === product.id ? { ...p, bestSelling: updatedProduct.bestSelling } : p
                            );
                            setProducts(updatedProducts);
                          } catch (error) {
                            alert(error.message || 'Error updating bestSelling');
                          }
                        }}
                        className="border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <select
                        value={product.suggestion ? 'Yes' : 'No'}
                        onChange={async e => {
                          const newValue = e.target.value === 'Yes';
                          try {
                            const response = await fetch(
                              `http://localhost:3001/api/product?type=edit&id=${product.id}`,
                              {
                                method: 'PUT',
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ suggestion: newValue }),
                              }
                            );
                            if (!response.ok) {
                              throw new Error('Failed to update suggestion');
                            }
                            const updatedProduct = await response.json();
                            const updatedProducts = products.map(p =>
                              p.id === product.id ? { ...p, suggestion: updatedProduct.suggestion } : p
                            );
                            setProducts(updatedProducts);
                          } catch (error) {
                            alert(error.message || 'Error updating suggestion');
                          }
                        }}
                        className="border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </td>
                    <td className="border border-gray-300 px-4 py-2 space-x-2">
                      <button
                        onClick={() => handleEditClick(product)}
                        className="text-[#fa8c16] hover:text-orange-700 cursor-pointer mr-4"
                        title="Edit"
                      >
                        <FiEdit />
                      </button>
                      <button
                        onClick={handleAddClick}
                        className="text-green-600 hover:text-green-800 cursor-pointer mr-4"
                        title="Add Product"
                      >
                        <FiPlus />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(product)}
                        className="text-[#f5222d] hover:text-red-700 cursor-pointer mr-4"
                        title="Delete"
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};
export default ProductList;
