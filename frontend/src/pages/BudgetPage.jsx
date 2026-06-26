import React, { useEffect, useState } from 'react';
import { getCurrentBudget, setBudget, getMonthlySummary } from '../utils/api';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function BudgetPage() {
  const [budgetData, setBudgetData] = useState(null);
  const [summary, setSummary] = useState(null);
  const [form, setForm] = useState({ month: format(new Date(), 'yyyy-MM'), amount: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const [b, s] = await Promise.all([getCurrentBudget(), getMonthlySummary()]);
      setBudgetData(b.data);
      setSummary(s.data);
      if (b.data.budget > 0) setForm(f => ({ ...f, amount: String(b.data.budget) }));
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || parseFloat(form.amount) <= 0) { setError('Enter a valid budget amount'); return; }
    setSaving(true); setError('');
    try {
      await setBudget({ month: form.month, amount: parseFloat(form.amount) });
      await fetchData();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save budget');
    }
    setSaving(false);
  };

  const chartData = budgetData?.budget > 0 ? [
    { name: 'Budget', value: budgetData.budget, fill: 'var(--color-primary)' },
    { name: 'Spent', value: budgetData.spent, fill: budgetData.exceeded ? 'var(--color-error)' : 'var(--color-warning)' },
    { name: 'Remaining', value: Math.max(budgetData.remaining, 0), fill: 'var(--color-success)' },
  ] : [];

  const categoryData = summary
    ? Object.entries(summary.categoryBreakdown || {})
        .filter(([,v]) => v > 0)
        .sort((a,b) => b[1]-a[1])
        .map(([name, value]) => ({ name, value }))
    : [];

  const catColors = { food:'#01696f', travel:'#da7101', shopping:'#7a39bb', bills:'#006494', other:'#797876' };

  if (loading) return <div className="page-content"><div className="skeleton" style={{ height: 400, borderRadius: 12 }} /></div>;

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Budget</h1>
          <p className="page-subtitle">Manage and track your monthly spending limit</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="card">
          <h2 className="card-title">Set Monthly Budget</h2>
          {error && <div className="alert alert-error">{error}</div>}
          {saved && <div className="alert alert-success">✅ Budget saved successfully!</div>}
          <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
            <div className="form-group">
              <label htmlFor="month">Month</label>
              <input id="month" type="month" value={form.month}
                onChange={e => setForm(f => ({ ...f, month: e.target.value }))} />
            </div>
            <div className="form-group">
              <label htmlFor="budget-amount">Budget Amount (₹)</label>
              <input id="budget-amount" type="number" min="1" step="100" placeholder="e.g. 15000"
                value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={saving}>
              {saving ? 'Saving...' : 'Set Budget'}
            </button>
          </form>
        </div>

        <div className="card">
          <h2 className="card-title">This Month's Status</h2>
          {budgetData?.budget > 0 ? (
            <div style={{ marginTop: '1rem' }}>
              {budgetData.exceeded && (
                <div className="alert alert-warning" style={{ marginBottom: '1rem' }}>
                  ⚠️ Budget exceeded by ₹{Math.abs(budgetData.remaining).toLocaleString('en-IN')}
                </div>
              )}
              <div className="budget-stats">
                <div className="budget-stat">
                  <div className="budget-stat-label">Budget</div>
                  <div className="budget-stat-value">₹{budgetData.budget.toLocaleString('en-IN')}</div>
                </div>
                <div className="budget-stat">
                  <div className="budget-stat-label">Spent</div>
                  <div className="budget-stat-value" style={{ color: budgetData.exceeded ? 'var(--color-error)' : 'var(--color-warning)' }}>
                    ₹{budgetData.spent.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="budget-stat">
                  <div className="budget-stat-label">Remaining</div>
                  <div className="budget-stat-value" style={{ color: budgetData.exceeded ? 'var(--color-error)' : 'var(--color-success)' }}>
                    {budgetData.exceeded ? '-' : ''}₹{Math.abs(budgetData.remaining).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              <div className="progress-bar-track" style={{ marginTop: '1rem' }}>
                <div className="progress-bar-fill" style={{
                  width: `${Math.min((budgetData.spent / budgetData.budget) * 100, 100)}%`,
                  background: budgetData.exceeded ? 'var(--color-error)' : (budgetData.spent / budgetData.budget) > 0.8 ? 'var(--color-warning)' : 'var(--color-primary)',
                }} />
              </div>
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '2rem 0' }}>
              <div className="empty-icon">📊</div>
              <p>Set a budget to start tracking</p>
            </div>
          )}
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 className="card-title">Budget vs Spent</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-divider)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} axisLine={false} tickLine={false}
                tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={v => [`₹${v.toLocaleString('en-IN')}`, '']}
                contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8 }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={80}>
                {chartData.map(entry => <Cell key={entry.name} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {categoryData.length > 0 && (
        <div className="card">
          <h2 className="card-title">Category Spend This Month</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 20, left: 60, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-divider)" horizontal={false} />
              <XAxis type="number" tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} axisLine={false} tickLine={false}
                tickFormatter={v => `₹${(v/1000).toFixed(1)}k`} />
              <YAxis type="category" dataKey="name" tick={{ fill: 'var(--color-text)', fontSize: 13 }} axisLine={false} tickLine={false} />
              <Tooltip formatter={v => [`₹${v.toLocaleString('en-IN')}`, 'Amount']}
                contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8 }} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={28}>
                {categoryData.map(entry => <Cell key={entry.name} fill={catColors[entry.name]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
