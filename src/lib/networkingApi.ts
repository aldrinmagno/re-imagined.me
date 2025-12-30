import { getSupabaseClient } from './supabaseClient';
import type { NetworkContactRecord, NetworkTaskRecord } from '../types/networking';

export const getNetworkContacts = async (userId: string): Promise<NetworkContactRecord[]> => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('network_contacts')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .returns<NetworkContactRecord[]>();

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
};

export const createNetworkContact = async (
  userId: string,
  payload: Omit<NetworkContactRecord, 'id' | 'updated_at' | 'user_id'>
): Promise<NetworkContactRecord> => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('network_contacts')
    .insert({ ...payload, user_id: userId })
    .select('*')
    .single<NetworkContactRecord>();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const updateNetworkContact = async (
  userId: string,
  id: string,
  payload: Partial<Omit<NetworkContactRecord, 'id' | 'updated_at' | 'user_id'>>
): Promise<NetworkContactRecord> => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('network_contacts')
    .update(payload)
    .eq('id', id)
    .eq('user_id', userId)
    .select('*')
    .single<NetworkContactRecord>();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const deleteNetworkContact = async (userId: string, id: string): Promise<void> => {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('network_contacts').delete().eq('id', id).eq('user_id', userId);

  if (error) {
    throw new Error(error.message);
  }
};

export const getNetworkTasks = async (userId: string): Promise<NetworkTaskRecord[]> => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('network_tasks')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .returns<NetworkTaskRecord[]>();

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
};

export const createNetworkTask = async (
  userId: string,
  payload: Omit<NetworkTaskRecord, 'id' | 'updated_at' | 'user_id'>
): Promise<NetworkTaskRecord> => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('network_tasks')
    .insert({ ...payload, user_id: userId })
    .select('*')
    .single<NetworkTaskRecord>();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const updateNetworkTask = async (
  userId: string,
  id: string,
  payload: Partial<Omit<NetworkTaskRecord, 'id' | 'updated_at' | 'user_id'>>
): Promise<NetworkTaskRecord> => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('network_tasks')
    .update(payload)
    .eq('id', id)
    .eq('user_id', userId)
    .select('*')
    .single<NetworkTaskRecord>();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const deleteNetworkTask = async (userId: string, id: string): Promise<void> => {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('network_tasks').delete().eq('id', id).eq('user_id', userId);

  if (error) {
    throw new Error(error.message);
  }
};
