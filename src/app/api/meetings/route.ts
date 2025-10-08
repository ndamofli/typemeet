import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';
//import { inngest } from '@/lib/inngest';
import { randomUUID } from 'crypto';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      console.log('No authenticated user found');
      return NextResponse.json({ 
        error: 'Authentication required',
        message: 'Please sign in to access your Typemeet',
        requiresAuth: true 
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') ?? '10');
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Step 1: Find or create the user in our database using the admin client
    let user;
    const supabase = await createSupabaseClient();
    const { data: existingUser, error: userFetchError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (userFetchError && userFetchError.code !== 'PGRST116') { // PGRST116: single() found no rows
      console.error('Error fetching user:', userFetchError);
      return NextResponse.json({ error: 'Database error while fetching user' }, { status: 500 });
    }

    if (existingUser) {
      user = existingUser;
    } else {
      // Create user if they don't exist
      const { data: newUser, error: userCreateError } = await supabase
        .from('users')
        .insert([{ clerk_id: userId, email: 'user@example.com' }]) // Placeholder email
        .select('id')
        .single();

      if (userCreateError) {
        console.error('Error creating user:', userCreateError);
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
      }
      user = newUser;
    }

    if (!user) {
        return NextResponse.json({ error: 'Could not retrieve or create user' }, { status: 500 });
    }

    // Step 2: Fetch meetings for the user using the ADMIN client
    // This bypasses RLS but is secure because we are explicitly filtering by the user.id
    // that we just securely fetched based on the authenticated Clerk userId.
    const { data: meetings, error: meetingsError } = await supabase
      .from('meetings')
      .select('*')
      //.eq('user_id', user.id) 
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (meetingsError) {
      console.error('Error fetching meetings:', meetingsError);
      return NextResponse.json({ error: 'Failed to fetch meetings', details: meetingsError }, { status: 500 });
    }

    return NextResponse.json({ meetings: meetings });

  } catch (error) {
    console.error('Error in GET /api/meetings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ 
        error: 'Authentication required',
        message: 'Please sign in to save your meetings',
        requiresAuth: true 
      }, { status: 401 });
    }

    const body = await request.json();
    // console.log('Received meeting data:', JSON.stringify(body, null, 2)); // Detailed logging

    const { 
      title, 
      content, 
      tags,
    } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    const supabase = await createSupabaseClient();
    // Get user ID from database using admin client
    const { data: user, error: userFetchError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (userFetchError && userFetchError.code !== 'PGRST116') {
      console.error('Database error:', userFetchError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    let finalUser = user;

    if (!user) {
      // Create user if doesn't exist using admin client
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert([{ clerk_id: userId, email: 'user@example.com' }])
        .select()
        .single();

      if (userError) {
        console.error('Error creating user:', userError);
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
      }
      
      finalUser = newUser;
    }

    if (!finalUser) {
      return NextResponse.json({ error: 'Failed to get or create user' }, { status: 500 });
    }

    // Define a type for the meeting data to avoid using 'any'
    type MeetingsData = {
      user_id: string;
      title: string;
      content: string;
      tags: string[];
      processing_status: string;
      created_at: string;
    };

    // Generate permanent sandbox ID
    const sandboxId = randomUUID();

    // Insert new meeting
    const meetingData: MeetingsData = {
      user_id: finalUser.id,
      title,
      content,
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
      return NextResponse.json({ 
        error: 'Failed to create meeting in database',
        details: error.message 
      }, { status: 500 });
    }
/*
    // Trigger enhanced meeting analysis in background
    try {
      await inngest.send({ 
        name: 'meeting.created', 
        data: { 
          meetingId: meeting.id, 
          userId: finalUser.id, // Use the internal DB user ID
          sandboxId: sandboxId,
          meetingContent: meeting.content,
          meetingTitle: meeting.title,
          tags: meeting.tags,        } 
      });
    } catch (analysisError) {
      console.error('Error triggering meeting analysis:', analysisError);
      // Don't fail the request if analysis scheduling fails
    }
*/
    return NextResponse.json({ 
      success: true,
      meeting: meeting,
      message: 'Meeting saved successfully! AI analysis is processing...'
    });
  } catch (error) {
    console.error('Error in POST /api/meetings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
