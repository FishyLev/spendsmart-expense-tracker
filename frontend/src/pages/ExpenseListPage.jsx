import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getExpenses, deleteExpense } from '../utils/api';
import DatePicker from 'react-datepicker';
import { format } from 'date-fns';

const CATEGORIES = ['food', 'travel', 'shopping', 'bills', 'other'];
const CATEGORY_COLORS = { food:'#01696f',travel:'#da7101',shopping:'#7a39bb',bills:'#006494',other:'#797876' };
const CATEGORY_ICONS = { food:'🍽️',travel:'✈️',shopping:'🛍️',bills:'📄',other:'💼' };

export default function ExpenseListPage() {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: '', from: null, to: null });
  const [deleting, setDeleting] = useState(null);
  const [total, setTotal] = useState(0);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.category) params.category = filters.category;
      if (filters.from) params.from = format(filters.from, 'yyyy-MM-dd');
      if (filters.to) params.to = format(filters.to, 'yyyy-MM-dd');
      const { data } = await getExpenses(params);
      setExpenses(data.expenses);
      setTotal(data.expenses.reduce((s, e) => s + e.amount, 0));
    } catch {}
    setLoading(false);
  }, [filters]);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    setDeleting(id);
    try {
      await deleteExpense(id);
      setExpenses(prev => prev.filter(e => e._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
    setDeleting(null);
  };

  const clearFilters = () => setFilters({ category: '', from: null, to: null });

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Expenses</h1>
          {!loading && <p className="page-subtitle">{expenses.length} expenses · Total: ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>}
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/expenses/new')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
          Add Expense
        </button>
      </div>

      <div className="filter-bar card">
        <div className="filter-row">
          <div className="form-group form-group-inline">
            <label>Category</label>
            <select value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}>
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_ICONS[c]} {c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
            </select>
          </div>
          <div className="form-group form-group-inline">
            <label>From</label>
            <DatePicker selected={filters.from} onChange={d => setFilters(f => ({ ...f, from: d }))}
              placeholderText="Start date" dateFormat="dd/MM/yyyy" className="date-input" isClearable />
          </div>
          <div className="form-group form-group-inline">
            <label>To</label>
            <DatePicker selected={filters.to} onChange={d => setFilters(f => ({ ...f, to: d }))}
              placeholderText="End date" dateFormat="dd/MM/yyyy" className="date-input" isClearable
              minDate={filters.from} />
          </div>
          {(filters.category || filters.from || filters.to) && (
            <button className="btn btn-ghost btn-sm" onClick={clearFilters}>Clear filters</button>
          )}
        </div>
      </div>

      {loading ? (
        <div>
          {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: 68, marginBottom: 8, borderRadius: 10 }} />)}
        </div>
      ) : expenses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>No expenses found</h3>
          <p>{filters.category || filters.from ? 'Try adjusting your filters' : 'Start by adding your first expense'}</p>
          <button className="btn btn-primary" onClick={() => navigate('/expenses/new')}>Add Expense</button>
        </div>
      ) : (
        <div className="expense-list">
          {expenses.map(exp => (
            <div key={exp._id} className="expense-item">
              <div className="expense-cat-icon" style={{ background: `${CATEGORY_COLORS[exp.category]}18`, color: CATEGORY_COLORS[exp.category] }}>
                {CATEGORY_ICONS[exp.category]}
              </div>
              <div className="expense-info">
                <div className="expense-title">{exp.title}</div>
                <div className="expense-meta">
                  <span className="badge badge-sm" style={{ background: `${CATEGORY_COLORS[exp.category]}15`, color: CATEGORY_COLORS[exp.category] }}>
                    {exp.category}
                  </span>
                  <span>{format(new Date(exp.date), 'dd MMM yyyy')}</span>
                  {exp.notes && <span className="expense-notes" title={exp.notes}>📝</span>}
                </div>
              </div>
              <div className="expense-amount">₹{exp.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
              <div className="expense-actions">
                <button className="icon-btn" onClick={() => navigate(`/expenses/edit/${exp._id}`)}
                  aria-label="Edit expense" title="Edit">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button className="icon-btn icon-btn-danger" onClick={() => handleDelete(exp._id)}
                  disabled={deleting === exp._id} aria-label="Delete expense" title="Delete">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
