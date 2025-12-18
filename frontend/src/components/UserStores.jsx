import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { useNavigate } from 'react-router-dom';

export default function UserStores() {
  const [stores, setStores] = useState([]);
  const [filters, setFilters] = useState({ name: '', address: '' });
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [selectedStore, setSelectedStore] = useState(null);
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const { token, logout, user } = useAuth();
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

  const openRatingModal = (store) => {
    setSelectedStore(store);
    setRating(store.user_rating || 0);
  };

  const closeRatingModal = () => {
    setSelectedStore(null);
    setRating(0);
  };

  const handleSubmitRating = async () => {
    if (rating < 1 || rating > 5) {
      alert('Please select a rating between 1 and 5');
      return;
    }

    try {
      const result = await api.ratings.submit({ storeId: selectedStore.id, rating }, token);
      alert(result.message);
      closeRatingModal();
      fetchStores();
    } catch (err) {
      alert('Failed to submit rating');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow p-4 mb-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Stores</h1>
            <p className="text-sm text-gray-600">Welcome, {user?.name}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/user/password')}
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
        <h2 className="text-2xl font-bold mb-6">Browse Stores</h2>

        <div className="bg-white p-4 rounded shadow mb-6">
          <h3 className="font-bold mb-4">Search</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              name="name"
              placeholder="Search by name"
              value={filters.name}
              onChange={handleFilterChange}
              className="px-3 py-2 border rounded"
            />
            <input
              type="text"
              name="address"
              placeholder="Search by address"
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
                <th className="p-3 text-left">Store Name</th>
                <th className="p-3 text-left">Address</th>
                <th className="p-3 text-left">Overall Rating</th>
                <th className="p-3 text-left">Your Rating</th>
                <th className="p-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-3 text-center">Loading...</td>
                </tr>
              ) : stores.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-3 text-center">No stores found</td>
                </tr>
              ) : (
                stores.map((store) => (
                  <tr key={store.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">{store.name}</td>
                    <td className="p-3">{store.address}</td>
                    <td className="p-3">
                      <span className="text-yellow-600">{parseFloat(store.rating).toFixed(1)}</span>
                    </td>
                    <td className="p-3">
                      {store.user_rating ? (
                        <span className="text-blue-600">{store.user_rating}</span>
                      ) : (
                        <span className="text-gray-400">Not rated</span>
                      )}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => openRatingModal(store)}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                      >
                        {store.user_rating ? 'Update Rating' : 'Rate Store'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedStore && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Rate {selectedStore.name}</h3>
            
            <div className="mb-4">
              <label className="block mb-2">Select Rating (1-5)</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    onClick={() => setRating(num)}
                    className={`w-12 h-12 rounded ${
                      rating === num ? 'bg-yellow-500 text-white' : 'bg-gray-200'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleSubmitRating}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Submit
              </button>
              <button
                onClick={closeRatingModal}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}