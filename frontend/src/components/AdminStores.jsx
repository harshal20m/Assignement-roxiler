import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { useNavigate } from 'react-router-dom';

export default function AdminStores() {
  const [stores, setStores] = useState([]);
  const [filters, setFilters] = useState({ name: '', address: '' });
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    ownerName: '',
    ownerEmail: '',
    ownerPassword: '',
    ownerAddress: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStores();
  }, [filters, sortBy, sortOrder]);

  const fetchStores = async () => {
    try {
      const data = await api.stores.getAll(token, { ...filters, sortBy, sortOrder });
      setStores(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch stores');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const result = await api.stores.create(formData, token);
      if (result.message === 'Store created successfully') {
        alert('Store created successfully');
        setShowForm(false);
        setFormData({
          name: '',
          email: '',
          address: '',
          ownerName: '',
          ownerEmail: '',
          ownerPassword: '',
          ownerAddress: ''
        });
        fetchStores();
      } else {
        setError(result.message || 'Failed to create store');
      }
    } catch (err) {
      setError('Failed to create store');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow p-4 mb-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Manage Stores</h1>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate('/admin/users')}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Manage Users
            </button>
            <button 
              onClick={() => { logout(); navigate('/login'); }}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Stores List</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            {showForm ? 'Cancel' : 'Add Store'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white p-6 rounded shadow mb-6">
            <h3 className="text-xl font-bold mb-4">Add New Store</h3>
            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <h4 className="font-bold mb-3">Store Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2">Store Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-2">Store Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border rounded"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block mb-2">Store Address</label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border rounded"
                      rows="2"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-bold mb-3">Store Owner Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2">Owner Name</label>
                    <input
                      type="text"
                      name="ownerName"
                      value={formData.ownerName}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-2">Owner Email</label>
                    <input
                      type="email"
                      name="ownerEmail"
                      value={formData.ownerEmail}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-2">Owner Password</label>
                    <input
                      type="password"
                      name="ownerPassword"
                      value={formData.ownerPassword}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-2">Owner Address</label>
                    <textarea
                      name="ownerAddress"
                      value={formData.ownerAddress}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border rounded"
                      rows="2"
                      required
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Create Store
              </button>
            </form>
          </div>
        )}

        <div className="bg-white p-4 rounded shadow mb-6">
          <h3 className="font-bold mb-4">Filters</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              name="name"
              placeholder="Filter by name"
              value={filters.name}
              onChange={handleFilterChange}
              className="px-3 py-2 border rounded"
            />
            <input
              type="text"
              name="address"
              placeholder="Filter by address"
              value={filters.address}
              onChange={handleFilterChange}
              className="px-3 py-2 border rounded"
            />
          </div>
          <div className="flex gap-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border rounded"
            >
              <option value="name">Sort by Name</option>
              <option value="email">Sort by Email</option>
              <option value="address">Sort by Address</option>
              <option value="rating">Sort by Rating</option>
            </select>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-3 py-2 border rounded"
            >
              <option value="ASC">Ascending</option>
              <option value="DESC">Descending</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Address</th>
                <th className="p-3 text-left">Rating</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-3 text-center">Loading...</td>
                </tr>
              ) : stores.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-3 text-center">No stores found</td>
                </tr>
              ) : (
                stores.map((store) => (
                  <tr key={store.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">{store.name}</td>
                    <td className="p-3">{store.email}</td>
                    <td className="p-3">{store.address}</td>
                    <td className="p-3">
                      <span className="text-yellow-600">{parseFloat(store.rating).toFixed(1)}</span>
                      <span className="text-gray-500 text-sm ml-2">
                        ({store.total_ratings} ratings)
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}