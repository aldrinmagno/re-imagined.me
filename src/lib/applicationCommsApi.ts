import { getSupabaseClient } from './supabaseClient';
import type { ApplicationCommRecord, ApplicationCommType } from '../types/applicationComms';

export const getApplicationComms = async (userId: string, applicationId: string): Promise<ApplicationCommRecord[]> => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('application_comms')
    .select('*')
    .eq('user_id', userId)
    .eq('application_id', applicationId)
    .order('created_at', { ascending: false })
    .returns<ApplicationCommRecord[]>();

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
};

export const createApplicationComm = async (
  userId: string,
  applicationId: string,
  type: ApplicationCommType,
  content: string
): Promise<ApplicationCommRecord> => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('application_comms')
    .insert({
      user_id: userId,
      application_id: applicationId,
      type,
      content
    })
    .select('*')
    .single<ApplicationCommRecord>();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
