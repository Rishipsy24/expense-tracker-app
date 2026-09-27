import { useState, useEffect } from 'react';
import api from '../services/api';
import { IndianRupee, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import './Dashboard.css';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await api.get('/dashboard/summary');
        setSummary(res.data.data);
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) {
    return <div className="loading-spinner">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  const { balance, totalIncome, totalExpenses, categoryBreakdown, monthlyTrend, recentTransactions } = summary;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p className="text-muted">Overview of your finances</p>
      </div>

      <div className="summary-cards">
        <div className="card summary-card">
          <div className="card-icon balance"><Wallet size={24} /></div>
          <div className="card-content">
            <h3>Total Balance</h3>
            <p className={`amount ${balance >= 0 ? 'text-success' : 'text-danger'}`}>
              {formatCurrency(balance)}
            </p>
          </div>
        </div>
        
        <div className="card summary-card">
          <div className="card-icon income"><TrendingUp size={24} /></div>
          <div className="card-content">
            <h3>Total Income</h3>
            <p className="amount text-success">{formatCurrency(totalIncome)}</p>
          </div>
        </div>

        <div className="card summary-card">
          <div className="card-icon expense"><TrendingDown size={24} /></div>
          <div className="card-content">
            <h3>Total Expenses</h3>
            <p className="amount text-danger">{formatCurrency(totalExpenses)}</p>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="card chart-card">
          <h3>Income vs Expenses (Last 6 Months)</h3>
          {monthlyTrend.length > 0 ? (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} tickFormatter={(val) => `₹${val/1000}k`} />
                  <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                  <Legend iconType="circle" />
                  <Line type="monotone" dataKey="income" name="Income" stroke="#10B981" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                  <Line type="monotone" dataKey="expense" name="Expenses" stroke="#EF4444" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
             <div className="empty-state">No trend data available</div>
          )}
        </div>

        <div className="card chart-card">
          <h3>Expenses by Category</h3>
          {categoryBreakdown.length > 0 ? (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                  <Legend iconType="circle" layout="vertical" verticalAlign="middle" align="right" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="empty-state">No category data available</div>
          )}
        </div>
      </div>

      <div className="card recent-transactions">
        <div className="card-header">
          <h3>Recent Transactions</h3>
        </div>
        <div className="table-container">
          {recentTransactions.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((tx) => (
                  <tr key={tx.id}>
                    <td>{new Date(tx.transaction_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</td>
                    <td className="font-semibold">{tx.title}</td>
                    <td>{tx.categories?.name || 'Uncategorized'}</td>
                    <td className={`font-semibold ${tx.type === 'income' ? 'text-success' : 'text-danger'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">No recent transactions</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
