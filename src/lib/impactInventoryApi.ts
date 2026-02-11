import { getSupabaseClient } from './supabaseClient';
import type { ImpactInventoryEntry, ImpactInventoryRecord } from '../types/impactInventory';

export const getImpactInventory = async (userId: string): Promise<ImpactInventoryRecord | null> => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('impact_inventory')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle<ImpactInventoryRecord>();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const getImpactInventoryEntries = async (
  userId: string
): Promise<{ entries: ImpactInventoryEntry[]; include_in_report: boolean } | null> => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('impact_inventory')
    .select('entries, include_in_report')
    .eq('user_id', userId)
    .maybeSingle<{ entries: ImpactInventoryEntry[]; include_in_report: boolean }>();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const saveImpactInventory = async (
  userId: string,
  entries: ImpactInventoryEntry[],
  includeInReport: boolean
): Promise<{ updated_at: string }> => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('impact_inventory')
    .upsert({ user_id: userId, entries, include_in_report: includeInReport }, { onConflict: 'user_id' })
    .select('updated_at')
    .single<{ updated_at: string }>();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
