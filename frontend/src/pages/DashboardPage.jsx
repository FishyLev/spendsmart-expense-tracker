import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCurrentBudget, getMonthlySummary } from '../utils/api';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const CATEGORY_COLORS = {
  food: '#01696f', travel: '#da7101', shopping: '#7a39bb',
  bills: '#006494', other: '#797876',
};
const CATEGORY_ICONS = { food: '🍽️', travel: '✈️', shopping: '🛍️', bills: '📄', other: '💼' };

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [budget, setBudget] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [b, s] = await Promise.all([getCurrentBudget(), getMonthlySummary()]);
        setBudget(b.data);
        setSummary(s.data);
      } catch {}
      setLoading(false);
    })();
  }, []);

  const pieData = summary
    ? Object.entries(summary.categoryBreakdown || {})
        .filter(([, v]) => v > 0)
        .map(([name, value]) => ({ name, value }))
    : [];

  const budgetPct = budget && budget.budget > 0
    ? Math.min((budget.spent / budget.budget) * 100, 100)
    : 0;

  if (loading) return (
    <div className="page-content">
      <div className="skeleton skeleton-heading" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginTop: '1.5rem' }}>
        {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 12 }} />)}
      </div>
    </div>
  );

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Good {getGreeting()}, {user?.name?.split(' ')[0]} </h1>
          <p className="page-subtitle">Here's your spending overview for {getMonthName()}</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/expenses/new')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
          Add Expense
        </button>
      </div>

      {budget?.exceeded && (
        <div className="alert alert-warning" style={{ marginBottom: '1.5rem' }}>
          ⚠️ <strong>Budget Exceeded!</strong> You've spent ₹{Math.abs(budget.remaining).toLocaleString('en-IN')} over your monthly budget.
        </div>
      )}

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Total Spent</div>
          <div className="kpi-value">₹{(summary?.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          <div className="kpi-meta">{summary?.count || 0} transactions this month</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Monthly Budget</div>
          <div className="kpi-value" style={{ color: budget?.budget ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
            {budget?.budget ? `₹${budget.budget.toLocaleString('en-IN')}` : 'Not set'}
          </div>
          <div className="kpi-meta">
            {budget?.budget ? (
              <span className={budget.exceeded ? 'text-error' : 'text-success'}>
                {budget.exceeded ? `Over by ₹${Math.abs(budget.remaining).toLocaleString('en-IN')}` : `₹${budget.remaining.toLocaleString('en-IN')} remaining`}
              </span>
            ) : (
              <button className="link-btn" onClick={() => navigate('/budget')}>Set a budget →</button>
            )}
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Top Category</div>
          <div className="kpi-value" style={{ fontSize: 'var(--text-lg)' }}>
            {pieData.length > 0
              ? `${CATEGORY_ICONS[pieData.sort((a,b)=>b.value-a.value)[0].name]} ${pieData[0].name}`
              : '—'}
          </div>
          <div className="kpi-meta">
            {pieData.length > 0 ? `₹${pieData[0].value.toLocaleString('en-IN')} spent` : 'No data yet'}
          </div>
        </div>
      </div>

      {budget?.budget > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header">
            <span>Budget Progress</span>
            <span className="badge">{getMonthName()}</span>
          </div>
          <div style={{ marginTop: '0.75rem' }}>
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{
                width: `${budgetPct}%`,
                background: budget.exceeded ? 'var(--color-error)' : budgetPct > 80 ? 'var(--color-warning)' : 'var(--color-primary)',
              }} />
            </div>
            <div className="progress-labels">
              <span>₹{budget.spent.toLocaleString('en-IN')} spent</span>
              <span>{budgetPct.toFixed(0)}%</span>
              <span>₹{budget.budget.toLocaleString('en-IN')} budget</span>
            </div>
          </div>
        </div>
      )}

      {pieData.length > 0 && (
        <div className="card">
          <div className="card-header">Category Breakdown</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'center' }}>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                  dataKey="value" paddingAngle={3}>
                  {pieData.map(entry => (
                    <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `₹${v.toLocaleString('en-IN')}`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="category-list">
              {pieData.sort((a,b)=>b.value-a.value).map(({ name, value }) => (
                <div key={name} className="category-row">
                  <span className="cat-dot" style={{ background: CATEGORY_COLORS[name] }} />
                  <span className="cat-name">{CATEGORY_ICONS[name]} {name}</span>
                  <span className="cat-amount">₹{value.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {pieData.length === 0 && !loading && (
        <div className="empty-state">
          <div className="empty-icon">💸</div>
          <h3>No expenses yet</h3>
          <p>Add your first expense to see insights here</p>
          <button className="btn btn-primary" onClick={() => navigate('/expenses/new')}>Add Expense</button>
        </div>
      )}
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
function getMonthName() {
  return new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}
