import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Download,
  Upload,
  Eye,
  BarChart3,
  X,
  ChevronDown,
  ChevronUp,
  Check,
  AlertCircle,
} from 'lucide-react';

const Inventory = () => {
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
  const [importStep, setImportStep] = useState('upload'); // 'upload', 'map', 'review', 'complete'
  const [importFile, setImportFile] = useState(null);
  const [importPreview, setImportPreview] = useState([]);
  const [importErrors, setImportErrors] = useState([]);
  const [importMapping, setImportMapping] = useState({});
  const [importResults, setImportResults] = useState({ added: 0, updated: 0, errors: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
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

  // Get unique categories for filter
  const categories = ['all', ...new Set(products.map(product => product.category))];

  // Mock data fetch
  useEffect(() => {
    const fetchProducts = () => {
      setTimeout(() => {
        setProducts([
          {
            id: 1,
            name: 'Wireless Headphones',
            sku: 'ELEC-001',
            category: 'Electronics',
            quantity: 42,
            min_stock_level: 10,
            price: 129.99,
            status: 'in_stock',
            last_updated: '2023-10-15',
            description: 'High-quality wireless headphones with noise cancellation',
            image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8aGVhZHBob25lc3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60'
          },
          {
            id: 2,
            name: 'Office Chair',
            sku: 'FURN-002',
            category: 'Furniture',
            quantity: 8,
            min_stock_level: 5,
            price: 249.99,
            status: 'low_stock',
            last_updated: '2023-10-18',
            description: 'Ergonomic office chair with lumbar support',
            image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Y2hhaXJ8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60'
          },
          {
            id: 3,
            name: 'Stainless Steel Water Bottle',
            sku: 'KITC-003',
            category: 'Kitchen',
            quantity: 0,
            min_stock_level: 15,
            price: 24.99,
            status: 'out_of_stock',
            last_updated: '2023-10-10',
            description: 'Insulated stainless steel water bottle, keeps drinks cold for 24 hours',
            image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8d2F0ZXIlMjBib3R0bGV8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60'
          },
          {
            id: 4,
            name: 'Bluetooth Speaker',
            sku: 'ELEC-004',
            category: 'Electronics',
            quantity: 25,
            min_stock_level: 8,
            price: 89.99,
            status: 'in_stock',
            last_updated: '2023-10-20',
            description: 'Portable Bluetooth speaker with 10-hour battery life',
            image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3BlYWtlcnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60'
          },
          {
            id: 5,
            name: 'Desk Lamp',
            sku: 'FURN-005',
            category: 'Furniture',
            quantity: 3,
            min_stock_level: 5,
            price: 39.99,
            status: 'low_stock',
            last_updated: '2023-10-19',
            description: 'Adjustable LED desk lamp with multiple brightness settings',
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGxhbXB8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60'
          }
        ]);
        setLoading(false);
      }, 1000);
    };

    fetchProducts();
  }, []);

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchesStatus = true;
      if (filterStatus !== 'all') {
        matchesStatus = product.status === filterStatus;
      }
      
      let matchesCategory = true;
      if (filterCategory !== 'all') {
        matchesCategory = product.category === filterCategory;
      }
      
      return matchesSearch && matchesStatus && matchesCategory;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (a[sortBy] > b[sortBy]) {
        comparison = 1;
      } else if (a[sortBy] < b[sortBy]) {
        comparison = -1;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

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

  const handleDeleteProduct = (product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setProducts(products.filter(p => p.id !== selectedProduct.id));
    setShowDeleteModal(false);
    setSelectedProduct(null);
  };

  const exportInventory = () => {
    // Create CSV content
    const headers = ['Name', 'SKU', 'Category', 'Quantity', 'Min Stock Level', 'Price', 'Status', 'Last Updated', 'Description'];
    const csvContent = [
      headers.join(','),
      ...filteredProducts.map(product => 
        [
          `"${product.name}"`,
          product.sku,
          product.category,
          product.quantity,
          product.min_stock_level,
          product.price,
          product.status,
          product.last_updated,
          `"${product.description || ''}"`
        ].join(',')
      )
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'inventory_export.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle drag events for import
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files) {
      setIsDragging(true);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileSelection = (file) => {
    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setImportErrors(['Please select a CSV file']);
      return;
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setImportErrors(['File size must be less than 10MB']);
      return;
    }
    
    setImportFile(file);
    setImportErrors([]);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const csvData = event.target.result;
      parseCSVData(csvData, file.name);
    };
    reader.onerror = () => {
      setImportErrors(['Error reading file. Please try again.']);
    };
    reader.readAsText(file);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelection(file);
    }
  };

  const parseCSVData = (csvData, fileName) => {
    // Check if file is empty
    if (!csvData.trim()) {
      setImportErrors(['The selected file is empty']);
      return;
    }
    
    const lines = csvData.split('\n').filter(line => line.trim() !== '');
    if (lines.length < 2) {
      setImportErrors(['CSV file must contain at least a header row and one data row']);
      return;
    }
    
    const headers = parseCSVLine(lines[0]).map(header => header.trim().replace(/"/g, ''));
    const previewData = [];
    const errors = [];
    
    // Validate headers
    if (headers.length === 0) {
      setImportErrors(['No headers found in the CSV file']);
      return;
    }
    
    if (headers.some(header => !header)) {
      setImportErrors(['Some column headers are empty. Please check your CSV file.']);
      return;
    }
    
    // Parse first 5 rows for preview
    for (let i = 1; i < Math.min(6, lines.length); i++) {
      const values = parseCSVLine(lines[i]);
      
      if (values.length !== headers.length) {
        errors.push(`Row ${i + 1} has ${values.length} columns, but header has ${headers.length} columns`);
        continue;
      }
      
      const rowData = {};
      headers.forEach((header, index) => {
        rowData[header] = values[index].replace(/"/g, '').trim();
      });
      
      previewData.push(rowData);
    }
    
    setImportPreview(previewData);
    setImportErrors(errors);
    
    // Auto-map columns based on header names
    const autoMapping = {};
    const possibleMappings = {
      name: ['name', 'product', 'product name', 'title', 'item'],
      sku: ['sku', 'id', 'product code', 'code', 'item number', 'model'],
      category: ['category', 'type', 'department', 'group'],
      quantity: ['quantity', 'stock', 'inventory', 'qty', 'count'],
      min_stock_level: ['min stock level', 'minimum stock', 'min stock', 'reorder level', 'reorder point'],
      price: ['price', 'cost', 'amount', 'value', 'unit price'],
      description: ['description', 'desc', 'details', 'notes']
    };
    
    headers.forEach(header => {
      const lowerHeader = header.toLowerCase();
      for (const [field, matches] of Object.entries(possibleMappings)) {
        if (matches.some(m => lowerHeader.includes(m))) {
          autoMapping[field] = header;
          break;
        }
      }
    });
    
    setImportMapping(autoMapping);
    
    if (errors.length === 0) {
      setImportStep('map');
    }
  };

  const parseCSVLine = (line) => {
    const result = [];
    let inQuotes = false;
    let currentValue = '';
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        // Handle escaped quotes (two consecutive quotes)
        if (i + 1 < line.length && line[i + 1] === '"') {
          currentValue += '"';
          i++; // Skip the next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(currentValue);
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    
    result.push(currentValue);
    return result;
  };

  const downloadTemplate = () => {
    const templateData = [
      ['Name', 'SKU', 'Category', 'Quantity', 'Min Stock Level', 'Price', 'Description'],
      ['Wireless Headphones', 'ELEC-001', 'Electronics', '42', '10', '129.99', 'High-quality wireless headphones'],
      ['Office Chair', 'FURN-002', 'Furniture', '8', '5', '249.99', 'Ergonomic office chair'],
      ['', '', '', '', '', '', '']
    ];
    
    const csvContent = templateData.map(row => 
      row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'inventory_import_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleMappingChange = (field, csvHeader) => {
    setImportMapping({
      ...importMapping,
      [field]: csvHeader
    });
  };

  const processImport = () => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const csvData = event.target.result;
      const lines = csvData.split('\n').filter(line => line.trim() !== '');
      
      if (lines.length < 2) {
        setImportErrors(['No data found in the CSV file']);
        return;
      }
      
      const headers = parseCSVLine(lines[0]).map(header => header.trim().replace(/"/g, ''));
      
      const results = {
        added: 0,
        updated: 0,
        errors: 0
      };
      
      const errors = [];
      const newProducts = [...products];
      
      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        
        if (values.length !== headers.length) {
          errors.push(`Row ${i + 1}: Incorrect number of columns (expected ${headers.length}, found ${values.length})`);
          results.errors++;
          continue;
        }
        
        const rowData = {};
        headers.forEach((header, index) => {
          rowData[header] = values[index].replace(/"/g, '').trim();
        });
        
        // Map CSV data to product fields
        const productData = {};
        let hasErrors = false;
        const rowErrors = [];
        
        // Required fields validation
        if (!importMapping.name || !rowData[importMapping.name]) {
          rowErrors.push('Product name is required');
          hasErrors = true;
        }
        
        if (!importMapping.sku || !rowData[importMapping.sku]) {
          rowErrors.push('SKU is required');
          hasErrors = true;
        }
        
        if (!importMapping.quantity || isNaN(rowData[importMapping.quantity]) || rowData[importMapping.quantity] < 0) {
          rowErrors.push('Valid quantity is required');
          hasErrors = true;
        }
        
        if (!importMapping.price || isNaN(rowData[importMapping.price]) || rowData[importMapping.price] <= 0) {
          rowErrors.push('Valid price is required');
          hasErrors = true;
        }
        
        if (hasErrors) {
          errors.push(`Row ${i + 1}: ${rowErrors.join(', ')}`);
          results.errors++;
          continue;
        }
        
        // Map the data
        if (importMapping.name) productData.name = rowData[importMapping.name];
        if (importMapping.sku) productData.sku = rowData[importMapping.sku];
        if (importMapping.category) productData.category = rowData[importMapping.category];
        if (importMapping.quantity) productData.quantity = parseInt(rowData[importMapping.quantity]);
        if (importMapping.min_stock_level) productData.min_stock_level = parseInt(rowData[importMapping.min_stock_level]) || 0;
        if (importMapping.price) productData.price = parseFloat(rowData[importMapping.price]);
        if (importMapping.description) productData.description = rowData[importMapping.description];
        
        // Determine status based on quantity
        if (productData.quantity === 0) {
          productData.status = 'out_of_stock';
        } else if (productData.min_stock_level && productData.quantity <= productData.min_stock_level) {
          productData.status = 'low_stock';
        } else {
          productData.status = 'in_stock';
        }
        
        productData.last_updated = new Date().toISOString().split('T')[0];
        
        // Check if product already exists
        const existingIndex = newProducts.findIndex(p => p.sku === productData.sku);
        
        if (existingIndex >= 0) {
          // Update existing product
          productData.id = newProducts[existingIndex].id;
          if (!productData.image) productData.image = newProducts[existingIndex].image;
          newProducts[existingIndex] = productData;
          results.updated++;
        } else {
          // Add new product
          productData.id = Math.max(...newProducts.map(p => p.id), 0) + 1;
          newProducts.push(productData);
          results.added++;
        }
      }
      
      setImportErrors(errors);
      setImportResults(results);
      
      if (errors.length === 0) {
        setProducts(newProducts);
      }
      
      setImportStep('review');
    };
    
    reader.onerror = () => {
      setImportErrors(['Error reading file. Please try again.']);
    };
    
    reader.readAsText(importFile);
  };

  const resetImport = () => {
    setImportStep('upload');
    setImportFile(null);
    setImportPreview([]);
    setImportErrors([]);
    setImportMapping({});
  };

  const handleImportClick = () => {
    setShowImportModal(true);
    resetImport();
  };

  const completeImport = () => {
    setShowImportModal(false);
    resetImport();
  };

  const handleAddProduct = () => {
    setShowAddModal(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct({...product});
    setShowEditModal(true);
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setShowDetailModal(true);
  };

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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm(newProduct)) return;
    
    // Determine status based on quantity
    let status = 'in_stock';
    if (parseInt(newProduct.quantity) === 0) {
      status = 'out_of_stock';
    } else if (parseInt(newProduct.quantity) <= parseInt(newProduct.min_stock_level)) {
      status = 'low_stock';
    }
    
    // Create new product with a unique ID
    const productToAdd = {
      id: Math.max(...products.map(p => p.id), 0) + 1,
      name: newProduct.name,
      sku: newProduct.sku,
      category: newProduct.category,
      quantity: parseInt(newProduct.quantity),
      min_stock_level: parseInt(newProduct.min_stock_level),
      price: parseFloat(newProduct.price),
      description: newProduct.description,
      image: newProduct.image,
      status: status,
      last_updated: new Date().toISOString().split('T')[0]
    };
    
    // Add to products array (in a real app, this would be an API call)
    setProducts([...products, productToAdd]);
    
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
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm(selectedProduct)) return;
    
    // Determine status based on quantity
    let status = 'in_stock';
    if (parseInt(selectedProduct.quantity) === 0) {
      status = 'out_of_stock';
    } else if (parseInt(selectedProduct.quantity) <= parseInt(selectedProduct.min_stock_level)) {
      status = 'low_stock';
    }
    
    // Update product
    const updatedProducts = products.map(p => 
      p.id === selectedProduct.id 
        ? { 
            ...selectedProduct, 
            quantity: parseInt(selectedProduct.quantity),
            min_stock_level: parseInt(selectedProduct.min_stock_level),
            price: parseFloat(selectedProduct.price),
            status: status,
            last_updated: new Date().toISOString().split('T')[0]
          }
        : p
    );
    
    setProducts(updatedProducts);
    setShowEditModal(false);
    setSelectedProduct(null);
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600 mt-1">Track and manage your product inventory</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button 
            onClick={handleImportClick}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import
          </button>
          <button 
            onClick={exportInventory}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button 
            onClick={handleAddProduct}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </button>
        </div>
      </div>
      
      {/* Filters and Search */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="relative flex-1 max-w-lg">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search products by name, SKU or description..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>         
          <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
            <select
              className="block w-full md:w-auto pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
            
            <select
              className="block w-full md:w-auto pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
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
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Filter className="h-4 w-4 mr-1" />
              Advanced
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
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Range</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                <input
                  type="date"
                  className="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Inventory Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Products</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{products.length}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Low Stock Items</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {products.filter(p => p.status === 'low_stock').length}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                <X className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Out of Stock</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {products.filter(p => p.status === 'out_of_stock').length}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Products Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('sku')}
                >
                  <div className="flex items-center">
                    SKU
                    {sortBy === 'sku' && (
                      sortOrder === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('category')}
                >
                  <div className="flex items-center">
                    Category
                    {sortBy === 'category' && (
                      sortOrder === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('quantity')}
                >
                  <div className="flex items-center">
                    Quantity
                    {sortBy === 'quantity' && (
                      sortOrder === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('price')}
                >
                  <div className="flex items-center">
                    Price
                    {sortBy === 'price' && (
                      sortOrder === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                    {searchTerm || filterStatus !== 'all' || filterCategory !== 'all' 
                      ? 'No products match your search criteria' 
                      : 'No products found'}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img className="h-10 w-10 rounded-md object-cover" src={product.image} alt={product.name} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500 line-clamp-1">{product.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.sku}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.quantity} / {product.min_stock_level}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.price.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(product.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.last_updated}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleViewProduct(product)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination would go here */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredProducts.length}</span> of{' '}
                <span className="font-medium">{filteredProducts.length}</span> results
              </p>
            </div>
            <div>
             <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                type="button"
                onClick={() => console.log('Previous page')}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <span className="sr-only">Previous</span>
                <ChevronUp className="h-5 w-5" />
              </button>
              
              <button
                type="button"
                onClick={() => console.log('Page 1')}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                1
              </button>
              
              <button
                type="button"
                onClick={() => console.log('Next page')}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <span className="sr-only">Next</span>
                <ChevronDown className="h-5 w-5" />
              </button>
            </nav>
            </div>
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Product</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete "{selectedProduct?.name}"? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={confirmDelete}
                >
                  Delete
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Add New Product</h3>
                    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Product Name *</label>
                          <input
                            type="text"
                            name="name"
                            id="name"
                            value={newProduct.name}
                            onChange={handleInputChange}
                            className={`mt-1 block w-full border ${formErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2`}
                          />
                          {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
                        </div>
                        
                        <div>
                          <label htmlFor="sku" className="block text-sm font-medium text-gray-700">SKU *</label>
                          <input
                            type="text"
                            name="sku"
                            id="sku"
                            value={newProduct.sku}
                            onChange={handleInputChange}
                            className={`mt-1 block w-full border ${formErrors.sku ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2`}
                          />
                          {formErrors.sku && <p className="mt-1 text-sm text-red-600">{formErrors.sku}</p>}
                        </div>
                        
                        <div>
                          <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category *</label>
                          <input
                            type="text"
                            name="category"
                            id="category"
                            value={newProduct.category}
                            onChange={handleInputChange}
                            className={`mt-1 block w-full border ${formErrors.category ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2`}
                          />
                          {formErrors.category && <p className="mt-1 text-sm text-red-600">{formErrors.category}</p>}
                        </div>
                        
                        <div>
                          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity *</label>
                          <input
                            type="number"
                            name="quantity"
                            id="quantity"
                            value={newProduct.quantity}
                            onChange={handleInputChange}
                            className={`mt-1 block w-full border ${formErrors.quantity ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2`}
                          />
                          {formErrors.quantity && <p className="mt-1 text-sm text-red-600">{formErrors.quantity}</p>}
                        </div>
                        
                        <div>
                          <label htmlFor="min_stock_level" className="block text-sm font-medium text-gray-700">Min Stock Level *</label>
                          <input
                            type="number"
                            name="min_stock_level"
                            id="min_stock_level"
                            value={newProduct.min_stock_level}
                            onChange={handleInputChange}
                            className={`mt-1 block w-full border ${formErrors.min_stock_level ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2`}
                          />
                          {formErrors.min_stock_level && <p className="mt-1 text-sm text-red-600">{formErrors.min_stock_level}</p>}
                        </div>
                        
                        <div>
                          <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price *</label>
                          <input
                            type="number"
                            step="0.01"
                            name="price"
                            id="price"
                            value={newProduct.price}
                            onChange={handleInputChange}
                            className={`mt-1 block w-full border ${formErrors.price ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2`}
                          />
                          {formErrors.price && <p className="mt-1 text-sm text-red-600">{formErrors.price}</p>}
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                          name="description"
                          id="description"
                          rows="3"
                          value={newProduct.description}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
                        ></textarea>
                      </div>
                      
                      <div>
                        <label htmlFor="image" className="block text-sm font-medium text-gray-700">Product Image</label>
                        <div className="mt-1 flex items-center">
                          {imagePreview ? (
                            <img src={imagePreview} alt="Preview" className="h-20 w-20 object-cover rounded-md" />
                          ) : (
                            <div className="h-20 w-20 border border-dashed border-gray-300 rounded-md flex items-center justify-center">
                              <Plus className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                          <label htmlFor="image-upload" className="ml-5 cursor-pointer">
                            <span className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                              <Upload className="h-4 w-4 mr-2" />
                              Upload
                            </span>
                            <input
                              id="image-upload"
                              name="image"
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              onChange={handleInputChange}
                            />
                          </label>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Add Product
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Product Modal */}
      {showEditModal && selectedProduct && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Edit Product</h3>
                    <form onSubmit={handleEditSubmit} className="mt-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">Product Name *</label>
                          <input
                            type="text"
                            name="name"
                            id="edit-name"
                            value={selectedProduct.name}
                            onChange={handleEditInputChange}
                            className={`mt-1 block w-full border ${formErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2`}
                          />
                          {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
                        </div>
                        
                        <div>
                          <label htmlFor="edit-sku" className="block text-sm font-medium text-gray-700">SKU *</label>
                          <input
                            type="text"
                            name="sku"
                            id="edit-sku"
                            value={selectedProduct.sku}
                            onChange={handleEditInputChange}
                            className={`mt-1 block w-full border ${formErrors.sku ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2`}
                          />
                          {formErrors.sku && <p className="mt-1 text-sm text-red-600">{formErrors.sku}</p>}
                        </div>
                        
                        <div>
                          <label htmlFor="edit-category" className="block text-sm font-medium text-gray-700">Category *</label>
                          <input
                            type="text"
                            name="category"
                            id="edit-category"
                            value={selectedProduct.category}
                            onChange={handleEditInputChange}
                            className={`mt-1 block w-full border ${formErrors.category ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2`}
                          />
                          {formErrors.category && <p className="mt-1 text-sm text-red-600">{formErrors.category}</p>}
                        </div>
                        
                        <div>
                          <label htmlFor="edit-quantity" className="block text-sm font-medium text-gray-700">Quantity *</label>
                          <input
                            type="number"
                            name="quantity"
                            id="edit-quantity"
                            value={selectedProduct.quantity}
                            onChange={handleEditInputChange}
                            className={`mt-1 block w-full border ${formErrors.quantity ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2`}
                          />
                          {formErrors.quantity && <p className="mt-1 text-sm text-red-600">{formErrors.quantity}</p>}
                        </div>
                        
                        <div>
                          <label htmlFor="edit-min_stock_level" className="block text-sm font-medium text-gray-700">Min Stock Level *</label>
                          <input
                            type="number"
                            name="min_stock_level"
                            id="edit-min_stock_level"
                            value={selectedProduct.min_stock_level}
                            onChange={handleEditInputChange}
                            className={`mt-1 block w-full border ${formErrors.min_stock_level ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2`}
                          />
                          {formErrors.min_stock_level && <p className="mt-1 text-sm text-red-600">{formErrors.min_stock_level}</p>}
                        </div>
                        
                        <div>
                          <label htmlFor="edit-price" className="block text-sm font-medium text-gray-700">Price *</label>
                          <input
                            type="number"
                            step="0.01"
                            name="price"
                            id="edit-price"
                            value={selectedProduct.price}
                            onChange={handleEditInputChange}
                            className={`mt-1 block w-full border ${formErrors.price ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2`}
                          />
                          {formErrors.price && <p className="mt-1 text-sm text-red-600">{formErrors.price}</p>}
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                          name="description"
                          id="edit-description"
                          rows="3"
                          value={selectedProduct.description}
                          onChange={handleEditInputChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
                        ></textarea>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Product Image</label>
                        <div className="mt-1 flex items-center">
                          <img src={selectedProduct.image} alt={selectedProduct.name} className="h-20 w-20 object-cover rounded-md" />
                          <label htmlFor="edit-image-upload" className="ml-5 cursor-pointer">
                            <span className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                              <Upload className="h-4 w-4 mr-2" />
                              Change
                            </span>
                            <input
                              id="edit-image-upload"
                              name="image"
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              onChange={handleEditInputChange}
                            />
                          </label>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleEditSubmit}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Update Product
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Product Detail Modal */}
      {showDetailModal && selectedProduct && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Product Details</h3>
                    <div className="mt-4">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-shrink-0">
                          <img src={selectedProduct.image} alt={selectedProduct.name} className="h-48 w-48 object-cover rounded-md" />
                        </div>
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Product Name</label>
                            <p className="mt-1 text-sm text-gray-900">{selectedProduct.name}</p>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700">SKU</label>
                            <p className="mt-1 text-sm text-gray-900">{selectedProduct.sku}</p>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Category</label>
                            <p className="mt-1 text-sm text-gray-900">{selectedProduct.category}</p>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Status</label>
                            <div className="mt-1">
                              {getStatusBadge(selectedProduct.status)}
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Quantity</label>
                            <p className="mt-1 text-sm text-gray-900">
                              {selectedProduct.quantity} / {selectedProduct.min_stock_level}
                            </p>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Price</label>
                            <p className="mt-1 text-sm text-gray-900">${selectedProduct.price.toFixed(2)}</p>
                          </div>
                          
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <p className="mt-1 text-sm text-gray-900">{selectedProduct.description}</p>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                            <p className="mt-1 text-sm text-gray-900">{selectedProduct.last_updated}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowDetailModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {importStep === 'upload' && 'Import Products'}
                      {importStep === 'map' && 'Map CSV Columns'}
                      {importStep === 'review' && 'Import Results'}
                      {importStep === 'complete' && 'Import Complete'}
                    </h3>
                    
                    {/* Upload Step */}
                    {importStep === 'upload' && (
                      <div className="mt-4">
                        <div 
                          className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'} transition-colors duration-200`}
                          onDragEnter={handleDragEnter}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                        >
                          <div className="space-y-1 text-center">
                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="flex text-sm text-gray-600">
                              <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                <span>Upload a CSV file</span>
                                <input 
                                  id="file-upload" 
                                  name="file-upload" 
                                  type="file" 
                                  className="sr-only" 
                                  accept=".csv"
                                  ref={fileInputRef}
                                  onChange={handleFileInputChange}
                                />
                              </label>
                              <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">CSV up to 10MB</p>
                            
                            <div className="mt-4">
                              <button 
                                type="button"
                                onClick={downloadTemplate}
                                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Download template
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        {importErrors.length > 0 && (
                          <div className="mt-4 p-4 bg-red-50 rounded-md">
                            <div className="flex">
                              <AlertCircle className="h-5 w-5 text-red-400" />
                              <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Import errors</h3>
                                <div className="mt-2 text-sm text-red-700">
                                  <ul className="list-disc pl-5 space-y-1">
                                    {importErrors.map((error, index) => (
                                      <li key={index}>{error}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Mapping Step */}
                    {importStep === 'map' && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-500 mb-4">
                          Map your CSV columns to the appropriate product fields. Required fields are marked with *.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            { field: 'name', label: 'Product Name *', required: true },
                            { field: 'sku', label: 'SKU *', required: true },
                            { field: 'category', label: 'Category', required: false },
                            { field: 'quantity', label: 'Quantity *', required: true },
                            { field: 'min_stock_level', label: 'Min Stock Level', required: false },
                            { field: 'price', label: 'Price *', required: true },
                            { field: 'description', label: 'Description', required: false }
                          ].map(({ field, label, required }) => (
                            <div key={field}>
                              <label className="block text-sm font-medium text-gray-700">{label}</label>
                              <select
                                value={importMapping[field] || ''}
                                onChange={(e) => handleMappingChange(field, e.target.value)}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                              >
                                <option value="">Select column...</option>
                                {importPreview.length > 0 && 
                                  Object.keys(importPreview[0]).map(header => (
                                    <option key={header} value={header}>{header}</option>
                                  ))
                                }
                              </select>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-6">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Preview (first 5 rows)</h4>
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  {importPreview.length > 0 && 
                                    Object.keys(importPreview[0]).map(header => (
                                      <th key={header} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {header}
                                      </th>
                                    ))
                                  }
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {importPreview.map((row, index) => (
                                  <tr key={index}>
                                    {Object.values(row).map((value, i) => (
                                      <td key={i} className="px-3 py-2 text-sm text-gray-500">
                                        {value}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Review Step */}
                    {importStep === 'review' && (
                      <div className="mt-4">
                        {importErrors.length > 0 ? (
                          <div className="mb-6 p-4 bg-red-50 rounded-md">
                            <div className="flex">
                              <AlertCircle className="h-5 w-5 text-red-400" />
                              <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Import completed with errors</h3>
                                <div className="mt-2 text-sm text-red-700">
                                  <p>{importResults.errors} rows had errors and were not imported.</p>
                                  <details className="mt-2">
                                    <summary className="cursor-pointer">View error details</summary>
                                    <ul className="list-disc pl-5 space-y-1 mt-2">
                                      {importErrors.map((error, index) => (
                                        <li key={index}>{error}</li>
                                      ))}
                                    </ul>
                                  </details>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="mb-6 p-4 bg-green-50 rounded-md">
                            <div className="flex">
                              <Check className="h-5 w-5 text-green-400" />
                              <div className="ml-3">
                                <h3 className="text-sm font-medium text-green-800">Import completed successfully</h3>
                                <div className="mt-2 text-sm text-green-700">
                                  <p>{importResults.added} products added, {importResults.updated} products updated.</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                          <div className="bg-blue-50 p-4 rounded-md">
                            <div className="text-2xl font-semibold text-blue-600">{importResults.added}</div>
                            <div className="text-sm text-blue-800">Products Added</div>
                          </div>
                          <div className="bg-green-50 p-4 rounded-md">
                            <div className="text-2xl font-semibold text-green-600">{importResults.updated}</div>
                            <div className="text-sm text-green-800">Products Updated</div>
                          </div>
                          <div className="bg-red-50 p-4 rounded-md">
                            <div className="text-2xl font-semibold text-red-600">{importResults.errors}</div>
                            <div className="text-sm text-red-800">Errors</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                {importStep === 'upload' && importFile && (
                  <button
                    type="button"
                    onClick={() => setImportStep('map')}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Continue to Mapping
                  </button>
                )}
                
                {importStep === 'map' && (
                  <button
                    type="button"
                    onClick={processImport}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Process Import
                  </button>
                )}
                
                {importStep === 'review' && (
                  <button
                    type="button"
                    onClick={completeImport}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Done
                  </button>
                )}
                
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={() => {
                    setShowImportModal(false);
                    resetImport();
                  }}
                >
                  {importStep === 'review' ? 'Cancel' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;