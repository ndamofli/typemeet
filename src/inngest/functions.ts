import { createReadStream } from "fs";
import { unlink } from "fs/promises";
import { inngest } from "./client";
import { openai } from "@/lib/openai";
import { createSupabaseClient } from "@/lib/nu/supabase";
import { createTask } from "@/lib/nu/actions/task.actions";
import { createDeadline } from "@/lib/nu/actions/deadline.actions";
import { createReminder } from "@/lib/nu/actions/reminder.actions";
import { updateAudioMemo, findManyAudioMemos } from "@/lib/nu/actions/audioMemo.actions";

export const processAudio = inngest.createFunction(
  {
    id: "process-audio",
    concurrency: [
      {
        key: "event.data.accountId",
        limit: 1,
      },
    ],
    // Smooth incoming spikes while ensuring every memo is processed
    throttle: { limit: 1, period: "30s", key: "event.data.accountId" },    
    // Hard-stop abuse from a single account
    rateLimit: { limit: 3, period: "1m", key: "event.data.accountId" },
    // Push urgent - paying users memos ahead of background ones
    // priority: { run: "event.data.isUrgent ? 180 : 0" },
  },
  { event: "audio/received" },
  async ({ event, step }) => {
    const {memoId, audioFilePath} = event.data;

    // Step 1: Transcribe audio
    const transcription = await step.run("transcribe-audio", async () => {
      const audioFileStream = createReadStream(audioFilePath);
      const response = await openai.audio.transcriptions.create({
        file: audioFileStream,
        model: "gpt-4o-transcribe",
        //model: "gpt-4o-mini-transcribe", // gpt-4o-mini-transcribe, gpt-4o-transcribe, whisper-1
        //language: "en",
        response_format: "text",
      });
      return response;
    });
    console.log(`Transcription: ${transcription}`);
    // Step 2: Update memo in db with transcription
    await step.run("update-memo-in-db-transcription", async () => {
      await updateAudioMemo(memoId, {
        transcription: transcription,
        status: "processed",
      });
    });

   // Step 3: Extract tasks, deadlines, and reminders using OpenAI
   const createCompletion = openai.chat.completions.create.bind(
    openai.chat.completions
  );
  
  const completion = await step.ai.wrap(
    "extract-data-openai",
    createCompletion,
    {
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "user",
           content: `
Analyze the following transcription and extract:
1. Tasks (things to do)
2. Deadlines (specific dates/times when things are due)
3. Reminders (things to remember at specific times)
4. A brief summary

Current date and time: ${new Date().toISOString()}
Today is ${new Date().toLocaleDateString("en-US", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric"
})}

Transcription: "${transcription}"

For dates:
- "5 PM" or "5 p.m." means 17:00 in 24-hour format
- For specific appointments like "barber at 5 PM Monday", create a reminder 10 minutes before the appointment time

Return the response in the original language of the transcription as JSON in this exact format:
{
  "tasks": [{"title": "string", "description": "string", "priority": "low|medium|high"}],
  "deadlines": [{"title": "string", "description": "string", "dueDate": "YYYY-MM-DDTHH:mm:ssZ"}],
  "reminders": [{"title": "string", "description": "string", "remindAt": "YYYY-MM-DDTHH:mm:ssZ"}],
  "summary": "string"
}

Be practical about inferring dates and times. If someone mentions an appointment, create a reminder 10 minutes before.
Always use the original language of the transcription. Never translate the transcription.
`,
        },
      ],
    }
  );

  const extractedData = JSON.parse(
    (completion as any).choices?.[0]?.message?.content || "{}"
  );
  console.log(`Extracted data: ${JSON.stringify(extractedData)}`);
  
  // Step 4: Save extracted data to database
  await step.run("save-extracted-data", async () => {
    // Get the audio memo to retrieve user_id
    const supabase = await createSupabaseClient();
    const { data: audioMemo, error: audioMemoError } = await supabase
      .from("audio_memos")
      .select("user_id")
      .eq("id", memoId)
      .single();

    if (audioMemoError) {
      throw new Error(`Failed to get audio memo: ${audioMemoError.message}`);
    }

    const userId = audioMemo.user_id;

    // Create tasks
    for (const taskData of extractedData.tasks || []) {
      await createTask({
        title: taskData.title,
        description: taskData.description || null,
        priority: taskData.priority || "medium",
        completed: false,
        createdFrom: memoId,
        userId: userId,
      });
    }

    // Create deadlines
    for (const deadlineData of extractedData.deadlines || []) {
      await createDeadline({
        title: deadlineData.title,
        description: deadlineData.description || null,
        dueDate: new Date(deadlineData.dueDate),
        createdFrom: memoId,
        userId: userId,
      });
    }

    // Create reminders
    for (const reminderData of extractedData.reminders || []) {
      await createReminder({
        title: reminderData.title,
        description: reminderData.description || null,
        remindAt: new Date(reminderData.remindAt),
        createdFrom: memoId,
        userId: userId,
      });
    }

    // Update memo with summary and status
    await updateAudioMemo(memoId, {
      summary: extractedData.summary || null,
      status: "completed",
    });
  });

   //return { success: true, extractedData };

   }
);

export const removeAudioFiles = inngest.createFunction(
  { id: "remove-audio-files" },
  { cron: "TZ=Europe/Paris 0 12 * * 5" },
  async () => {
    // Remove audio files older than 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const audioFiles = await findManyAudioMemos({
      where: {
        createdAt: { lt: sevenDaysAgo },
      },
    });

    for (const file of audioFiles) {
      try {
        // Assuming the file path is stored in the database
        const filePath = file.audio_file_path;
        await unlink(filePath);
        console.log(`Deleted audio file: ${filePath}`);
      } catch (error) {
        console.error(`Failed to delete audio file: ${file.audio_file_path}`, error);
      }
    }

    console.log(`Cleanup completed. Processed ${audioFiles.length} files.`);
    return { success: true, filesProcessed: audioFiles.length };
  }
);


