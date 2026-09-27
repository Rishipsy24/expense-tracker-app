const supabase = require('../config/supabase');

const getDashboardSummary = async (userId, month, year) => {
  // We'll calculate total income, total expenses, recent transactions, category breakdown, monthly trend
  const startDate = month && year ? new Date(year, month - 1, 1).toISOString() : new Date('2000-01-01').toISOString();
  const endDate = month && year ? new Date(year, month, 0).toISOString() : new Date().toISOString();

  // Get all transactions for the period
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('*, categories(name, icon)')
    .eq('user_id', userId)
    .gte('transaction_date', startDate)
    .lte('transaction_date', endDate)
    .order('transaction_date', { ascending: false });

  if (error) throw error;

  return transactions;
};

const getTrendData = async (userId) => {
  // Get all transactions for the last 6 months to calculate trend
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  const { data, error } = await supabase
    .from('transactions')
    .select('amount, type, transaction_date')
    .eq('user_id', userId)
    .gte('transaction_date', sixMonthsAgo.toISOString())
    .order('transaction_date', { ascending: true });

  if (error) throw error;
  return data;
};

module.exports = {
  getDashboardSummary,
  getTrendData
};
