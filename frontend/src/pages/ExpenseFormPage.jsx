import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { addExpense, updateExpense, getExpenses } from '../utils/api';
import DatePicker from 'react-datepicker';
import { format, parseISO } from 'date-fns';

const CATEGORIES = ['food', 'travel', 'shopping', 'bills', 'other'];
const CATEGORY_ICONS = { food:'🍽️', travel:'✈️', shopping:'🛍️', bills:'📄', other:'💼' };

const defaultForm = { title: '', amount: '', category: 'food', date: new Date(), notes: '' };

export default function ExpenseFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const { data } = await getExpenses();
        const expense = data.expenses.find(e => e._id === id);
        if (expense) {
          setForm({ ...expense, date: new Date(expense.date), amount: String(expense.amount) });
        }
      } catch {}
      setFetching(false);
    })();
  }, [id, isEdit]);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.amount || isNaN(form.amount) || parseFloat(form.amount) <= 0) e.amount = 'Enter a valid amount';
    if (!form.category) e.category = 'Select a category';
    return e;
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const payload = { ...form, amount: parseFloat(form.amount), date: format(form.date, 'yyyy-MM-dd') };
      if (isEdit) await updateExpense(id, payload);
      else await addExpense(payload);
      navigate('/expenses');
    } catch (err) {
      const serverErrors = err.response?.data?.errors;
      if (serverErrors) {
        const e = {};
        serverErrors.forEach(se => { e[se.param] = se.msg; });
        setErrors(e);
      } else {
        setErrors({ general: err.response?.data?.message || 'Something went wrong' });
      }
    }
    setLoading(false);
  };

  if (fetching) return <div className="page-content"><div className="skeleton" style={{ height: 400, borderRadius: 12 }} /></div>;

  return (
    <div className="page-content page-content-narrow">
      <div className="page-header">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Back
        </button>
      </div>

      <div className="card">
        <h1 className="card-title">{isEdit ? 'Edit Expense' : 'Add New Expense'}</h1>

        {errors.general && <div className="alert alert-error">{errors.general}</div>}

        <form onSubmit={handleSubmit} className="expense-form">
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input id="title" type="text" placeholder="e.g. Lunch at Dominos" value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className={errors.title ? 'input-error' : ''} />
            {errors.title && <span className="field-error">{errors.title}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="amount">Amount (₹) *</label>
              <input id="amount" type="number" step="0.01" min="0.01" placeholder="0.00" value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                className={errors.amount ? 'input-error' : ''} />
              {errors.amount && <span className="field-error">{errors.amount}</span>}
            </div>
            <div className="form-group">
              <label>Date *</label>
              <DatePicker selected={form.date} onChange={d => setForm(f => ({ ...f, date: d }))}
                dateFormat="dd/MM/yyyy" className="date-input-full" maxDate={new Date()} />
            </div>
          </div>

          <div className="form-group">
            <label>Category *</label>
            <div className="category-picker">
              {CATEGORIES.map(c => (
                <button key={c} type="button"
                  className={`cat-btn ${form.category === c ? 'cat-btn-active' : ''}`}
                  onClick={() => setForm(f => ({ ...f, category: c }))}>
                  {CATEGORY_ICONS[c]} {c.charAt(0).toUpperCase() + c.slice(1)}
                </button>
              ))}
            </div>
            {errors.category && <span className="field-error">{errors.category}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes <span className="label-hint">(optional)</span></label>
            <textarea id="notes" rows={3} placeholder="Any additional details..." value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : isEdit ? 'Update Expense' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
