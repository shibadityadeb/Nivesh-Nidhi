import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthCard from '../components/AuthCard';
import InputField from '../components/InputField';
import { loginUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm]     = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading]   = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
    setApiError('');
  };

  const validate = () => {
    const errs = {};
    if (!form.email)    errs.email    = 'Email is required';
    if (!form.password) errs.password = 'Password is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const res = await loginUser(form);
      login(res.data.data.token, res.data.data.user);
      navigate('/dashboard');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Welcome back" subtitle="Sign in to your NiveshNidhi account">
      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <InputField
          label="Email address"
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
          autoComplete="email"
        />
        <InputField
          label="Password"
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
          autoComplete="current-password"
        />

        {apiError && <div className="api-error">{apiError}</div>}

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? <span className="spinner" /> : 'Sign In'}
        </button>

        <p className="auth-switch">
          Don&apos;t have an account?{' '}
          <Link to="/signup">Create one</Link>
        </p>
      </form>
    </AuthCard>
  );
};

export default Login;
