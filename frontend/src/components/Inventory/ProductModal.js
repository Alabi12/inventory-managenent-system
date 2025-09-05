import React, { useState } from 'react';
import { X, Plus, Check, Trash2, AlertCircle, BarChart3, Upload } from 'lucide-react';
import { inventoryAPI } from '../../api/inventoryService';
import ProductModal from './ProductModal'; // Import the ProductModal

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
  onSuccess,
  fetchProducts
}) => {
  const [loading, setLoading] = useState(false);

  // Handle product form submission
  const handleProductSubmit = async (productData) => {
    try {
      setLoading(true);
      
      if (selectedProduct) {
        // Update existing product
        await inventoryAPI.updateProduct(selectedProduct.id, productData);
        if (onSuccess) onSuccess('Product updated successfully');
      } else {
        // Create new product
        await inventoryAPI.createProduct(productData);
        if (onSuccess) onSuccess('Product created successfully');
      }
      
      // Refresh products list
      await fetchProducts();
      
      // Close modal
      if (selectedProduct) {
        setShowEditModal(false);
      } else {
        setShowAddModal(false);
      }
      
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error saving product:', error);
      if (onError) onError(error.response?.data?.message || 'Failed to save product');
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
      {/* Add/Edit Product Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={showAddModal || showEditModal}
        onClose={() => {
          if (selectedProduct) {
            setShowEditModal(false);
          } else {
            setShowAddModal(false);
          }
          setSelectedProduct(null);
        }}
        onSubmit={handleProductSubmit}
        loading={loading}
      />

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