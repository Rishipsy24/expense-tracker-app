const categoryModel = require('../models/categoryModel');

const getCategories = async (userId) => {
  return await categoryModel.getCategoriesByUser(userId);
};

const createCategory = async (userId, name, type, icon) => {
  return await categoryModel.createCategory(userId, name, type, icon);
};

const updateCategory = async (userId, categoryId, name, type, icon) => {
  return await categoryModel.updateCategory(userId, categoryId, name, type, icon);
};

const deleteCategory = async (userId, categoryId) => {
  return await categoryModel.deleteCategory(userId, categoryId);
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
