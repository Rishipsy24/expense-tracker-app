const supabase = require('../config/supabase');

const getTransactions = async (userId, filters) => {
  let query = supabase
    .from('transactions')
    .select('*, categories(name, icon)', { count: 'exact' })
    .eq('user_id', userId);

  if (filters.type) query = query.eq('type', filters.type);
  if (filters.categoryId) query = query.eq('category_id', filters.categoryId);
  if (filters.paymentMethod) query = query.eq('payment_method', filters.paymentMethod);
  if (filters.startDate) query = query.gte('transaction_date', filters.startDate);
  if (filters.endDate) query = query.lte('transaction_date', filters.endDate);
  
  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }

  const sortBy = filters.sortBy || 'transaction_date';
  const sortOrder = filters.sortOrder === 'asc';
  query = query.order(sortBy, { ascending: sortOrder });

  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 10;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  query = query.range(from, to);

  const { data, count, error } = await query;
  if (error) throw error;

  return { data, count, page, limit };
};

const getTransactionById = async (userId, id) => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*, categories(name, icon)')
    .match({ id, user_id: userId })
    .maybeSingle();

  if (error) throw error;
  return data;
};

const createTransaction = async (userId, transactionData) => {
  const { data, error } = await supabase
    .from('transactions')
    .insert([{ user_id: userId, ...transactionData }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

const updateTransaction = async (userId, id, transactionData) => {
  const { data, error } = await supabase
    .from('transactions')
    .update({ ...transactionData, updated_at: new Date() })
    .match({ id, user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return data;
};

const deleteTransaction = async (userId, id) => {
  const { data, error } = await supabase
    .from('transactions')
    .delete()
    .match({ id, user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return data;
};

module.exports = {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction
};
