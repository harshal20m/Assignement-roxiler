import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { useNavigate } from 'react-router-dom';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    role: 'user',
    storeName: '',
    storeEmail: '',
    storeAddress: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, [filters, sortBy, sortOrder]);

  const fetchUsers = async () => {
    try {
      const data = await api.users.getAll(token, { ...filters, sortBy, sortOrder });
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (name === 'role' && value !== 'store_owner') {
      setFormData(prev => ({
        ...prev,
        role: value,
        storeName: '',
        storeEmail: '',
        storeAddress: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.role === 'store_owner') {
      if (!formData.storeName || !formData.storeEmail || !formData.storeAddress) {
        setError('Store details are required for Store Owner role');
        return;
      }

      try {
        const storeData = {
          name: formData.storeName,
          email: formData.storeEmail,
          address: formData.storeAddress,
          ownerName: formData.name,
          ownerEmail: formData.email,
          ownerPassword: formData.password,
          ownerAddress: formData.address
        };
        
        const result = await api.stores.create(storeData, token);
        if (result.message === 'Store created successfully') {
          alert('Store owner and store created successfully');
          setShowForm(false);
          setFormData({ 
            name: '', 
            email: '', 
            password: '', 
            address: '', 
            role: 'user',
            storeName: '',
            storeEmail: '',
            storeAddress: ''
          });
          fetchUsers();
        } else {
          setError(result.message || 'Failed to create store owner');
        }
      } catch (err) {
        setError('Failed to create store owner');
      }
    } else {
      try {
        const userData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          address: formData.address,
          role: formData.role
        };
        
        const result = await api.users.create(userData, token);
        if (result.message === 'User created successfully') {
          alert('User created successfully');
          setShowForm(false);
          setFormData({ 
            name: '', 
            email: '', 
            password: '', 
            address: '', 
            role: 'user',
            storeName: '',
            storeEmail: '',
            storeAddress: ''
          });
          fetchUsers();
        } else {
          setError(result.message || 'Failed to create user');
        }
      } catch (err) {
        setError('Failed to create user');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow p-4 mb-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Manage Users</h1>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate('/admin/stores')}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Manage Stores
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
          <h2 className="text-2xl font-bold">Users List</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            {showForm ? 'Cancel' : 'Add User'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white p-6 rounded shadow mb-6">
            <h3 className="text-xl font-bold mb-4">Add New User</h3>
            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <h4 className="font-bold mb-3">User Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2">Name</label>
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
                    <label className="block mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-2">Password</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-2">Role</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border rounded"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="store_owner">Store Owner</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block mb-2">Address</label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border rounded"
                      rows="3"
                      required
                    />
                  </div>
                </div>
              </div>

              {formData.role === 'store_owner' && (
                <div className="mb-6">
                  <h4 className="font-bold mb-3">Store Details</h4>
                  <div className="bg-blue-50 p-4 rounded mb-4">
                    <p className="text-sm">Store will be created automatically with this owner.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2">Store Name</label>
                      <input
                        type="text"
                        name="storeName"
                        value={formData.storeName}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 border rounded"
                        required
                      />
                    </div>
                    <div>
                      <label className="block mb-2">Store Email</label>
                      <input
                        type="email"
                        name="storeEmail"
                        value={formData.storeEmail}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 border rounded"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block mb-2">Store Address</label>
                      <textarea
                        name="storeAddress"
                        value={formData.storeAddress}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 border rounded"
                        rows="3"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {formData.role === 'store_owner' ? 'Create Store Owner & Store' : 'Create User'}
              </button>
            </form>
          </div>
        )}

        <div className="bg-white p-4 rounded shadow mb-6">
          <h3 className="font-bold mb-4">Filters</h3>
          <div className="grid grid-cols-4 gap-4">
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
              name="email"
              placeholder="Filter by email"
              value={filters.email}
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
            <select
              name="role"
              value={filters.role}
              onChange={handleFilterChange}
              className="px-3 py-2 border rounded"
            >
              <option value="">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="store_owner">Store Owner</option>
            </select>
          </div>
          <div className="mt-4 flex gap-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border rounded"
            >
              <option value="name">Sort by Name</option>
              <option value="email">Sort by Email</option>
              <option value="address">Sort by Address</option>
              <option value="role">Sort by Role</option>
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
                <th className="p-3 text-left">Role</th>
                <th className="p-3 text-left">Rating</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-3 text-center">Loading...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-3 text-center">No users found</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">{user.name}</td>
                    <td className="p-3">{user.email}</td>
                    <td className="p-3">{user.address}</td>
                    <td className="p-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                        {user.role}
                      </span>
                    </td>
                    <td className="p-3">
                      {user.role === 'store_owner' ? (
                        <span className="text-yellow-600">{parseFloat(user.rating).toFixed(1)}</span>
                      ) : (
                        'N/A'
                      )}
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