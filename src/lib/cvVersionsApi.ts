import { getSupabaseClient } from './supabaseClient';
import type { CvVersionContent, CvVersionRecord } from '../types/cvVersions';

export const getCvVersions = async (userId: string): Promise<CvVersionRecord[]> => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('cv_versions')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .returns<CvVersionRecord[]>();

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
};

export const createCvVersion = async (
  userId: string,
  payload: { name: string; role_key: string; content: CvVersionContent }
): Promise<CvVersionRecord> => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('cv_versions')
    .insert({ ...payload, user_id: userId })
    .select('*')
    .single<CvVersionRecord>();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const updateCvVersion = async (
  id: string,
  userId: string,
  payload: Partial<{ name: string; role_key: string; content: CvVersionContent }>
): Promise<CvVersionRecord> => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('cv_versions')
    .update(payload)
    .eq('id', id)
    .eq('user_id', userId)
    .select('*')
    .single<CvVersionRecord>();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const deleteCvVersion = async (id: string, userId: string): Promise<void> => {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('cv_versions').delete().eq('id', id).eq('user_id', userId);

  if (error) {
    throw new Error(error.message);
  }
};
