import React, { useState } from 'react';
import { X, Plus, Check, Trash2, AlertCircle, BarChart3, Upload } from 'lucide-react';
import { inventoryAPI } from '../../services/api';

const InventoryModals = ({
  showAddModal,
  setShowAddModal,
  showEditModal,
  setShowEditModal,
  showDeleteModal,
  setShowDeleteModal,
  showDetailModal,
  setShowDetailModal,
  selectedProduct,
  setSelectedProduct,
  confirmDelete,
  products,
  setProducts,
  onError,
  onSuccess, // Add this prop
  fetchProducts // Add this prop
}) => {
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    category: '',
    quantity: '',
    min_stock_level: '',
    price: '',
    description: '',
    image: null
  });
  const [formErrors, setFormErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false); // Add loading state

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'image') {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
          setNewProduct({
            ...newProduct,
            image: reader.result
          });
        };
        reader.readAsDataURL(file);
      }
    } else {
      setNewProduct({
        ...newProduct,
        [name]: value
      });
    }
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedProduct({
      ...selectedProduct,
      [name]: value
    });
  };

  const validateForm = (product) => {
    const errors = {};
    
    if (!product.name.trim()) errors.name = 'Product name is required';
    if (!product.sku.trim()) errors.sku = 'SKU is required';
    if (!product.category.trim()) errors.category = 'Category is required';
    if (!product.quantity || isNaN(product.quantity) || product.quantity < 0) 
      errors.quantity = 'Valid quantity is required';
    if (!product.min_stock_level || isNaN(product.min_stock_level) || product.min_stock_level < 0) 
      errors.min_stock_level = 'Valid minimum stock level is required';
    if (!product.price || isNaN(product.price) || product.price <= 0) 
      errors.price = 'Valid price is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm(newProduct)) return;
    
    try {
      setLoading(true);
      const productToAdd = {
        name: newProduct.name,
        sku: newProduct.sku,
        category: newProduct.category,
        quantity: parseInt(newProduct.quantity),
        min_stock_level: parseInt(newProduct.min_stock_level),
        price: parseFloat(newProduct.price),
        description: newProduct.description,
        image: newProduct.image
      };
      
      // Use the API to create the product
      await inventoryAPI.createProduct(productToAdd);
      
      // Instead of updating local state, call fetchProducts to refresh from backend
      if (fetchProducts) {
        await fetchProducts();
      } else {
        // Fallback: update local state
        const createdProduct = await inventoryAPI.createProduct(productToAdd);
        setProducts([...products, createdProduct]);
      }
      
      // Reset form and close modal
      setNewProduct({
        name: '',
        sku: '',
        category: '',
        quantity: '',
        min_stock_level: '',
        price: '',
        description: '',
        image: null
      });
      setImagePreview(null);
      setFormErrors({});
      setShowAddModal(false);
      
      if (onSuccess) onSuccess('Product created successfully');
    } catch (error) {
      console.error('Error creating product:', error);
      if (onError) onError(error.response?.data?.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm(selectedProduct)) return;
    
    try {
      setLoading(true);
      const updatedProduct = {
        name: selectedProduct.name,
        sku: selectedProduct.sku,
        category: selectedProduct.category,
        quantity: parseInt(selectedProduct.quantity),
        min_stock_level: parseInt(selectedProduct.min_stock_level),
        price: parseFloat(selectedProduct.price),
        description: selectedProduct.description,
        image: selectedProduct.image
      };
      
      // Use the API to update the product
      await inventoryAPI.updateProduct(selectedProduct.id, updatedProduct);
      
      // Instead of updating local state, call fetchProducts to refresh from backend
      if (fetchProducts) {
        await fetchProducts();
      } else {
        // Fallback: update local state
        const result = await inventoryAPI.updateProduct(selectedProduct.id, updatedProduct);
        const updatedProducts = products.map(p => 
          p.id === selectedProduct.id ? result : p
        );
        setProducts(updatedProducts);
      }
      
      setShowEditModal(false);
      setSelectedProduct(null);
      
      if (onSuccess) onSuccess('Product updated successfully');
    } catch (error) {
      console.error('Error updating product:', error);
      if (onError) onError(error.response?.data?.message || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      in_stock: { color: 'bg-green-100 text-green-800', text: 'In Stock' },
      low_stock: { color: 'bg-yellow-100 text-yellow-800', text: 'Low Stock' },
      out_of_stock: { color: 'bg-red-100 text-red-800', text: 'Out of Stock' }
    };
    
    const config = statusConfig[status] || statusConfig.in_stock;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  return (
    <>
      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-xl font-semibold text-gray-900">Add New Product</h3>
              <button
                type="button"
                className="text-gray-40 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center transition-colors duration-200"
                onClick={() => setShowAddModal(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={newProduct.name}
                    onChange={handleInputChange}
                    className={`block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2 px-3 transition-colors duration-200 ${formErrors.name ? 'border-red-500' : ''}`}
                  />
                  {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
                </div>
                <div>
                  <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
                  <input
                    type="text"
                    id="sku"
                    name="sku"
                    value={newProduct.sku}
                    onChange={handleInputChange}
                    className={`block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2 px-3 transition-colors duration-200 ${formErrors.sku ? 'border-red-500' : ''}`}
                  />
                  {formErrors.sku && <p className="mt-1 text-sm text-red-600">{formErrors.sku}</p>}
                </div>
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <input
                    type="text"
                    id="category"
                    name="category"
                    value={newProduct.category}
                    onChange={handleInputChange}
                    className={`block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2 px-3 transition-colors duration-200 ${formErrors.category ? 'border-red-500' : ''}`}
                  />
                  {formErrors.category && <p className="mt-1 text-sm text-red-600">{formErrors.category}</p>}
                </div>
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    step="0.01"
                    value={newProduct.price}
                    onChange={handleInputChange}
                    className={`block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2 px-3 transition-colors duration-200 ${formErrors.price ? 'border-red-500' : ''}`}
                  />
                  {formErrors.price && <p className="mt-1 text-sm text-red-600">{formErrors.price}</p>}
                </div>
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={newProduct.quantity}
                    onChange={handleInputChange}
                    className={`block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2 px-3 transition-colors duration-200 ${formErrors.quantity ? 'border-red-500' : ''}`}
                  />
                  {formErrors.quantity && <p className="mt-1 text-sm text-red-600">{formErrors.quantity}</p>}
                </div>
                <div>
                  <label htmlFor="min_stock_level" className="block text-sm font-medium text-gray-700 mb-1">Minimum Stock Level *</label>
                  <input
                    type="number"
                    id="min_stock_level"
                    name="min_stock_level"
                    value={newProduct.min_stock_level}
                    onChange={handleInputChange}
                    className={`block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2 px-3 transition-colors duration-200 ${formErrors.min_stock_level ? 'border-red-500' : ''}`}
                  />
                  {formErrors.min_stock_level && <p className="mt-1 text-sm text-red-600">{formErrors.min_stock_level}</p>}
                </div>
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={newProduct.description}
                  onChange={handleInputChange}
                  className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2 px-3 transition-colors duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                <div className="mt-1 flex items-center">
                  <div className="inline-block h-20 w-20 rounded-full overflow-hidden bg-gray-100 mr-4">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-400">
                        <BarChart3 className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <span className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Image
                    </span>
                    <input
                      id="image-upload"
                      name="image"
                      type="file"
                      accept="image/*"
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                  </label>
                </div>
              </div>
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  type="button"
                  className="mr-3 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-200"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && selectedProduct && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-xl font-semibold text-gray-900">Edit Product</h3>
              <button
                type="button"
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center transition-colors duration-200"
                onClick={() => setShowEditModal(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                  <input
                    type="text"
                    id="edit-name"
                    name="name"
                    value={selectedProduct.name}
                    onChange={handleEditInputChange}
                    className={`block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2 px-3 transition-colors duration-200 ${formErrors.name ? 'border-red-500' : ''}`}
                  />
                  {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
                </div>
                <div>
                  <label htmlFor="edit-sku" className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
                  <input
                    type="text"
                    id="edit-sku"
                    name="sku"
                    value={selectedProduct.sku}
                    onChange={handleEditInputChange}
                    className={`block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2 px-3 transition-colors duration-200 ${formErrors.sku ? 'border-red-500' : ''}`}
                  />
                  {formErrors.sku && <p className="mt-1 text-sm text-red-600">{formErrors.sku}</p>}
                </div>
                <div>
                  <label htmlFor="edit-category" className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <input
                    type="text"
                    id="edit-category"
                    name="category"
                    value={selectedProduct.category}
                    onChange={handleEditInputChange}
                    className={`block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2 px-3 transition-colors duration-200 ${formErrors.category ? 'border-red-500' : ''}`}
                  />
                  {formErrors.category && <p className="mt-1 text-sm text-red-600">{formErrors.category}</p>}
                </div>
                <div>
                  <label htmlFor="edit-price" className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                  <input
                    type="number"
                    id="edit-price"
                    name="price"
                    step="0.01"
                    value={selectedProduct.price}
                    onChange={handleEditInputChange}
                    className={`block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2 px-3 transition-colors duration-200 ${formErrors.price ? 'border-red-500' : ''}`}
                  />
                  {formErrors.price && <p className="mt-1 text-sm text-red-600">{formErrors.price}</p>}
                </div>
                <div>
                  <label htmlFor="edit-quantity" className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                  <input
                    type="number"
                    id="edit-quantity"
                    name="quantity"
                    value={selectedProduct.quantity}
                    onChange={handleEditInputChange}
                    className={`block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2 px-3 transition-colors duration-200 ${formErrors.quantity ? 'border-red-500' : ''}`}
                  />
                  {formErrors.quantity && <p className="mt-1 text-sm text-red-600">{formErrors.quantity}</p>}
                </div>
                <div>
                  <label htmlFor="edit-min-stock" className="block text-sm font-medium text-gray-700 mb-1">Minimum Stock Level *</label>
                  <input
                    type="number"
                    id="edit-min-stock"
                    name="min_stock_level"
                    value={selectedProduct.min_stock_level}
                    onChange={handleEditInputChange}
                    className={`block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2 px-3 transition-colors duration-200 ${formErrors.min_stock_level ? 'border-red-500' : ''}`}
                  />
                  {formErrors.min_stock_level && <p className="mt-1 text-sm text-red-600">{formErrors.min_stock_level}</p>}
                </div>
              </div>
              <div>
                <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  id="edit-description"
                  name="description"
                  rows={3}
                  value={selectedProduct.description}
                  onChange={handleEditInputChange}
                  className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2 px-3 transition-colors duration-200"
                />
              </div>
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  type="button"
                  className="mr-3 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-200"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Update Product
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedProduct && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-xl font-semibold text-gray-900">Confirm Delete</h3>
              <button
                type="button"
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center transition-colors duration-200"
                onClick={() => setShowDeleteModal(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <AlertCircle className="h-6 w-6 text-red-600 mr-2" />
                <p className="text-gray-700">
                  Are you sure you want to delete <strong>{selectedProduct.name}</strong>? This action cannot be undone.
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                  onClick={() => confirmDelete(selectedProduct.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {showDetailModal && selectedProduct && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-xl font-semibold text-gray-900">Product Details</h3>
              <button
                type="button"
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center transition-colors duration-200"
                onClick={() => setShowDetailModal(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/3">
                  <div className="h-48 w-full bg-gray-100 rounded-lg flex items-center justify-center">
                    {selectedProduct.image ? (
                      <img src={selectedProduct.image} alt={selectedProduct.name} className="h-full w-full object-cover rounded-lg" />
                    ) : (
                      <BarChart3 className="h-16 w-16 text-gray-400" />
                    )}
                  </div>
                </div>
                <div className="w-full md:w-2/3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Product Name</h4>
                      <p className="text-lg font-semibold text-gray-900">{selectedProduct.name}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">SKU</h4>
                      <p className="text-lg font-semibold text-gray-900">{selectedProduct.sku}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Category</h4>
                      <p className="text-lg font-semibold text-gray-900">{selectedProduct.category}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Price</h4>
                      <p className="text-lg font-semibold text-gray-900">${selectedProduct.price}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Quantity</h4>
                      <p className="text-lg font-semibold text-gray-900">{selectedProduct.quantity}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Minimum Stock Level</h4>
                      <p className="text-lg font-semibold text-gray-900">{selectedProduct.min_stock_level}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Status</h4>
                      {getStatusBadge(selectedProduct.status)}
                    </div>
                  </div>
                  {selectedProduct.description && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-500">Description</h4>
                      <p className="text-gray-700 mt-1">{selectedProduct.description}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end pt-4 border-t border-gray-200 mt-4">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                  onClick={() => setShowDetailModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InventoryModals;