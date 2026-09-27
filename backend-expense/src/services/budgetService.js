const budgetModel = require('../models/budgetModel');
const supabase = require('../config/supabase');

const getBudgets = async (userId) => {
  const budgets = await budgetModel.getBudgets(userId);
  
  // Calculate spent amount for each budget
  // Note: we can do this more efficiently with a single SQL group by, but for simplicity we fetch the stats here or in SQL.
  // Let's do it using a single query to get spending per category for the budget month/year.

  const enrichedBudgets = await Promise.all(budgets.map(async (budget) => {
    // Get total spent in that category for that month and year
    const startDate = new Date(budget.year, budget.month - 1, 1).toISOString();
    const endDate = new Date(budget.year, budget.month, 0).toISOString();

    const { data, error } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', userId)
      .eq('category_id', budget.category_id)
      .eq('type', 'expense')
      .gte('transaction_date', startDate)
      .lte('transaction_date', endDate);
    
    let spent = 0;
    if (!error && data) {
      spent = data.reduce((acc, curr) => acc + Number(curr.amount), 0);
    }
    
    return {
      ...budget,
      spent,
      remaining: Number(budget.amount) - spent,
      percentage: Math.min((spent / Number(budget.amount)) * 100, 100).toFixed(1),
      exceeded: spent > Number(budget.amount)
    };
  }));

  return enrichedBudgets;
};

const createBudget = async (userId, data) => {
  const { category_id, amount, month, year } = data;
  return await budgetModel.createBudget(userId, category_id, amount, month, year);
};

const updateBudget = async (userId, id, amount) => {
  const budget = await budgetModel.updateBudget(userId, id, amount);
  if (!budget) {
    const error = new Error('Budget not found or unauthorized');
    error.statusCode = 404;
    throw error;
  }
  return budget;
};

const deleteBudget = async (userId, id) => {
  const budget = await budgetModel.deleteBudget(userId, id);
  if (!budget) {
    const error = new Error('Budget not found or unauthorized');
    error.statusCode = 404;
    throw error;
  }
  return budget;
};

module.exports = {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget
};
