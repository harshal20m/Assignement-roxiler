import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await api.dashboard.getStats(token);
      setStats(data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch stats');
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow p-4 mb-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/admin/users')}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Manage Users
            </button>
            <button
              onClick={() => navigate('/admin/stores')}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Manage Stores
            </button>
            <button
              onClick={() => navigate('/admin/password')}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Change Password
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
        <h2 className="text-2xl font-bold mb-6">Statistics</h2>
        
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded shadow">
            <p className="text-gray-600 text-sm mb-2">Total Users</p>
            <p className="text-3xl font-bold text-blue-600">{stats?.totalUsers || 0}</p>
          </div>
          
          <div className="bg-white p-6 rounded shadow">
            <p className="text-gray-600 text-sm mb-2">Total Stores</p>
            <p className="text-3xl font-bold text-green-600">{stats?.totalStores || 0}</p>
          </div>
          
          <div className="bg-white p-6 rounded shadow">
            <p className="text-gray-600 text-sm mb-2">Total Ratings</p>
            <p className="text-3xl font-bold text-purple-600">{stats?.totalRatings || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
}