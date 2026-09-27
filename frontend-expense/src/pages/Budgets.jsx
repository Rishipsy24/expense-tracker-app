import { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBudget, setCurrentBudget] = useState(null);
  
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const [formData, setFormData] = useState({ 
    category_id: '', 
    amount: '', 
    month: currentMonth, 
    year: currentYear 
  });

  const fetchData = async () => {
    try {
      const [budgetsRes, categoriesRes] = await Promise.all([
        api.get('/budgets'),
        api.get('/categories')
      ]);
      setBudgets(budgetsRes.data.data);
      setCategories(categoriesRes.data.data.filter(c => c.type === 'expense'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentBudget) {
        await api.put(`/budgets/${currentBudget.id}`, { amount: formData.amount });
      } else {
        await api.post('/budgets', formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save budget');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this budget?')) {
      try {
        await api.delete(`/budgets/${id}`);
        fetchData();
      } catch (err) {
        alert('Failed to delete budget');
      }
    }
  };

  const openModal = (budget = null) => {
    if (budget) {
      setCurrentBudget(budget);
      setFormData({ 
        category_id: budget.category_id, 
        amount: budget.amount, 
        month: budget.month, 
        year: budget.year 
      });
    } else {
      setCurrentBudget(null);
      setFormData({ category_id: categories[0]?.id || '', amount: '', month: currentMonth, year: currentYear });
    }
    setIsModalOpen(true);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="card-header" style={{ marginBottom: 24 }}>
        <h1>Monthly Budgets</h1>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={18} /> Create Budget
        </button>
      </div>

      <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {budgets.length > 0 ? budgets.map((budget) => (
          <div key={budget.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>{budget.categories?.name}</h3>
              <div>
                <button className="btn" style={{ padding: '4px' }} onClick={() => openModal(budget)}>
                  <Edit2 size={16} />
                </button>
                <button className="btn text-danger" style={{ padding: '4px' }} onClick={() => handleDelete(budget.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 8 }}>
              {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
            </div>
            
            <div style={{ width: '100%', height: '8px', backgroundColor: '#E5E7EB', borderRadius: '4px', overflow: 'hidden', marginBottom: 8 }}>
              <div style={{ 
                height: '100%', 
                width: `${Math.min(budget.percentage, 100)}%`, 
                backgroundColor: budget.exceeded ? 'var(--danger)' : 'var(--primary)'
              }} />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span>{budget.percentage}% Used</span>
              {budget.exceeded && <span className="text-danger font-semibold">Budget exceeded</span>}
            </div>
          </div>
        )) : (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>No budgets created yet.</div>
        )}
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
            <h2 style={{ marginBottom: 16 }}>{currentBudget ? 'Edit' : 'Create'} Budget</h2>
            <form onSubmit={handleSubmit}>
              
              {!currentBudget && (
                <div className="input-group">
                  <label>Category</label>
                  <select value={formData.category_id} onChange={(e) => setFormData({...formData, category_id: e.target.value})} required>
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              )}

              <div className="input-group">
                <label>Amount</label>
                <input type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} required min="0.01" />
              </div>
              
              <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Budgets;
