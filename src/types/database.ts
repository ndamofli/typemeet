export interface User {
  id?: string
  clerk_id: string
  email: string
  first_name?: string | null
  last_name?: string | null
  subscription_tier?: 'free' | 'pro' | 'premium' | null
  subscription_status?: 'active' | 'cancelled' | 'expired' | null
  created_at?: string
  updated_at?: string
}

export interface Meeting {
  id: string
  user_id: string
  title: string
  content: string
  tags: string[]
  analysis_text: string
  processing_status: 'pending' | 'analyzing' | 'completed' | 'failed'
  created_at: string
  updated_at: string
}



export interface AudioMemo {
  id: string;
  audioFilePath: string;
  createdAt: string | Date;
  transcription?: string;
  status: string;
  summary?: string;
  tasks?: Task[];
  deadlines?: Deadline[];
  reminders?: Reminder[];
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: string;
  completed: boolean;
  createdAt: string | Date;
  createdFrom: string;
  memo?: AudioMemo;
}

export interface Deadline {
  id: string;
  title: string;
  description?: string;
  dueDate: string | Date;
  createdAt: string | Date;
  createdFrom: string;
  memo?: AudioMemo;
}

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  remindAt: string | Date;
  triggered: boolean;
  createdAt: string | Date;
  createdFrom: string;
  memo?: AudioMemo;
}