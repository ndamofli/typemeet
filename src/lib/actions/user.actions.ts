"use server";
import { createSupabaseClient } from "../supabase";
import type { User } from "@/types/database";

// Create a new user
export const createUser = async (data: User) => {
  if (!data.clerk_id || !data.email) {
    throw new Error('clerk_id and email are required');
  }

  const supabase = await createSupabaseClient();

  const { data: user, error } = await supabase
    .from('users')
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error('Error creating user in Supabase:', error);
    throw new Error('Failed to create user in database');
  }

  return {
    success: true,
    user: user as User,
    message: 'User saved successfully!'
  };
};

// Update an existing user
export const updateUser = async (data: User) => {
  if (!data.clerk_id || !data.email) {
    throw new Error('clerk_id and email are required');
  }

  const supabase = await createSupabaseClient();

  const { data: user, error } = await supabase
    .from('users')
    .update(data)
    .eq('clerk_id', data.clerk_id)
    .select()
    .single();

  if (error) {
    console.error('Error updating user in Supabase:', error);
    throw new Error('Failed to update user in database');
  }

  return {
    success: true,
    user: user as User,
    message: 'User updated successfully!'
  };
};

// Delete an existing user
export const deleteUser = async (data: User) => {
  if (!data.clerk_id || !data.email) {
    throw new Error('clerk_id and email are required');
  }

  const supabase = await createSupabaseClient();

  const { data: error } = await supabase
    .from('users')
    .delete()
    .eq('clerk_id', data.clerk_id)

  if (error) {
    console.error('Error deleting user in Supabase:', error);
    throw new Error('Failed to delete user in database');
  }

  return {
    success: true,
    message: 'User deleted successfully!'
  };
};