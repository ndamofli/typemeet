"use server";

import { auth } from "@clerk/nextjs/server";
import { createSupabaseClient } from "../supabase";
import { Meeting } from "@/types/database";

// Helper function to find or create a user from Clerk ID
async function findOrCreateUserFromClerkId(clerkId: string) {
  const supabase = await createSupabaseClient();
  
  // First, try to find the user
  const { data: user, error: findError } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', clerkId)
    .single();

  // If we find the user, return it
  if (user) {
    return user;
  }

  // If the error is anything other than "not found", throw it
  if (findError && findError.code !== 'PGRST116') {
    console.error('Error finding user:', findError);
    throw new Error('Database error while finding user');
  }

  // If user was not found (PGRST116), create them
  console.log(`User not found for Clerk ID ${clerkId}, creating new user...`);
  const { data: newUser, error: createError } = await supabase
    .from('users')
    .insert([{ clerk_id: clerkId, email: 'user@example.com' }])
    .select('id')
    .single();

  if (createError) {
    console.error('Error creating user:', createError);
    throw new Error('Failed to create user');
  }

  console.log(`Successfully created new user with ID: ${newUser.id}`);
  return newUser;
}

// Get all meetings for the current user
export const getMeetings = async (options?: {
  limit?: number;
  offset?: number;
}) => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Authentication required");
  }

  const limit = options?.limit ?? 10;
  const offset = options?.offset ?? 0;

  const supabase = await createSupabaseClient();

  // Fetch meetings for the user
  const { data: meetings, error: meetingsError } = await supabase
    .from('meetings')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (meetingsError) {
    console.error('Error fetching meetings:', meetingsError);
    throw new Error('Failed to fetch meetings');
  }

  return meetings as Meeting[];
};

// Get a single meeting by ID
export const getMeetingById = async (id: string) => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const supabase = await createSupabaseClient();

  // Get user ID from database
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', userId)
    .single();

  if (userError || !user) {
    console.error('Error finding user:', userError);
    throw new Error('User not found');
  }

  const { data: meeting, error } = await supabase
    .from('meetings')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) {
    console.error('Error fetching meeting:', error);
    throw new Error('Meeting not found');
  }

  return meeting as Meeting;
};

// Create a new meeting
export const createMeeting = async (data: {
  title: string;
  content?: string;
  tags?: string[];
}) => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Authentication required");
  }

  const { title, content, tags } = data;

  if (!title) {
    throw new Error('Title is required');
  }

  const supabase = await createSupabaseClient();

  // Find or create user
  const user = await findOrCreateUserFromClerkId(userId);

  // Define meeting data
  const meetingData = {
    user_id: user.id,
    title,
    content: content || '',
    tags: tags ?? [],
    processing_status: 'pending',
    created_at: new Date().toISOString(),
  };

  const { data: meeting, error } = await supabase
    .from('meetings')
    .insert(meetingData)
    .select()
    .single();

  if (error) {
    console.error('Error creating meeting in Supabase:', error);
    throw new Error('Failed to create meeting in database');
  }

  return {
    success: true,
    meeting: meeting as Meeting,
    message: 'Meeting saved successfully! AI analysis is processing...'
  };
};

// Update an existing meeting
export const updateMeeting = async (
  id: string,
  data: {
    title: string;
    content: string;
    tags?: string[];
  }
) => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const { title, content, tags } = data;

  if (!title || !content) {
    throw new Error('Title and content are required');
  }

  const supabase = await createSupabaseClient();

  // Find or create user
  const user = await findOrCreateUserFromClerkId(userId);

  const { data: meeting, error } = await supabase
    .from('meetings')
    .update({
      title,
      content,
      tags,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating meeting:', error);
    throw new Error('Failed to update meeting');
  }

  return meeting as Meeting;
};

// Delete a meeting
export const deleteMeeting = async (id: string) => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const supabase = await createSupabaseClient();

  // Find or create user
  const user = await findOrCreateUserFromClerkId(userId);

  // Delete the meeting
  const { error } = await supabase
    .from('meetings')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error deleting meeting:', error);
    throw new Error('Failed to delete meeting');
  }

  return { success: true, message: 'Meeting deleted successfully' };
};

