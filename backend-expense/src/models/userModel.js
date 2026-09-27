const supabase = require('../config/supabase');

const createUser = async (name, email, hashedPassword) => {
  const { data, error } = await supabase
    .from('users')
    .insert([{ name, email, password: hashedPassword }])
    .select('id, name, email, created_at, updated_at')
    .single();

  if (error) throw error;
  return data;
};

const findUserByEmail = async (email) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (error) throw error;
  return data;
};

const findUserById = async (id) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, created_at, updated_at')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById
};
