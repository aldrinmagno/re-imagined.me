import { getSupabaseClient } from './supabaseClient';
import type { SnapshotInsights } from '../types/assessment';

interface AssessmentInsertPayload {
  jobTitle: string;
  industry: string[];
  yearsExperience: number;
  strengths: string;
  typicalWeek: string | null;
  lookingFor: string;
  transitionTarget: string | null;
  workPreferences: string | null;
  email: string;
  fullName: string | null;
  userId: string | null;
}

export const insertAssessmentResponse = async (
  payload: AssessmentInsertPayload
): Promise<{ id: string }> => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('assessment_responses')
    .insert({
      job_title: payload.jobTitle,
      industry: payload.industry,
      years_experience: payload.yearsExperience,
      strengths: payload.strengths,
      typical_week: payload.typicalWeek,
      looking_for: payload.lookingFor,
      transition_target: payload.transitionTarget,
      work_preferences: payload.workPreferences,
      email: payload.email,
      full_name: payload.fullName,
      user_id: payload.userId,
      submitted_at: new Date().toISOString(),
      snapshot_insights: null
    })
    .select('id')
    .single<{ id: string }>();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const attachSnapshotInsights = async (
  assessmentId: string,
  insights: SnapshotInsights
): Promise<void> => {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('assessment_responses')
    .update({ snapshot_insights: insights })
    .eq('id', assessmentId);

  if (error) {
    throw new Error(error.message);
  }
};

interface AssessmentRecord {
  id: string;
  job_title: string | null;
  industry: string[] | null;
  years_experience: number | null;
  strengths: string | null;
  typical_week: string | null;
  looking_for: string | null;
  transition_target: string | null;
  work_preferences: string | null;
  email: string | null;
  full_name: string | null;
  snapshot_insights: SnapshotInsights | null;
  submitted_at: string | null;
}

export type { AssessmentRecord };

export const getLatestAssessment = async (
  userId: string,
  fallbackEmail?: string
): Promise<AssessmentRecord | null> => {
  const supabase = getSupabaseClient();

  // Primary: look up by user_id
  const { data, error } = await supabase
    .from('assessment_responses')
    .select(
      'id, job_title, industry, years_experience, strengths, typical_week, looking_for, transition_target, work_preferences, email, full_name, snapshot_insights, submitted_at'
    )
    .eq('user_id', userId)
    .order('submitted_at', { ascending: false })
    .limit(1)
    .maybeSingle<AssessmentRecord>();

  if (error) {
    throw new Error(error.message);
  }

  // Fallback: try email for pre-migration rows that don't have user_id yet
  if (!data && fallbackEmail) {
    const { data: emailData, error: emailError } = await supabase
      .from('assessment_responses')
      .select(
        'id, job_title, industry, years_experience, strengths, typical_week, looking_for, transition_target, work_preferences, email, full_name, snapshot_insights, submitted_at'
      )
      .eq('email', fallbackEmail)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .maybeSingle<AssessmentRecord>();

    if (emailError) {
      throw new Error(emailError.message);
    }

    return emailData;
  }

  return data;
};
