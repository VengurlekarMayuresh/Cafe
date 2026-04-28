import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', phone: '', password: '', building: '', flat: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/login', { state: { message: 'Registration successful! Awaiting admin approval.' } });
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})}
              className="w-full border rounded px-3 py-2" required />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input type="text" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})}
              className="w-full border rounded px-3 py-2" required />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Password</label>
            <input type="password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})}
              className="w-full border rounded px-3 py-2" required />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Building</label>
            <input type="text" value={form.building} onChange={(e) => setForm({...form, building: e.target.value})}
              className="w-full border rounded px-3 py-2" />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">Flat</label>
            <input type="text" value={form.flat} onChange={(e) => setForm({...form, flat: e.target.value})}
              className="w-full border rounded px-3 py-2" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm">
          Already have an account? <Link to="/login" className="text-blue-600">Login</Link>
        </p>
      </div>
    </div>
  );
}
