"use server";

import { auth } from "@clerk/nextjs/server";
import { createSupabaseClient } from "../supabase";
import { AudioMemo } from "@/types/database";

// Create a new audio memo
export const createAudioMemo = async (
  audioFilePath: string,
  userId?: string
) => {
  const { userId: authUserId } = await auth();
  const userIdToUse = userId || authUserId;

  if (!userIdToUse) throw new Error("Unauthorized");

  const supabase = await createSupabaseClient();

  const { data, error } = await supabase
    .from("audio_memos")
    .insert({
      audio_file_path: audioFilePath,
      user_id: userIdToUse,
      status: "pending",
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  return data;
};

// Get audio memo by ID
export const getAudioMemo = async (id: string) => {
  const { userId } = await auth();

  if (!userId) throw new Error("Unauthorized");

  const supabase = await createSupabaseClient();

  const { data, error } = await supabase
    .from("audio_memos")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error) throw new Error(error.message);

  return data as AudioMemo;
};

// Get all audio memos for the current user
export const getUserAudioMemos = async () => {
  const { userId } = await auth();

  if (!userId) throw new Error("Unauthorized");

  const supabase = await createSupabaseClient();

  const { data, error } = await supabase
    .from("audio_memos")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return data as AudioMemo[];
};

// Update audio memo
export const updateAudioMemo = async (
  id: string,
  updates: {
    transcription?: string;
    summary?: string;
    status?: string;
  }
) => {
  const { userId } = await auth();

  if (!userId) throw new Error("Unauthorized");

  const supabase = await createSupabaseClient();

  const { data, error } = await supabase
    .from("audio_memos")
    .update(updates)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  return data;
};

// Delete audio memo
export const deleteAudioMemo = async (id: string) => {
  const { userId } = await auth();

  if (!userId) throw new Error("Unauthorized");

  const supabase = await createSupabaseClient();

  const { error } = await supabase
    .from("audio_memos")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);

  return { success: true };
};

// Get audio memos older than specified days
export const getOldAudioMemos = async (daysOld: number = 7) => {
  const supabase = await createSupabaseClient();

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const { data, error } = await supabase
    .from("audio_memos")
    .select("*")
    .lt("created_at", cutoffDate.toISOString());

  if (error) throw new Error(error.message);

  return data as AudioMemo[];
};

// Find many audio memos with filters
export const findManyAudioMemos = async (filters: {
  where?: {
    createdAt?: { lt: Date };
  };
}) => {
  const supabase = await createSupabaseClient();

  let query = supabase.from("audio_memos").select("*");

  if (filters.where?.createdAt?.lt) {
    query = query.lt("created_at", filters.where.createdAt.lt.toISOString());
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);

  return data as AudioMemo[];
};

