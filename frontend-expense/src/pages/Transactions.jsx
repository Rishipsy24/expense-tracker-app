import { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Edit2, Trash2, Search, Filter } from 'lucide-react';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTx, setCurrentTx] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');

  const [formData, setFormData] = useState({ 
    type: 'expense', 
    title: '', 
    amount: '', 
    category_id: '', 
    transaction_date: new Date().toISOString().split('T')[0],
    payment_method: '',
    description: ''
  });

  const fetchData = async () => {
    try {
      let url = `/transactions?page=${page}&limit=10`;
      if (typeFilter) url += `&type=${typeFilter}`;
      if (search) url += `&search=${search}`;
      
      const [txRes, catRes] = await Promise.all([
        api.get(url),
        api.get('/categories')
      ]);
      setTransactions(txRes.data.data);
      setTotalPages(txRes.data.pagination.totalPages);
      setCategories(catRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, typeFilter, search]); // Re-fetch on filter change

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSubmit = { ...formData };
      if (!dataToSubmit.category_id) delete dataToSubmit.category_id;
      
      if (currentTx) {
        await api.put(`/transactions/${currentTx.id}`, dataToSubmit);
      } else {
        await api.post('/transactions', dataToSubmit);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save transaction');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this transaction?')) {
      try {
        await api.delete(`/transactions/${id}`);
        fetchData();
      } catch (err) {
        alert('Failed to delete transaction');
      }
    }
  };

  const openModal = (tx = null) => {
    if (tx) {
      setCurrentTx(tx);
      setFormData({ 
        type: tx.type, 
        title: tx.title,
        amount: tx.amount,
        category_id: tx.category_id || '',
        transaction_date: tx.transaction_date,
        payment_method: tx.payment_method || '',
        description: tx.description || ''
      });
    } else {
      setCurrentTx(null);
      setFormData({ 
        type: 'expense', 
        title: '', 
        amount: '', 
        category_id: '', 
        transaction_date: new Date().toISOString().split('T')[0],
        payment_method: '',
        description: ''
      });
    }
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="card-header" style={{ marginBottom: 24 }}>
        <h1>Transactions</h1>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={18} /> Add Transaction
        </button>
      </div>

      <div className="card" style={{ marginBottom: 24, padding: 16 }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div className="input-group" style={{ flex: 1, minWidth: 200, marginBottom: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '0 12px', borderRadius: 8 }}>
              <Search size={16} color="var(--text-muted)" />
              <input 
                type="text" 
                placeholder="Search transactions..." 
                value={search}
                onChange={(e) => {setSearch(e.target.value); setPage(1);}}
                style={{ border: 'none', outline: 'none', padding: '10px', width: '100%' }}
              />
            </div>
          </div>
          <div className="input-group" style={{ width: 150, marginBottom: 0 }}>
            <select value={typeFilter} onChange={(e) => {setTypeFilter(e.target.value); setPage(1);}} style={{ height: '40px' }}>
              <option value="">All Types</option>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        {transactions.length > 0 ? (
          <>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Method</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id}>
                      <td>{new Date(tx.transaction_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                      <td className="font-semibold">
                        <div>{tx.title}</div>
                        {tx.description && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{tx.description}</div>}
                      </td>
                      <td>{tx.categories?.name || '-'}</td>
                      <td>{tx.payment_method || '-'}</td>
                      <td>
                        <span style={{ 
                          padding: '4px 8px', 
                          borderRadius: 99, 
                          fontSize: 12, 
                          backgroundColor: tx.type === 'income' ? '#ECFDF5' : '#FEF2F2',
                          color: tx.type === 'income' ? 'var(--success)' : 'var(--danger)'
                        }}>
                          {tx.type}
                        </span>
                      </td>
                      <td className={`font-semibold ${tx.type === 'income' ? 'text-success' : 'text-danger'}`}>
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </td>
                      <td>
                        <button className="btn" style={{ padding: '4px' }} onClick={() => openModal(tx)}>
                          <Edit2 size={16} />
                        </button>
                        <button className="btn text-danger" style={{ padding: '4px' }} onClick={() => handleDelete(tx.id)}>
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
              <button 
                className="btn btn-secondary" 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                Previous
              </button>
              <span>Page {page} of {totalPages || 1}</span>
              <button 
                className="btn btn-secondary" 
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <div className="empty-state">No transactions found.</div>
        )}
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, overflowY: 'auto', padding: 20 }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginBottom: 16 }}>{currentTx ? 'Edit' : 'Add'} Transaction</h2>
            <form onSubmit={handleSubmit}>
              
              <div style={{ display: 'flex', gap: 16 }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label>Type</label>
                  <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value, category_id: ''})}>
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <label>Amount</label>
                  <input type="number" step="0.01" min="0.01" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} required />
                </div>
              </div>

              <div className="input-group">
                <label>Title</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required placeholder="E.g., Grocery Shopping" />
              </div>

              <div style={{ display: 'flex', gap: 16 }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label>Category</label>
                  <select value={formData.category_id} onChange={(e) => setFormData({...formData, category_id: e.target.value})}>
                    <option value="">Select category...</option>
                    {categories.filter(c => c.type === formData.type).map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <label>Date</label>
                  <input type="date" value={formData.transaction_date} onChange={(e) => setFormData({...formData, transaction_date: e.target.value})} required />
                </div>
              </div>

              <div className="input-group">
                <label>Payment Method</label>
                <select value={formData.payment_method} onChange={(e) => setFormData({...formData, payment_method: e.target.value})}>
                  <option value="">Select method...</option>
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="input-group">
                <label>Description (Optional)</label>
                <textarea rows="2" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
              </div>
              
              <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Transaction</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
