import { getSupabaseClient } from './supabaseClient';
import type { CvBulletsPayload, CvBulletsRecord } from '../types/cvBullets';

export const getCvBullets = async (userId: string, roleKey: string): Promise<CvBulletsRecord | null> => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('cv_bullets')
    .select('*')
    .eq('user_id', userId)
    .eq('role_key', roleKey)
    .maybeSingle<CvBulletsRecord>();

  if (error) {
    throw new Error(error.message);
  }

  return data ?? null;
};

export const saveCvBullets = async (
  userId: string,
  roleKey: string,
  bullets: CvBulletsPayload
): Promise<CvBulletsRecord> => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('cv_bullets')
    .upsert(
      {
        user_id: userId,
        role_key: roleKey,
        bullets
      },
      { onConflict: 'user_id,role_key' }
    )
    .select('*')
    .single<CvBulletsRecord>();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
