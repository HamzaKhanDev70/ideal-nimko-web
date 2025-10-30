import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { api } from '../../utils/api';

const RecoveryManagement = () => {
  const [recoveries, setRecoveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    shopkeeperId: '',
    salesmanId: '',
    status: '',
    recoveryType: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState({});
  const [shopkeepers, setShopkeepers] = useState([]);
  const [salesmen, setSalesmen] = useState([]);

  useEffect(() => {
    fetchData();
    fetchShopkeepers();
    fetchSalesmen();
    fetchStats();
  }, [filters.page, filters.limit]);

  // Trigger fetchData when filters change (excluding page and limit)
  useEffect(() => {
    // Only trigger if we have some filters set or if it's a page change
    const hasActiveFilters = filters.shopkeeperId || filters.salesmanId || filters.status || 
                           filters.recoveryType || filters.startDate || filters.endDate;
    
    if (hasActiveFilters || filters.page > 1) {
      fetchData();
    }
  }, [filters.shopkeeperId, filters.salesmanId, filters.status, filters.recoveryType, filters.startDate, filters.endDate, filters.page]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const url = `${api.recoveries.getAll()}?${queryParams}`;
      console.log('Fetching recoveries from:', url);
      console.log('Filters:', filters);

      const response = await axios.get(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      console.log('Recoveries response:', response.data);
      setRecoveries(response.data.recoveries || []);
      setPagination(response.data.pagination || {});
    } catch (error) {
      console.error('Error fetching recoveries:', error);
      alert('Error fetching recoveries: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchShopkeepers = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(api.shopkeepers.getAll(), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setShopkeepers(response.data.shopkeepers || []);
    } catch (error) {
      console.error('Error fetching shopkeepers:', error);
    }
  };

  const fetchSalesmen = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(api.users.getAll(), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const salesmenData = response.data.users?.filter(user => user.role === 'salesman') || [];
      setSalesmen(salesmenData);
    } catch (error) {
      console.error('Error fetching salesmen:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(api.recoveries.getStats(), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      shopkeeperId: '',
      salesmanId: '',
      status: '',
      recoveryType: '',
      startDate: '',
      endDate: '',
      page: 1,
      limit: 10
    });
    // Trigger immediate fetch with cleared filters
    setTimeout(() => {
      fetchData();
    }, 100);
  };

  const formatCurrency = (amount) => {
    return `PKR${amount?.toFixed(2) || '0.00'}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading recovery records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">💰 Recovery Management</h1>
        <p className="text-gray-600">View and manage all recovery records</p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Recoveries</p>
                <p className="text-xl font-semibold">{stats.stats?.totalRecoveries || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">💰</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Collected</p>
                <p className="text-xl font-semibold">{formatCurrency(stats.stats?.totalAmountCollected)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-2xl">📦</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Net Payment</p>
                <p className="text-xl font-semibold">{formatCurrency(stats.stats?.totalNetPayment)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">📈</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Average Recovery</p>
                <p className="text-xl font-semibold">{formatCurrency(stats.stats?.averageRecovery)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold mb-4">🔍 Filters</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading && (
            <div className="col-span-full flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-gray-600">Applying filters...</span>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Shopkeeper</label>
            <select
              value={filters.shopkeeperId}
              onChange={(e) => handleFilterChange('shopkeeperId', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Shopkeepers</option>
              {shopkeepers.map(shopkeeper => (
                <option key={shopkeeper._id} value={shopkeeper._id}>
                  {shopkeeper.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Salesman</label>
            <select
              value={filters.salesmanId}
              onChange={(e) => handleFilterChange('salesmanId', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Salesmen</option>
              {salesmen.map(salesman => (
                <option key={salesman._id} value={salesman._id}>
                  {salesman.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recovery Type</label>
            <select
              value={filters.recoveryType}
              onChange={(e) => handleFilterChange('recoveryType', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              <option value="payment_only">Payment Only</option>
              <option value="payment_with_items">Payment with Items</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-end space-x-4">
            <button
              onClick={fetchData}
              className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              🔍  Filters
            </button>
            <button
              onClick={clearFilters}
              className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              🗑️ Clear
            </button>
          </div>
        </div>
      </div>

      {/* Recoveries List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">📋 Recovery Records ({pagination.total || 0})</h3>
        </div>

        {recoveries.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Recovery Records Found</h3>
            <p className="text-gray-600">No recovery records match your current filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Desktop Table View */}
            <table className="hidden sm:table w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recovery ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shopkeeper</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salesman</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recoveries.map((recovery) => (
                  <tr key={recovery._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {recovery._id.slice(-8)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(recovery.recoveryDate)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {recovery.shopkeeper?.name || 'N/A'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {recovery.salesman?.name || 'N/A'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        recovery.recoveryType === 'payment_only' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {recovery.recoveryType === 'payment_only' ? 'Payment Only' : 'With Items'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(recovery.amountCollected)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        recovery.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : recovery.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {recovery.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile Card View */}
            <div className="sm:hidden">
              {recoveries.map((recovery) => (
                <div key={recovery._id} className="p-4 border-b border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">Recovery #{recovery._id.slice(-8)}</h4>
                      <p className="text-sm text-gray-500">{formatDate(recovery.recoveryDate)}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      recovery.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : recovery.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {recovery.status}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Shopkeeper:</span>
                      <span className="font-medium">{recovery.shopkeeper?.name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Salesman:</span>
                      <span className="font-medium">{recovery.salesman?.name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Type:</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        recovery.recoveryType === 'payment_only' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {recovery.recoveryType === 'payment_only' ? 'Payment Only' : 'With Items'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Amount:</span>
                      <span className="font-bold text-green-600">{formatCurrency(recovery.amountCollected)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="p-4 border-t bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((pagination.current - 1) * pagination.limit) + 1} to {Math.min(pagination.current * pagination.limit, pagination.total)} of {pagination.total} results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleFilterChange('page', pagination.current - 1)}
                  disabled={pagination.current <= 1}
                  className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  Previous
                </button>
                <span className="px-3 py-1 bg-blue-500 text-white rounded-lg">
                  {pagination.current}
                </span>
                <button
                  onClick={() => handleFilterChange('page', pagination.current + 1)}
                  disabled={pagination.current >= pagination.pages}
                  className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecoveryManagement;
