import { getSupabaseClient } from './supabaseClient';
import type { ResourceSaveRecord } from '../types/resources';

export const getResourceSaves = async (userId: string): Promise<ResourceSaveRecord[]> => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('user_resource_saves')
    .select('*')
    .eq('user_id', userId)
    .returns<ResourceSaveRecord[]>();

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
};

export const saveResource = async (userId: string, resourceId: string): Promise<ResourceSaveRecord> => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('user_resource_saves')
    .insert({ user_id: userId, resource_id: resourceId, status: 'saved' })
    .select('*')
    .single<ResourceSaveRecord>();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
