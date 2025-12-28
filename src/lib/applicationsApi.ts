import { getSupabaseClient } from './supabaseClient';
import type { ApplicationRecord } from '../types/applications';

export const getApplications = async (userId: string): Promise<ApplicationRecord[]> => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .returns<ApplicationRecord[]>();

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
};

export const createApplication = async (
  userId: string,
  payload: Omit<ApplicationRecord, 'id' | 'updated_at' | 'user_id'>
): Promise<ApplicationRecord> => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('applications')
    .insert({ ...payload, user_id: userId })
    .select('*')
    .single<ApplicationRecord>();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const updateApplication = async (
  userId: string,
  id: string,
  payload: Partial<Omit<ApplicationRecord, 'id' | 'updated_at' | 'user_id'>>
): Promise<ApplicationRecord> => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('applications')
    .update(payload)
    .eq('id', id)
    .eq('user_id', userId)
    .select('*')
    .single<ApplicationRecord>();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const deleteApplication = async (userId: string, id: string): Promise<void> => {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('applications').delete().eq('id', id).eq('user_id', userId);

  if (error) {
    throw new Error(error.message);
  }
};
