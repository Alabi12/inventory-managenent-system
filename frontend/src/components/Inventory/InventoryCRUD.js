import React from 'react';
import { Edit, Trash2, Eye, ArrowUp, ArrowDown, Image as ImageIcon } from 'lucide-react';

const InventoryCRUD = ({
  filteredProducts,
  sortBy,
  sortOrder,
  handleSort,
  getStatusBadge,
  handleViewProduct,
  handleEditProduct,
  handleDeleteProduct,
}) => {
  // Safe number formatting function
  const formatPrice = (price) => {
    if (price === undefined || price === null || isNaN(price)) {
      return '0.00';
    }
    return parseFloat(price).toFixed(2);
  };

  // Safe number display function
  const formatNumber = (number) => {
    if (number === undefined || number === null || isNaN(number)) {
      return '0';
    }
    return number.toString();
  };

  // Function to get the correct image URL
const getImageUrl = (image) => {
  if (!image) return null;
  
  console.log('Image data:', image); // Debug log
  
  // If it's a base64 data URL (from file upload)
  if (image.startsWith('data:image')) {
    return image;
  }
  
  // If it's a relative path (like /uploads/filename.jpg)
  if (image.startsWith('/uploads/')) {
    // Check if we need to prepend the backend URL
    const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    return `${backendUrl}${image}`;
  }
  
  // If it's already a full URL
  if (image.startsWith('http')) {
    return image;
  }
  
  // If it's just a filename without path
  if (image.includes('.jpg') || image.includes('.jpeg') || image.includes('.png') || image.includes('.gif')) {
    const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    return `${backendUrl}/uploads/${image}`;
  }
  
  return null;
};

  const SortableHeader = ({ column, children }) => (
    <th
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50"
      onClick={() => handleSort(column)}
    >
      <div className="flex items-center">
        {children}
        {sortBy === column && (
          <span className="ml-1">
            {sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
          </span>
        )}
      </div>
    </th>
  );

  if (filteredProducts.length === 0) {
    return (
      <div className="px-6 py-8 text-center">
        <div className="text-gray-500 text-lg">No products found</div>
        <div className="text-gray-400 text-sm mt-2">
          Try adjusting your search or filters
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Image
            </th>
            <SortableHeader column="name">Product</SortableHeader>
            <SortableHeader column="sku">SKU</SortableHeader>
            <SortableHeader column="category">Category</SortableHeader>
            <SortableHeader column="price">Price</SortableHeader>
            <SortableHeader column="quantity">Quantity</SortableHeader>
            <SortableHeader column="min_stock_level">Min Stock</SortableHeader>
            <SortableHeader column="status">Status</SortableHeader>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredProducts.map((product) => {
            const imageUrl = getImageUrl(product.image);
            
            return (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex-shrink-0 h-10 w-10">
                    {imageUrl ? (
                      <img
                        className="h-10 w-10 rounded-full object-cover border border-gray-200"
                        src={imageUrl}
                        alt={product.name}
                        onError={(e) => {
                          // If image fails to load, show fallback
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center border border-gray-300">
                        <ImageIcon className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                    {/* Fallback that shows if image fails to load */}
                    {imageUrl && (
                      <div 
                        className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center border border-gray-300 hidden"
                        style={{ display: 'none' }}
                      >
                        <ImageIcon className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {product.name || 'No Name'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {product.description ? (
                        product.description.length > 50 ? (
                          `${product.description.substring(0, 50)}...`
                        ) : (
                          product.description
                        )
                      ) : (
                        'No description'
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {product.sku || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {product.category || 'Uncategorized'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${formatPrice(product.price)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatNumber(product.quantity)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatNumber(product.min_stock_level)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(product.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewProduct(product)}
                      className="text-blue-600 hover:text-blue-900 p-1"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="text-green-600 hover:text-green-900 p-1"
                      title="Edit Product"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product)}
                      className="text-red-600 hover:text-red-900 p-1"
                      title="Delete Product"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryCRUD;