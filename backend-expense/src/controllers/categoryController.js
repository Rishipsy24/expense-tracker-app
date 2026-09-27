const categoryService = require('../services/categoryService');

const getCategories = async (req, res, next) => {
  try {
    const categories = await categoryService.getCategories(req.user.id);
    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { name, type, icon } = req.body;
    if (!name || !type) {
      return res.status(400).json({ success: false, message: 'Name and type are required' });
    }
    if (type !== 'income' && type !== 'expense') {
      return res.status(400).json({ success: false, message: 'Type must be income or expense' });
    }

    const category = await categoryService.createCategory(req.user.id, name, type, icon);
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const { name, type, icon } = req.body;
    const category = await categoryService.updateCategory(req.user.id, req.params.id, name, type, icon);
    if (!category) {
       return res.status(404).json({ success: false, message: 'Category not found or unauthorized' });
    }
    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const category = await categoryService.deleteCategory(req.user.id, req.params.id);
    if (!category) {
       return res.status(404).json({ success: false, message: 'Category not found or unauthorized' });
    }
    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
