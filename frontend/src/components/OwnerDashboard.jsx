import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { useNavigate } from 'react-router-dom';

export default function OwnerDashboard() {
  const [storeData, setStoreData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token, logout, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStoreData();
  }, []);

  const fetchStoreData = async () => {
    try {
      const data = await api.stores.getMyStore(token);
      setStoreData(data);
    } catch (err) {
      console.error('Failed to fetch store data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!storeData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded shadow">
          <h2 className="text-xl font-bold mb-4">No Store Found</h2>
          <p className="mb-4">You don't have a store assigned yet.</p>
          <button 
            onClick={() => { logout(); navigate('/login'); }}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow p-4 mb-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Store Owner Dashboard</h1>
            <p className="text-sm text-gray-600">Welcome, {user?.name}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/owner/password')}
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
        <div className="bg-white p-6 rounded shadow mb-6">
          <h2 className="text-2xl font-bold mb-4">Store Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600 text-sm">Store Name</p>
              <p className="font-bold">{storeData.store.name}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Email</p>
              <p className="font-bold">{storeData.store.email}</p>
            </div>
            <div className="col-span-2">
              <p className="text-gray-600 text-sm">Address</p>
              <p className="font-bold">{storeData.store.address}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Average Rating</p>
              <p className="text-2xl font-bold text-yellow-600">
                {parseFloat(storeData.store.rating).toFixed(1)}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total Ratings</p>
              <p className="text-2xl font-bold text-blue-600">
                {storeData.store.total_ratings}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-bold mb-4">Users Who Rated Your Store</h2>
          
          {storeData.raters.length === 0 ? (
            <p className="text-gray-600">No ratings yet.</p>
          ) : (
            <div className="overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="p-3 text-left">User Name</th>
                    <th className="p-3 text-left">Email</th>
                    <th className="p-3 text-left">Rating</th>
                    <th className="p-3 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {storeData.raters.map((rater) => (
                    <tr key={rater.id} className="border-t hover:bg-gray-50">
                      <td className="p-3">{rater.name}</td>
                      <td className="p-3">{rater.email}</td>
                      <td className="p-3">
                        <span className="text-yellow-600">{rater.rating}</span>
                      </td>
                      <td className="p-3">
                        {new Date(rater.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}