const supabase = require('../config/supabase');

const getBudgets = async (userId) => {
  const { data, error } = await supabase
    .from('budgets')
    .select('*, categories(name, icon)')
    .eq('user_id', userId)
    .order('year', { ascending: false })
    .order('month', { ascending: false });

  if (error) throw error;
  return data;
};

const createBudget = async (userId, categoryId, amount, month, year) => {
  const { data, error } = await supabase
    .from('budgets')
    .insert([{ user_id: userId, category_id: categoryId, amount, month, year }])
    .select()
    .single();

  if (error) {
    if (error.code === '23505') { // Unique violation
      const customError = new Error('Budget already exists for this category and month');
      customError.statusCode = 409;
      throw customError;
    }
    throw error;
  }
  return data;
};

const updateBudget = async (userId, id, amount) => {
  const { data, error } = await supabase
    .from('budgets')
    .update({ amount, updated_at: new Date() })
    .match({ id, user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return data;
};

const deleteBudget = async (userId, id) => {
  const { data, error } = await supabase
    .from('budgets')
    .delete()
    .match({ id, user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return data;
};

module.exports = {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget
};
