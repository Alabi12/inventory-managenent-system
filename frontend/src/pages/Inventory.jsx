import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  BarChart3,
  ChevronDown,
  ChevronUp,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react';
import InventoryCRUD from '../components/Inventory/InventoryCRUD';
import InventoryModals from '../components/Inventory/InventoryModals';
import InventoryFileManager from '../components/Inventory/InventoryFileManager';
import FileUploadModal from '../components/Inventory/FileUploadModal';
import { inventoryAPI } from '../services/api';

const Inventory = ({ onError, onSuccess }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [fileManagerVisible, setFileManagerVisible] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');

  // Get unique categories for filter
  const categories = ['all', ...new Set(products.map(product => product.category))];

  // Fetch products from API - wrapped in useCallback to prevent infinite re-renders
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching products with params:', {
        search: searchTerm,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        category: filterCategory !== 'all' ? filterCategory : undefined,
        sortBy,
        sortOrder
      });
      
      const response = await inventoryAPI.getProducts({
        search: searchTerm,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        category: filterCategory !== 'all' ? filterCategory : undefined,
        sortBy,
        sortOrder
      });
      
      console.log('Products fetched:', response.data);
      setDebugInfo(`Fetched ${response.data.length} products at ${new Date().toLocaleTimeString()}`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setDebugInfo(`Error: ${error.message}`);
      if (onError) onError(error.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterStatus, filterCategory, sortBy, sortOrder, onError]);

  // Initial data fetch
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Add this useEffect to debug state changes
  useEffect(() => {
    console.log('Products state updated:', products);
  }, [products]);

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
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

  const handleDeleteProduct = async (productId) => {
    try {
      await inventoryAPI.deleteProduct(productId);
      // Refresh the products list from the backend
      await fetchProducts();
      setShowDeleteModal(false);
      setSelectedProduct(null);
      if (onSuccess) onSuccess('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      if (onError) onError(error.message || 'Failed to delete product');
    }
  };

  const confirmDelete = (productId) => {
    handleDeleteProduct(productId);
  };

  const handleImportComplete = (files) => {
    // Refresh products after import
    fetchProducts();
    setShowImportModal(false);
    if (onSuccess) onSuccess(`Successfully imported files`);
  };

  const forceRefresh = () => {
    console.log('Manual refresh triggered');
    fetchProducts();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading inventory...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Debug Info */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-yellow-800">{debugInfo || 'Ready'}</span>
          <button
            onClick={forceRefresh}
            className="flex items-center text-yellow-700 hover:text-yellow-900 text-sm"
            title="Refresh data"
          >
            <RefreshCw size={16} className="mr-1" />
            Refresh
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600">Manage your products and stock levels</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFileManagerVisible(!fileManagerVisible)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            {fileManagerVisible ? (
              <>
                <BarChart3 className="h-4 w-4 mr-2" />
                Hide Files
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                File Manager
              </>
            )}
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </button>
        </div>
      </div>

      {/* File Manager Section */}
      {fileManagerVisible && (
        <InventoryFileManager
          products={products}
          setProducts={setProducts}
          onError={onError}
          onSuccess={onSuccess}
          fetchProducts={fetchProducts}
        />
      )}

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 py-2 sm:text-sm border-gray-300 rounded-md border"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
            <select
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.filter(cat => cat !== 'all').map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <Filter className="h-4 w-4 mr-1" />
              More Filters
              {showAdvancedFilters ? (
                <ChevronUp className="h-4 w-4 ml-1" />
              ) : (
                <ChevronDown className="h-4 w-4 ml-1" />
              )}
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Level</label>
                <select className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border">
                  <option>Any</option>
                  <option>Low Stock Only</option>
                  <option>Out of Stock Only</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Added</label>
                <input
                  type="date"
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
        <InventoryCRUD 
          filteredProducts={products} // Now using the products from API (already filtered)
          sortBy={sortBy}
          sortOrder={sortOrder}
          handleSort={handleSort}
          getStatusBadge={getStatusBadge}
          handleViewProduct={(product) => {
            setSelectedProduct(product);
            setShowDetailModal(true);
          }}
          handleEditProduct={(product) => {
            setSelectedProduct(product);
            setShowEditModal(true);
          }}
          handleDeleteProduct={(product) => {
            setSelectedProduct(product);
            setShowDeleteModal(true);
          }}
          searchTerm={searchTerm}
          filterStatus={filterStatus}
          filterCategory={filterCategory}
        />
      </div>

      {/* Modals */}
      <InventoryModals
        showAddModal={showAddModal}
        setShowAddModal={setShowAddModal}
        showEditModal={showEditModal}
        setShowEditModal={setShowEditModal}
        showDeleteModal={showDeleteModal}
        setShowDeleteModal={setShowDeleteModal}
        showDetailModal={showDetailModal}
        setShowDetailModal={setShowDetailModal}
        selectedProduct={selectedProduct}
        setSelectedProduct={setSelectedProduct}
        confirmDelete={confirmDelete}
        products={products}
        setProducts={setProducts}
        onError={onError}
        onSuccess={onSuccess}
        fetchProducts={fetchProducts}
      />

      {/* File Upload Modal */}
      <FileUploadModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onUploadComplete={handleImportComplete}
      />
    </div>
  );
};

export default Inventory;