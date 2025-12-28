import { getSupabaseClient } from './supabaseClient';
import type { JobSearchEventRecord, JobSearchEventType } from '../types/jobSearchEvents';

export const logJobSearchEvent = async (
  userId: string,
  type: JobSearchEventType,
  payload: Record<string, unknown> = {}
): Promise<JobSearchEventRecord> => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('job_search_events')
    .insert({ user_id: userId, type, payload })
    .select('*')
    .single<JobSearchEventRecord>();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const getJobSearchEvents = async (userId: string): Promise<JobSearchEventRecord[]> => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('job_search_events')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .returns<JobSearchEventRecord[]>();

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
};
