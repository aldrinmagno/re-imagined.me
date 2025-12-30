import { getSupabaseClient } from './supabaseClient';
import type { RadarItemRecord } from '../types/radar';

export const getRadarItems = async (userId: string): Promise<RadarItemRecord[]> => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('radar_items')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .returns<RadarItemRecord[]>();

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
};

export const createRadarItem = async (userId: string, payload: Omit<RadarItemRecord, 'id' | 'updated_at' | 'user_id'>) => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('radar_items')
    .insert({ ...payload, user_id: userId })
    .select('*')
    .single<RadarItemRecord>();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const updateRadarItem = async (
  userId: string,
  id: string,
  payload: Partial<Omit<RadarItemRecord, 'id' | 'updated_at' | 'user_id'>>
): Promise<RadarItemRecord> => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('radar_items')
    .update(payload)
    .eq('id', id)
    .eq('user_id', userId)
    .select('*')
    .single<RadarItemRecord>();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const deleteRadarItem = async (userId: string, id: string): Promise<void> => {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('radar_items').delete().eq('id', id).eq('user_id', userId);

  if (error) {
    throw new Error(error.message);
  }
};
