import { useFormik, Form, Field, ErrorMessage, FormikProvider } from 'formik';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import * as Yup from 'yup';

const Product = ({ onCancel, onClose, product }) => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type');
  const id = searchParams.get('id');
  console.log(product);

  const [selectedFile, setSelectedFile] = useState(null);

  const formik = useFormik({
    initialValues: {
      product:
        type === 'add' || !product
          ? {
              name: '',
              categoryType: '',
              description: '',
              quantity: 0,
              price: 0,
              imageUrl: '',
              bestSelling: false,
              suggestion: false,
            }
          : product,
    },
    validationSchema: Yup.object({
      product: Yup.object().shape({
        name: Yup.string().required('Name product is required'),
        categoryType: Yup.string().required('Category type is required'),
        description: Yup.string().required('Description is required'),
        price: Yup.number()
          .required('Price is required')
          .positive('Price must be positive'),
        quantity: Yup.number()
          .required('Quantity is required')
          .integer('Quantity must be an integer')
          .min(0, 'Quantity cannot be negative'),
        imageUrl: Yup.mixed().required('Image is required'),
        bestSelling: Yup.boolean(),
        suggestion: Yup.boolean(),
      }),
    }),
    onSubmit: async values => {
      if (type === 'add') {
        await handleAddProduct(values);
      } else {
        await handleUpdateProduct(values);
      }
    },
  });

  const handleAddProduct = async values => {
    try {
      // Send product data without imageUrl
      const productData = { ...values.product };
      delete productData.imageUrl;

      const response = await fetch(
        `http://localhost:3001/api/product?type=${type}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productData),
        }
      );
      if (!response.ok) {
        throw new Error('Failed to add product');
      }
      const data = await response.json();

      // If image file selected, upload it
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        const uploadResponse = await fetch(
          `http://localhost:3001/api/product/upload-image?id=${data.id}`,
          {
            method: 'POST',
            body: formData,
          }
        );
        if (!uploadResponse.ok) {
          throw new Error('Failed to upload product image');
        }
      }

      if (typeof onClose === 'function') {
        onClose();
      }
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const handleUpdateProduct = async values => {
    try {
      // Send product data without imageUrl
      const productData = { ...values.product };
      delete productData.imageUrl;

      const response = await fetch(
        `http://localhost:3001/api/product?type=${type}&id=${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productData),
        }
      );
      if (!response.ok) {
        throw new Error('Failed to update product');
      }
      await response.json();

      // If image file selected, upload it
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        const uploadResponse = await fetch(
          `http://localhost:3001/api/product/upload-image?id=${id}`,
          {
            method: 'POST',
            body: formData,
          }
        );
        if (!uploadResponse.ok) {
          throw new Error('Failed to upload product image');
        }
      }

      if (typeof onClose === 'function') {
        onClose();
      }
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  return (
    <>
      <form onSubmit={formik.handleSubmit} className="w-full max-w-6xl mx-auto">
        <FormikProvider value={formik}>
          <div className="p-6 mb-2 mt-2 mx-auto bg-white rounded-xl shadow-md space-y-4">
            {/* Image Product */}
            <label className="block text-gray-700 font-bold">
              Image product
            </label>
            <input
              type="file"
              name="product.imageUrl"
              accept="image/*"
              onChange={event => {
                const file = event.currentTarget.files?.[0] || null;
                setSelectedFile(file);
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    formik.setFieldValue('product.imageUrl', reader.result);
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <ErrorMessage
              name="product.imageUrl"
              component="div"
              className="text-red-500 text-sm"
            />
            {formik.values?.product?.imageUrl && (
              <img
                src={formik.values?.product?.imageUrl}
                alt="Preview Product"
                className="mt-2 max-h-40 rounded-md"
              />
            )}

            {/* Name Product */}
            <label className="block text-gray-700 font-bold">
              Name Product
            </label>
            <input
              type="text"
              name="product.name"
              placeholder="Enter name"
              value={formik.values?.product?.name}
              onChange={formik.handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <ErrorMessage
              name="product.name"
              component="div"
              className="text-red-500 text-sm"
            />

            {/* Category Type */}
            <label className="block text-gray-700 font-bold">
              Category Type
            </label>
            <input
              type="text"
              name="product.categoryType"
              placeholder="Enter category type"
              value={formik.values?.product?.categoryType}
              onChange={formik.handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <ErrorMessage
              name="product.categoryType"
              component="div"
              className="text-red-500 text-sm"
            />

            {/* Price, Quantity, Best Selling, Suggestion all in one row */}
            <div className="flex space-x-4 mb-2 mt-2 items-center">
              <div className="w-1/4">
                <label className="block text-gray-700 font-bold">Price</label>
                <input
                  type="text"
                  name="product.price"
                  placeholder="Enter price"
                  value={
                    formik.values?.product?.price
                      ? new Intl.NumberFormat('vi-VN', {
                          maximumFractionDigits: 0,
                        }).format(formik.values.product.price)
                      : ''
                  }
                  onChange={e => {
                    // Remove all non-digit characters
                    const numericValue = e.target.value.replace(/[^0-9]/g, '');
                    const intValue = numericValue
                      ? parseInt(numericValue, 10)
                      : 0;
                    formik.setFieldValue('product.price', intValue);
                  }}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <ErrorMessage
                  name="product.price"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>
              <div className="w-1/4">
                <label className="block text-gray-700 font-bold">
                  Quantity
                </label>
                <input
                  min={0}
                  type="number"
                  name="product.quantity"
                  placeholder="Enter quantity"
                  value={formik.values?.product?.quantity}
                  onChange={formik.handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <ErrorMessage
                  name="product.quantity"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>
              <div className="w-1/4">
                <label className="block text-gray-700 font-bold">
                  Best Selling
                </label>
                <select
                  name="product.bestSelling"
                  value={formik.values.product.bestSelling ? 'Yes' : 'No'}
                  onChange={e => {
                    const newValue = e.target.value === 'Yes';
                    formik.setFieldValue('product.bestSelling', newValue);
                  }}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div className="w-1/4">
                <label className="block text-gray-700 font-bold">
                  Suggestion
                </label>
                <select
                  name="product.suggestion"
                  value={formik.values.product.suggestion ? 'Yes' : 'No'}
                  onChange={e => {
                    const newValue = e.target.value === 'Yes';
                    formik.setFieldValue('product.suggestion', newValue);
                  }}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
            </div>
            {/* Description */}
            <label className="block text-gray-700 font-bold">
              Description Product
            </label>
            <textarea
              name="product.description"
              placeholder="Enter description"
              value={formik.values.product.description}
              onChange={formik.handleChange}
              className="w-full px-3 py-2 border rounded-lg min-h-[80px] focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <ErrorMessage
              name="product.description"
              component="div"
              className="text-red-500 text-sm"
            />
          </div>

          <div className="flex space-x-2 mt-4 justify-start">
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer"
            >
              {type === 'edit' ? 'Update Product' : 'Add Product'}
            </button>
            <button
              type="button"
              onClick={
                typeof onCancel === 'function'
                  ? onCancel
                  : typeof onClose === 'function'
                  ? onClose
                  : () => {}
              }
              className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </FormikProvider>
      </form>
    </>
  );
};

export default Product;
