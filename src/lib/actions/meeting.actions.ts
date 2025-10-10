"use server";

import { auth } from "@clerk/nextjs/server";
import { createSupabaseClient } from "../supabase";
import { Meeting } from "@/types/database";
import { getUserFromDB } from "../supabase";


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
  const user = await getUserFromDB(userId);

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
  const user = await getUserFromDB(userId);

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
  const user = await getUserFromDB(userId);

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
  const user = await getUserFromDB(userId);

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

