import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup(form.name, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      const errs = err.response?.data?.errors;
      setError(errs ? errs.map(e => e.msg).join(', ') : err.response?.data?.message || 'Signup failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-label="SpendSmart logo">
            <rect width="40" height="40" rx="10" fill="var(--color-primary)"/>
            <path d="M20 8C13.37 8 8 13.37 8 20s5.37 12 12 12 12-5.37 12-12S26.63 8 20 8zm1.2 18.5v1.5h-2.4v-1.55C16.3 26.1 14.9 24.6 14.9 22.8h2.4c0 1.1.9 1.9 2.7 1.9 1.5 0 2.5-.7 2.5-1.8 0-.95-.7-1.55-2.8-2.05-2.5-.6-4.2-1.6-4.2-3.6 0-1.85 1.5-3.15 3.3-3.5V12h2.4v1.8c2.1.5 3.4 2 3.4 3.7h-2.4c0-1.1-.85-1.85-2.4-1.85-1.55 0-2.3.75-2.3 1.7 0 .9.7 1.45 2.9 2 2.6.6 4.1 1.7 4.1 3.7 0 1.9-1.4 3.25-3.3 3.45z" fill="white"/>
          </svg>
          <span>SpendSmart</span>
        </div>
        <h1>Create account</h1>
        <p className="auth-subtitle">Start tracking your expenses today</p>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input id="name" type="text" placeholder="Aaryan Jai" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" placeholder="you@example.com" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password <span className="label-hint">(min. 6 characters)</span></label>
            <input id="password" type="password" placeholder="••••••••" value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))} minLength={6} required />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
        <p className="auth-footer">Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
}
