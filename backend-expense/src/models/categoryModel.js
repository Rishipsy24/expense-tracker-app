const supabase = require('../config/supabase');

const getCategoriesByUser = async (userId) => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

const createCategory = async (userId, name, type, icon) => {
  const { data, error } = await supabase
    .from('categories')
    .insert([{ user_id: userId, name, type, icon }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

const updateCategory = async (userId, categoryId, name, type, icon) => {
  const { data, error } = await supabase
    .from('categories')
    .update({ name, type, icon, updated_at: new Date() })
    .match({ id: categoryId, user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return data;
};

const deleteCategory = async (userId, categoryId) => {
  const { data, error } = await supabase
    .from('categories')
    .delete()
    .match({ id: categoryId, user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return data;
};

module.exports = {
  getCategoriesByUser,
  createCategory,
  updateCategory,
  deleteCategory
};
