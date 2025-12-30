import { getSupabaseClient } from './supabaseClient';
import type { ActionPlanData, ActionPlanRecord } from '../types/actionPlan';

export const getActionPlan = async (userId: string): Promise<ActionPlanRecord | null> => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('action_plan')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle<ActionPlanRecord>();

  if (error) {
    throw new Error(error.message);
  }

  return data ?? null;
};

export const saveActionPlan = async (userId: string, plan: ActionPlanData): Promise<ActionPlanRecord> => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('action_plan')
    .upsert({ user_id: userId, plan }, { onConflict: 'user_id' })
    .select('*')
    .single<ActionPlanRecord>();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
