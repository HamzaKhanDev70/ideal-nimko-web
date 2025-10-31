import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { api } from '../../utils/api';

export default function AssignmentManagement() {
  const [assignments, setAssignments] = useState([]);
  const [salesmen, setSalesmen] = useState([]);
  const [shopkeepers, setShopkeepers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    salesmanId: '',
    shopkeeperId: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        console.error('No authentication token found');
        setLoading(false);
        return;
      }

      const [assignmentsResponse, salesmenResponse, shopkeepersResponse] = await Promise.all([
        axios.get(api.assignments.getAll(), {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get(api.assignments.getAvailableSalesmen(), {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get(api.assignments.getAvailableShopkeepers(), {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
console.log(assignmentsResponse.data,'assignmentsResponse');
      setAssignments(assignmentsResponse.data.assignments || []);
      setSalesmen(salesmenResponse.data.salesmen || []);
      setShopkeepers(shopkeepersResponse.data.shopkeepers || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Error loading data: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.post(api.assignments.create(), formData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      alert('Assignment created successfully!');
      setShowForm(false);
      setFormData({ salesmanId: '', shopkeeperId: '', notes: '' });
      fetchData();
    } catch (error) {
      console.error('Error creating assignment:', error);
      alert('Error creating assignment: ' + (error.response?.data?.error || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (assignmentId) => {
    if (!confirm('Are you sure you want to deactivate this assignment?')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(api.assignments.delete(assignmentId), {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      alert('Assignment deactivated successfully!');
      fetchData();
    } catch (error) {
      console.error('Error deactivating assignment:', error);
      alert('Error deactivating assignment: ' + (error.response?.data?.error || error.message));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading assignments...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Shop-Salesman Assignments</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Create New Assignment
        </button>
      </div>

      {/* Assignment Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Create New Assignment</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Salesman
                </label>
                <select
                  value={formData.salesmanId}
                  onChange={(e) => setFormData({...formData, salesmanId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Choose a salesman...</option>
                  {salesmen.map(salesman => (
                    <option key={salesman._id} value={salesman._id}>
                      {salesman.name} - {salesman.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Shopkeeper
                </label>
                <select
                  value={formData.shopkeeperId}
                  onChange={(e) => setFormData({...formData, shopkeeperId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Choose a shopkeeper...</option>
                  {shopkeepers.map(shopkeeper => (
                    <option key={shopkeeper._id} value={shopkeeper._id}>
                      {shopkeeper.name} - {shopkeeper.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Any additional notes..."
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Assignment'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assignments List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {assignments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No assignments found. Create your first assignment above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Salesman
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shopkeeper
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assignments.map((assignment) => (
                  <tr key={assignment._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {assignment.salesmanId?.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {assignment.salesmanId?.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {assignment.shopkeeperId?.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {assignment.shopkeeperId?.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {assignment.assignedBy?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(assignment.assignedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {assignment.notes || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDeactivate(assignment._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Deactivate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
