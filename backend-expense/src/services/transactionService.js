const transactionModel = require('../models/transactionModel');

const getTransactions = async (userId, filters) => {
  return await transactionModel.getTransactions(userId, filters);
};

const getTransactionById = async (userId, id) => {
  const transaction = await transactionModel.getTransactionById(userId, id);
  if (!transaction) {
    const error = new Error('Transaction not found');
    error.statusCode = 404;
    throw error;
  }
  return transaction;
};

const createTransaction = async (userId, data) => {
  return await transactionModel.createTransaction(userId, data);
};

const updateTransaction = async (userId, id, data) => {
  const transaction = await transactionModel.updateTransaction(userId, id, data);
  if (!transaction) {
    const error = new Error('Transaction not found or unauthorized');
    error.statusCode = 404;
    throw error;
  }
  return transaction;
};

const deleteTransaction = async (userId, id) => {
  const transaction = await transactionModel.deleteTransaction(userId, id);
  if (!transaction) {
    const error = new Error('Transaction not found or unauthorized');
    error.statusCode = 404;
    throw error;
  }
  return transaction;
};

module.exports = {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction
};
