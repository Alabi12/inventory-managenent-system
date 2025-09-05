import React, { useState, useRef } from 'react';
import { Download, Upload, FileText, X, Check, AlertCircle, Trash2, Eye, BarChart3, FileSpreadsheet } from 'lucide-react';
import { inventoryAPI } from '../../services/api';
import * as XLSX from 'xlsx';

const InventoryFileManager = ({
  products,
  setProducts,
  onError,
  onSuccess
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [importResults, setImportResults] = useState(null);
  const fileInputRef = useRef(null);

  // Download templates
  const downloadTemplate = (type) => {
    const templateData = {
      'csv': `name,sku,category,quantity,min_stock_level,price,description
Product Name,SKU-001,Electronics,100,10,99.99,Product description`,
      'excel': [
        ['name', 'sku', 'category', 'quantity', 'min_stock_level', 'price', 'description'],
        ['Product Name', 'SKU-001', 'Electronics', '100', '10', '99.99', 'Product description']
      ]
    };

    if (type === 'csv') {
      const blob = new Blob([templateData.csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'inventory_template.csv';
      link.click();
      window.URL.revokeObjectURL(url);
    } else if (type === 'excel') {
      const ws = XLSX.utils.aoa_to_sheet(templateData.excel);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Inventory Template');
      XLSX.writeFile(wb, 'inventory_template.xlsx');
    }
  };

  // Export inventory data
  const exportInventory = (format) => {
    try {
      const data = products.map(product => ({
        name: product.name,
        sku: product.sku,
        category: product.category,
        quantity: product.quantity,
        min_stock_level: product.min_stock_level,
        price: product.price,
        description: product.description,
        status: product.status,
        last_updated: product.updated_at
      }));

      if (format === 'csv') {
        const headers = Object.keys(data[0]).join(',');
        const csvData = data.map(row => 
          Object.values(row).map(value => 
            `"${String(value).replace(/"/g, '""')}"`
          ).join(',')
        ).join('\n');
        
        const csvContent = `${headers}\n${csvData}`;
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `inventory_export_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
      } else if (format === 'excel') {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Inventory');
        XLSX.writeFile(wb, `inventory_export_${new Date().toISOString().split('T')[0]}.xlsx`);
      }

      if (onSuccess) onSuccess(`Inventory exported successfully as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      if (onError) onError('Failed to export inventory data');
    }
  };

  // Handle file selection
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter(file => 
      ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'].includes(file.type)
    );

    if (validFiles.length === 0) {
      if (onError) onError('Please select valid CSV or Excel files');
      return;
    }

    setSelectedFiles(validFiles);
    setImportResults(null);
  };

  // Process uploaded files
  const processFiles = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);
    const results = {
      successful: 0,
      failed: 0,
      errors: []
    };

    for (const file of selectedFiles) {
      try {
        const fileData = await readFile(file);
        const productsData = parseFileData(fileData, file.type);
        
        for (const productData of productsData) {
          try {
            // Validate product data
            if (!productData.name || !productData.sku) {
              throw new Error('Missing required fields: name and sku');
            }

            // Check if product exists
            const existingProduct = products.find(p => p.sku === productData.sku);
            
            if (existingProduct) {
              // Update existing product
              await inventoryAPI.updateProduct(existingProduct.id, {
                ...productData,
                quantity: parseInt(productData.quantity) || 0,
                min_stock_level: parseInt(productData.min_stock_level) || 0,
                price: parseFloat(productData.price) || 0
              });
            } else {
              // Create new product
              await inventoryAPI.createProduct({
                ...productData,
                quantity: parseInt(productData.quantity) || 0,
                min_stock_level: parseInt(productData.min_stock_level) || 0,
                price: parseFloat(productData.price) || 0
              });
            }
            
            results.successful++;
          } catch (error) {
            results.failed++;
            results.errors.push({
              sku: productData.sku,
              error: error.message
            });
          }
        }

        setUploadProgress((selectedFiles.indexOf(file) + 1) / selectedFiles.length * 100);
      } catch (error) {
        results.failed++;
        results.errors.push({
          file: file.name,
          error: error.message
        });
      }
    }

    // Refresh products list
    try {
      const updatedProducts = await inventoryAPI.getProducts();
      setProducts(updatedProducts);
    } catch (error) {
      console.error('Error refreshing products:', error);
    }

    setImportResults(results);
    setIsUploading(false);
    setSelectedFiles([]);
    
    if (results.successful > 0 && onSuccess) {
      onSuccess(`Successfully processed ${results.successful} products`);
    }
    if (results.failed > 0 && onError) {
      onError(`${results.failed} products failed to process`);
    }
  };

  // Read file content
  const readFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => resolve({
        content: e.target.result,
        type: file.type,
        name: file.name
      });
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      
      if (file.type.includes('sheet')) {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsText(file);
      }
    });
  };

  // Parse file data
  const parseFileData = (fileData, fileType) => {
    if (fileType.includes('sheet')) {
      // Parse Excel file
      const workbook = XLSX.read(fileData.content, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      return XLSX.utils.sheet_to_json(firstSheet);
    } else {
      // Parse CSV file
      const lines = fileData.content.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      return lines.slice(1).filter(line => line.trim()).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        const product = {};
        
        headers.forEach((header, index) => {
          if (values[index]) {
            product[header] = values[index];
          }
        });
        
        return product;
      });
    }
  };

  // Remove selected file
  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">File Management</h2>
        <div className="flex space-x-3">
          <button
            onClick={() => downloadTemplate('csv')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <FileText className="h-4 w-4 mr-2" />
            CSV Template
          </button>
          <button
            onClick={() => downloadTemplate('excel')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Excel Template
          </button>
        </div>
      </div>

      {/* Export Section */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Export Inventory</h3>
        <div className="flex space-x-3">
          <button
            onClick={() => exportInventory('csv')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </button>
          <button
            onClick={() => exportInventory('excel')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Import Section */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Import Inventory</h3>
        
        {/* File Upload Area */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-4">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".csv,.xlsx,.xls"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          {selectedFiles.length === 0 ? (
            <div className="space-y-3">
              <Upload className="h-12 w-12 text-gray-400 mx-auto" />
              <p className="text-sm text-gray-600">
                Drag and drop files here, or{' '}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  browse files
                </button>
              </p>
              <p className="text-xs text-gray-500">Supports CSV and Excel files</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded border">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-sm font-medium">{file.name}</span>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {isUploading && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Processing...</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Import Results */}
        {importResults && (
          <div className={`p-4 rounded-lg mb-4 ${
            importResults.failed === 0 ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
          }`}>
            <div className="flex items-center mb-2">
              {importResults.failed === 0 ? (
                <Check className="h-5 w-5 text-green-500 mr-2" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
              )}
              <h4 className="font-medium">
                Import Results: {importResults.successful} successful, {importResults.failed} failed
              </h4>
            </div>
            
            {importResults.errors.length > 0 && (
              <div className="mt-2 text-sm">
                <p className="font-medium mb-1">Errors:</p>
                <ul className="space-y-1">
                  {importResults.errors.slice(0, 5).map((error, index) => (
                    <li key={index} className="text-red-600">
                      {error.sku ? `SKU ${error.sku}: ` : ''}{error.error}
                    </li>
                  ))}
                </ul>
                {importResults.errors.length > 5 && (
                  <p className="text-gray-600 mt-1">
                    ...and {importResults.errors.length - 5} more errors
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-200"
          >
            <FileText className="h-4 w-4 mr-2" />
            Add Files
          </button>
          
          <button
            onClick={processFiles}
            disabled={isUploading || selectedFiles.length === 0}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-200"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Start Import
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryFileManager;