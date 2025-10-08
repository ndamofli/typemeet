import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';

// Helper function to find or create a user from Clerk ID
async function findOrCreateUserFromClerkId(clerkId: string) {
    // First, try to find the user
    const supabase = await createSupabaseClient();
    const { data: user, error: findError } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', clerkId)
        .single();

    // If we find the user, return it
    if (user) {
        return { user, error: null };
    }

    // If the error is anything other than "not found", return the error
    if (findError && findError.code !== 'PGRST116') {
        console.error('Error finding user:', findError);
        return { user: null, error: 'Database error while finding user' };
    }

    // If user was not found (PGRST116), create them
    console.log(`User not found for Clerk ID ${clerkId}, creating new user...`);
    const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([{ clerk_id: clerkId, email: 'user@example.com' }]) // email is a placeholder
        .select('id')
        .single();

    if (createError) {
        console.error('Error creating user:', createError);
        return { user: null, error: 'Failed to create user' };
    }

    console.log(`Successfully created new user with ID: ${newUser.id}`);
    return { user: newUser, error: null };
}

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const supabase = await createSupabaseClient();

    // Get user ID from database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (userError || !user) {
      console.error('Error finding user:', userError);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { data: meeting, error } = await supabase
      .from('meetings')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching meeting:', error);
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    return NextResponse.json({ meeting });
  } catch (error) {
    console.error('Error in GET /api/meetings/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, content, tags } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const supabase = await createSupabaseClient();

    const { user, error: userError } = await findOrCreateUserFromClerkId(userId);

    if (userError || !user) {
      console.error('Failed to get internal user:', userError);
      return NextResponse.json({ error: userError || 'User not found' }, { status: 500 });
    }

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
      .select();

    if (error) {
      console.error('Error updating meeting:', error);
      return NextResponse.json({ error: 'Failed to update meeting' }, { status: 500 });
    }

    return NextResponse.json({ meeting });
  } catch (error) {
    console.error('Error in PUT /api/meetings/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Get user ID from database (find or create)
    const { user, error: userError } = await findOrCreateUserFromClerkId(userId);

    if (userError || !user) {
      console.error('Failed to get internal user:', userError);
      return NextResponse.json({ error: userError || 'User not found' }, { status: 500 });
    }
    const supabase = await createSupabaseClient();
    // Delete the meeting
    const { error } = await supabase
      .from('meetings')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting meeting:', error);
      return NextResponse.json({ error: 'Failed to delete meeting' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Meeting deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/meetings/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
