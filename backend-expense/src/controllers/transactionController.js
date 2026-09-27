const transactionService = require('../services/transactionService');

const getTransactions = async (req, res, next) => {
  try {
    const { data, count, page, limit } = await transactionService.getTransactions(req.user.id, req.query);
    res.status(200).json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await transactionService.getTransactionById(req.user.id, req.params.id);
    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    next(error);
  }
};

const createTransaction = async (req, res, next) => {
  try {
    const { type, amount, title, transaction_date } = req.body;
    if (!type || !amount || !title || !transaction_date) {
      return res.status(400).json({ success: false, message: 'Type, amount, title, and transaction date are required' });
    }
    if (amount <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be greater than 0' });
    }
    if (type !== 'income' && type !== 'expense') {
      return res.status(400).json({ success: false, message: 'Type must be income or expense' });
    }

    const transaction = await transactionService.createTransaction(req.user.id, req.body);
    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: transaction
    });
  } catch (error) {
    next(error);
  }
};

const updateTransaction = async (req, res, next) => {
  try {
    const { amount, type } = req.body;
    if (amount !== undefined && amount <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be greater than 0' });
    }
    if (type !== undefined && type !== 'income' && type !== 'expense') {
      return res.status(400).json({ success: false, message: 'Type must be income or expense' });
    }

    const transaction = await transactionService.updateTransaction(req.user.id, req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Transaction updated successfully',
      data: transaction
    });
  } catch (error) {
    next(error);
  }
};

const deleteTransaction = async (req, res, next) => {
  try {
    await transactionService.deleteTransaction(req.user.id, req.params.id);
    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction
};
