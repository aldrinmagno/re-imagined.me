import { getSupabaseClient } from './supabaseClient';
import { deriveTransferableSkills } from './deriveTransferableSkills';
import type { ImpactInventoryEntry } from '../types/impactInventory';
import type { TransferableSkillsResult, TransferableSkillsSnapshotRecord } from '../types/transferableSkills';

export const getTransferableSkillsSnapshot = async (
  userId: string
): Promise<TransferableSkillsSnapshotRecord | null> => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('transferable_skills_snapshot')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle<TransferableSkillsSnapshotRecord>();

  if (error) {
    throw new Error(error.message);
  }

  return data ?? null;
};

export const regenerateTransferableSkillsSnapshot = async (
  userId: string,
  impactInventory: ImpactInventoryEntry[]
): Promise<TransferableSkillsSnapshotRecord> => {
  const supabase = getSupabaseClient();
  const result: TransferableSkillsResult = deriveTransferableSkills(impactInventory);

  const payload = {
    user_id: userId,
    skills: result.transferable_skills,
    bullets: result.impact_bullets
  };

  const { data, error } = await supabase
    .from('transferable_skills_snapshot')
    .insert(payload)
    .select('*')
    .single<TransferableSkillsSnapshotRecord>();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
