import { useFormik, Form, Field, ErrorMessage, FormikProvider } from 'formik';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import * as Yup from 'yup';

const Product = ({ onCancel, onClose, product }) => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type');
  const id = searchParams.get('id');

  const [selectedFile, setSelectedFile] = useState(null);
  const [discountOptions, setDiscountOptions] = useState([]);

  // New state to hold classification image files for upload
  const [classificationFiles, setClassificationFiles] = useState([]);

  useEffect(() => {
    // Fetch discount options from backend
    const fetchDiscounts = async () => {
      try {
        const response = await fetch(
          'http://localhost:3001/api/admin/discounts'
        );
        if (!response.ok) {
          throw new Error('Failed to fetch discounts');
        }
        const data = await response.json();
        setDiscountOptions(data);
      } catch (error) {
        console.error('Error fetching discounts:', error);
      }
    };
    fetchDiscounts();
  }, []);

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
              discountIds: [],
              classifications: [], // new field
            }
          : {
              ...product,
              discountIds: product.productDiscounts
                ? product.productDiscounts.map(pd => pd.discount.id)
                : [],
              classifications: product.classifications || [], // new field
            },
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
        discountIds: Yup.array().of(Yup.number()),
        classifications: Yup.array().of(
          Yup.object().shape({
            label: Yup.string().required('Label is required'),
            imageUrl: Yup.mixed().required('Image is required'),
          })
        ),
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
      // Send product data without imageUrl and classifications imageUrls
      const productData = { ...values.product };
      delete productData.imageUrl;

      // Remove imageUrl from classifications for initial product data send
      if (productData.classifications) {
        productData.classifications = productData.classifications.map(c => ({
          label: c.label,
        }));
      }

      // Ensure discountIds is included and is an array of numbers
      if (!Array.isArray(productData.discountIds)) {
        productData.discountIds = [];
      } else {
        productData.discountIds = productData.discountIds.map(id => Number(id));
      }

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

      // Upload main product image if selected
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

      // Upload classification images if any
      if (
        values.product.classifications &&
        values.product.classifications.length > 0
      ) {
        for (let i = 0; i < values.product.classifications.length; i++) {
          const classification = values.product.classifications[i];
          const file = classificationFiles[i];
          if (file) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('label', classification.label);
            const uploadResponse = await fetch(
              `http://localhost:3001/api/product/upload-classification-image?id=${data.id}&index=${i}`,
              {
                method: 'POST',
                body: formData,
              }
            );
            if (!uploadResponse.ok) {
              throw new Error(
                `Failed to upload classification image at index ${i}`
              );
            }
          }
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
      // Send product data without imageUrl and classifications imageUrls
      const productData = { ...values.product };
      delete productData.imageUrl;

      // Remove imageUrl from classifications for initial product data send
      if (productData.classifications) {
        productData.classifications = productData.classifications.map(c => ({
          label: c.label,
        }));
      }

      // Ensure discountIds is included and is an array of numbers
      if (!Array.isArray(productData.discountIds)) {
        productData.discountIds = [];
      } else {
        productData.discountIds = productData.discountIds.map(id => Number(id));
      }

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

      // Upload main product image if selected
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

      // Upload classification images if any
      if (
        values.product.classifications &&
        values.product.classifications.length > 0
      ) {
        for (let i = 0; i < values.product.classifications.length; i++) {
          const classification = values.product.classifications[i];
          const file = classificationFiles[i];
          if (file) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('label', classification.label);
            const uploadResponse = await fetch(
              `http://localhost:3001/api/product/upload-classification-image?id=${id}&index=${i}`,
              {
                method: 'POST',
                body: formData,
              }
            );
            if (!uploadResponse.ok) {
              throw new Error(
                `Failed to upload classification image at index ${i}`
              );
            }
          }
        }
      }

      if (typeof onClose === 'function') {
        onClose();
      }
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  // Handlers for classification items
  const handleAddClassification = () => {
    const newClassifications = [
      ...formik.values.product.classifications,
      { label: '', imageUrl: '' },
    ];
    formik.setFieldValue('product.classifications', newClassifications);
    setClassificationFiles([...classificationFiles, null]);
  };

  const handleRemoveClassification = index => {
    const newClassifications = [...formik.values.product.classifications];
    newClassifications.splice(index, 1);
    formik.setFieldValue('product.classifications', newClassifications);

    const newFiles = [...classificationFiles];
    newFiles.splice(index, 1);
    setClassificationFiles(newFiles);
  };

  const handleClassificationLabelChange = (index, value) => {
    const newClassifications = [...formik.values.product.classifications];
    newClassifications[index].label = value;
    formik.setFieldValue('product.classifications', newClassifications);
  };

  const handleClassificationFileChange = (index, file) => {
    const newClassifications = [...formik.values.product.classifications];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        newClassifications[index].imageUrl = reader.result;
        formik.setFieldValue('product.classifications', newClassifications);
      };
      reader.readAsDataURL(file);
    } else {
      // Preserve existing imageUrl if no new file selected
      // Do not clear imageUrl here
      formik.setFieldValue('product.classifications', newClassifications);
    }
    const newFiles = [...classificationFiles];
    newFiles[index] = file;
    setClassificationFiles(newFiles);
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
            <div className="flex gap-6">
              {/* Name Product */}
              <div className="flex-1">
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
              </div>
              {/* Category Type */}
              <div className="flex-1">
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
              </div>
            </div>
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

            <div className="flex space-x-4">
              {/* Description */}
              <div className="w-1/2">
                <label className="block text-gray-700 font-bold mb-1">
                  Description Product
                </label>
                <textarea
                  name="product.description"
                  placeholder="Enter description"
                  value={formik.values.product.description}
                  onChange={formik.handleChange}
                  className="w-full px-3 py-2 border rounded-lg min-h-[120px] h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <ErrorMessage
                  name="product.description"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>
              {/* Discounts */}
              <div className="w-1/2">
                <label className="block text-gray-700 font-bold mb-1">
                  Discounts
                </label>
                <select
                  name="product.discountIds"
                  multiple
                  value={formik.values.product.discountIds}
                  onChange={e => {
                    const options = e.target.options;
                    const selected = [];
                    for (let i = 0; i < options.length; i++) {
                      if (options[i].selected) {
                        selected.push(parseInt(options[i].value, 10));
                      }
                    }
                    formik.setFieldValue('product.discountIds', selected);
                  }}
                  className="w-full min-h-[120px] h-[120px] px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  {discountOptions.map(discount => (
                    <option key={discount.id} value={discount.id}>
                      {discount.code} - {discount.description}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* New Classification Section */}
            <div className="mt-6">
              <label className="block text-gray-700 font-bold mb-2">
                Classifications
              </label>
              {formik.values.product.classifications.map(
                (classification, index) => (
                  <div
                    key={index}
                    className="mb-2 border p-4 rounded-md bg-gray-50"
                  >
                    <div className="flex space-x-1 items-start">
                      <div className="flex-1">
                        <label className="block text-gray-700 font-semibold mb-1">
                          Label
                        </label>
                        <input
                          type="text"
                          value={classification.label}
                          onChange={e =>
                            handleClassificationLabelChange(
                              index,
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <ErrorMessage
                          name={`product.classifications[${index}].label`}
                          component="div"
                          className="text-red-500 text-sm"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-gray-700 font-semibold mb-1">
                          Image
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => {
                            const file = e.currentTarget.files?.[0] || null;
                            handleClassificationFileChange(index, file);
                          }}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <ErrorMessage
                          name={`product.classifications[${index}].imageUrl`}
                          component="div"
                          className="text-red-500 text-sm"
                        />
                        {classification.imageUrl && (
                          <>
                            <img
                              src={classification.imageUrl}
                              alt={`Classification ${index + 1}`}
                              className="mt-2 max-h-24 rounded-md block"
                              style={{ clear: 'both' }}
                            />
                            <br />
                          </>
                        )}
                      </div>
                      <div className="flex items-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveClassification(index)}
                          className="ml-4 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                )
              )}
              <button
                type="button"
                onClick={handleAddClassification}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add Classification
              </button>
            </div>
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
