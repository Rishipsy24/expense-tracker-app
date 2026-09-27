const dashboardModel = require('../models/dashboardModel');

const getDashboardSummary = async (userId, month, year) => {
  const transactions = await dashboardModel.getDashboardSummary(userId, month, year);

  let totalIncome = 0;
  let totalExpenses = 0;
  const categoryBreakdownMap = {};

  transactions.forEach(t => {
    const amount = Number(t.amount);
    if (t.type === 'income') {
      totalIncome += amount;
    } else {
      totalExpenses += amount;
      
      const categoryName = t.categories ? t.categories.name : 'Uncategorized';
      if (!categoryBreakdownMap[categoryName]) {
        categoryBreakdownMap[categoryName] = 0;
      }
      categoryBreakdownMap[categoryName] += amount;
    }
  });

  const categoryBreakdown = Object.keys(categoryBreakdownMap).map(key => ({
    name: key,
    value: categoryBreakdownMap[key]
  }));

  const trendDataRaw = await dashboardModel.getTrendData(userId);
  const trendMap = {};

  trendDataRaw.forEach(t => {
    const date = new Date(t.transaction_date);
    const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
    
    if (!trendMap[monthYear]) {
      trendMap[monthYear] = { name: monthYear, income: 0, expense: 0 };
    }
    
    if (t.type === 'income') {
      trendMap[monthYear].income += Number(t.amount);
    } else {
      trendMap[monthYear].expense += Number(t.amount);
    }
  });

  return {
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses,
    transactionCount: transactions.length,
    recentTransactions: transactions.slice(0, 5),
    categoryBreakdown,
    monthlyTrend: Object.values(trendMap)
  };
};

module.exports = {
  getDashboardSummary
};
