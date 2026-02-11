import { useState, useEffect, useRef, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSupabaseClient } from './supabaseClient';
import { insertAssessmentResponse, attachSnapshotInsights } from './assessmentApi';
import { generateSnapshotInsights } from './generateSnapshotInsights';
import { jobTitles as fallbackJobTitles } from '../data/jobTitles';
import { assessmentSteps, goalLabelMap, createInitialFormData } from '../data/assessmentSteps';
import type { AssessmentFormData, SnapshotInsights } from '../types/assessment';

const normalizeLookingFor = (value: AssessmentFormData['lookingFor']) => {
  if (Array.isArray(value)) return value;
  if (value) return [value];
  return [];
};

const getStrengthsWithOther = (data: AssessmentFormData) => {
  const strengths = data.strengths || [];
  const customStrength = data.strengthsOther.trim();
  const hasOther = strengths.includes('other');
  const baseStrengths = strengths.filter((v) => v !== 'other');
  if (hasOther && customStrength) return [...baseStrengths, customStrength];
  return baseStrengths;
};

export function useAssessmentForm() {
  const { user } = useAuth();
  const [showSnapshot, setShowSnapshot] = useState(false);
  const [isAssessmentActive, setIsAssessmentActive] = useState(false);
  const [hasAssessmentStarted, setHasAssessmentStarted] = useState(false);
  const [formData, setFormData] = useState<AssessmentFormData>(() => createInitialFormData());
  const [currentStep, setCurrentStep] = useState(0);
  const [furthestStep, setFurthestStep] = useState(0);
  const [error, setError] = useState('');
  const [stepAnimationKey, setStepAnimationKey] = useState(0);
  const [transitionDirection, setTransitionDirection] = useState<'forward' | 'backward'>('forward');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snapshotInsights, setSnapshotInsights] = useState<SnapshotInsights | null>(null);
  const [isJobTitleOpen, setIsJobTitleOpen] = useState(false);
  const [jobTitleQuery, setJobTitleQuery] = useState('');
  const [isCustomJobTitle, setIsCustomJobTitle] = useState(false);
  const [jobTitleOptions, setJobTitleOptions] = useState<string[]>(fallbackJobTitles);

  const interactiveRefs = useRef<Record<string, HTMLElement | null>>({});
  const jobTitleDropdownRef = useRef<HTMLDivElement | null>(null);
  const customJobTitleInputRef = useRef<HTMLInputElement | null>(null);

  const isAssessmentMode = isAssessmentActive && !showSnapshot;
  const steps = assessmentSteps;
  const currentStepDefinition = steps[currentStep];

  useEffect(() => {
    setStepAnimationKey((prev) => prev + 1);
  }, [currentStep]);

  useEffect(() => {
    const fetchJobTitles = async () => {
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase.from('job_titles').select('title').order('title', { ascending: true });
        if (error) {
          console.error('Error loading job titles', error);
          return;
        }
        const titles = (data as { title: string | null }[])
          .map((entry) => entry.title?.trim())
          .filter((title): title is string => Boolean(title));
        if (titles.length > 0) setJobTitleOptions(titles);
      } catch (fetchError) {
        console.error('Unexpected error loading job titles', fetchError);
      }
    };
    fetchJobTitles();
  }, []);

  useEffect(() => {
    if (isAssessmentMode) {
      scrollToSection('assessment');
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isAssessmentMode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (jobTitleDropdownRef.current && !jobTitleDropdownRef.current.contains(event.target as Node)) {
        setIsJobTitleOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setJobTitleQuery(formData.jobTitle);
  }, [formData.jobTitle]);

  useEffect(() => {
    if (!isAssessmentMode) return;
    const element = interactiveRefs.current[currentStepDefinition.id];
    element?.focus();
  }, [currentStepDefinition.id, isAssessmentMode]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const getFieldValue = <K extends keyof AssessmentFormData>(field: K): AssessmentFormData[K] =>
    formData[field];

  const isStepValid = (stepIndex: number) => {
    const step = steps[stepIndex];
    if (!step) return true;
    if (!step.required) return true;

    switch (step.id) {
      case 'jobTitle':
        return getFieldValue('jobTitle').trim().length > 0;
      case 'industry':
        return getFieldValue('industry').length > 0;
      case 'yearsExperience': {
        const value = getFieldValue('yearsExperience').trim();
        if (value === '') return false;
        const numeric = Number(value);
        return Number.isFinite(numeric) && numeric >= 0;
      }
      case 'strengths': {
        const strengths = getFieldValue('strengths');
        const hasOther = strengths.includes('other');
        const hasOtherText = getFieldValue('strengthsOther').trim().length > 0;
        const hasStandard = strengths.filter((v) => v !== 'other').length > 0;
        return hasStandard || (hasOther && hasOtherText);
      }
      case 'lookingFor': {
        const selections = normalizeLookingFor(getFieldValue('lookingFor'));
        const hasTransition = selections.includes('transition');
        const hasDetail = formData.transitionTarget.trim().length > 0;
        return selections.length > 0 && (!hasTransition || hasDetail);
      }
      case 'email': {
        const value = getFieldValue('email').trim();
        if (!value) return false;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const passwordValid = user ? true : formData.password.trim().length >= 6;
        return emailRegex.test(value) && passwordValid;
      }
      default:
        return true;
    }
  };

  const handleFieldChange = <K extends keyof AssessmentFormData>(field: K, value: AssessmentFormData[K]) => {
    if (!isAssessmentActive) {
      setHasAssessmentStarted(true);
      setIsAssessmentActive(true);
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = (autoAdvance = false) => {
    setTransitionDirection('forward');
    if (currentStep >= steps.length - 1) return;
    if (!isStepValid(currentStep)) {
      if (!autoAdvance) setError('Please complete this question before continuing.');
      return;
    }
    setError('');
    setCurrentStep((prev) => {
      const next = Math.min(prev + 1, steps.length - 1);
      setFurthestStep((prevF) => Math.max(prevF, next));
      return next;
    });
  };

  const handlePrevious = () => {
    if (currentStep === 0) return;
    setError('');
    setTransitionDirection('backward');
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const goToStep = (index: number) => {
    if (index === currentStep) return;
    if (index > furthestStep) return;
    if (index > currentStep && !isStepValid(currentStep)) {
      setError('Please complete this question before continuing.');
      return;
    }
    setError('');
    setTransitionDirection(index > currentStep ? 'forward' : 'backward');
    setCurrentStep(index);
  };

  const maybeAutoAdvance = () => {
    if (currentStep < steps.length - 1) {
      setTransitionDirection('forward');
      setTimeout(() => handleNext(true), 200);
    }
  };

  const handleEnterKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      if (currentStep < steps.length - 1) {
        event.preventDefault();
        handleNext();
      }
      scrollToSection('assessment');
    }
  };

  const lookingForSelections = normalizeLookingFor(formData.lookingFor);
  const transitionTargetValue = lookingForSelections.includes('transition') ? formData.transitionTarget.trim() : '';
  const goalLabels = lookingForSelections.map((value) => {
    if (value === 'transition' && formData.transitionTarget.trim()) {
      return `${goalLabelMap.transition} (${formData.transitionTarget.trim()})`;
    }
    return goalLabelMap[value as keyof typeof goalLabelMap] ?? value;
  }).filter(Boolean);
  const goalText = goalLabels.length > 0 ? goalLabels.join(', ') : 'your next chapter';

  const industryOptions = steps.find((s) => s.id === 'industry')?.options ?? [];
  const industryLabels = industryOptions.filter((o) => formData.industry.includes(o.value)).map((o) => o.label);
  const industryLabel = industryLabels.join(', ');
  const strengthsWithOther = getStrengthsWithOther(formData);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!isStepValid(currentStep)) {
      setError('Please complete this question before continuing.');
      return;
    }
    if (!formData.jobTitle || !formData.industry.length || !formData.yearsExperience || !formData.strengths.length || !formData.email || !normalizeLookingFor(formData.lookingFor).length) {
      setError('Please fill in all required fields before submitting.');
      return;
    }
    if (lookingForSelections.includes('transition') && !formData.transitionTarget.trim()) {
      setError('Please specify the role or discipline you want to transition into.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!user && formData.password.trim().length < 6) {
      setError('Please create a password with at least 6 characters.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    const yearsExperienceValue = Number.parseInt(formData.yearsExperience, 10);
    if (Number.isNaN(yearsExperienceValue) || yearsExperienceValue < 0) {
      setError('Please enter a valid number of years of experience.');
      setIsSubmitting(false);
      return;
    }

    try {
      const supabase = getSupabaseClient();
      let currentUserId: string | null = user?.id ?? null;

      if (!user) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: formData.email.trim(),
          password: formData.password,
          options: { data: { full_name: formData.fullName || null } }
        });
        if (signUpError) {
          setError(
            signUpError.message.includes('already registered')
              ? 'You already have an account with this email. Try logging in instead.'
              : signUpError.message || 'We could not create your account. Please try again.'
          );
          return;
        }
        currentUserId = signUpData.user?.id ?? null;
      }

      const serializedStrengths = JSON.stringify(strengthsWithOther ?? []);
      const serializedLookingFor = JSON.stringify(lookingForSelections);
      const transitionTarget = lookingForSelections.includes('transition') && transitionTargetValue ? transitionTargetValue : null;

      let assessmentId: string;
      try {
        const result = await insertAssessmentResponse({
          jobTitle: formData.jobTitle,
          industry: formData.industry,
          yearsExperience: yearsExperienceValue,
          strengths: serializedStrengths,
          typicalWeek: formData.typicalWeek || null,
          lookingFor: serializedLookingFor,
          transitionTarget: transitionTarget,
          workPreferences: formData.workPreferences || null,
          email: formData.email.trim(),
          fullName: formData.fullName || null,
          userId: currentUserId
        });
        assessmentId = result.id;
      } catch (insertError) {
        console.error('Failed to save assessment response', insertError);
        setError("We couldn't save your answers. Please try again.");
        return;
      }

      const insights = await generateSnapshotInsights({
        formData: { ...formData, strengths: strengthsWithOther, lookingFor: lookingForSelections, transitionTarget: transitionTargetValue },
        goalText,
        industryLabels,
        assessmentId
      });

      try {
        await attachSnapshotInsights(assessmentId, insights);
      } catch (snapshotError) {
        console.error('Failed to attach snapshot insights', snapshotError);
      }

      setSnapshotInsights(insights);
    } catch (supabaseError) {
      console.error('Error saving assessment response', supabaseError);
      setError("We're having trouble connecting right now. Please try again later.");
      return;
    } finally {
      setIsSubmitting(false);
    }

    setShowSnapshot(true);
    setIsAssessmentActive(false);
    setHasAssessmentStarted(false);

    setTimeout(() => { scrollToSection('snapshot'); }, 100);
  };

  const handleExitAssessment = () => {
    setIsAssessmentActive(false);
    setShowSnapshot(false);
    setCurrentStep(0);
    setFurthestStep(0);
    setError('');
    setFormData(createInitialFormData());
    setHasAssessmentStarted(false);
    setTransitionDirection('forward');
    setStepAnimationKey(0);
    setIsSubmitting(false);
    setSnapshotInsights(null);
  };

  const startAssessment = () => {
    setHasAssessmentStarted(true);
    setIsAssessmentActive(true);
    setShowSnapshot(false);
    setSnapshotInsights(null);
    setTransitionDirection('forward');
    scrollToSection('assessment');
  };

  const stepAnimationClass = transitionDirection === 'forward' ? 'animate-step-forward' : 'animate-step-backward';

  return {
    user,
    formData,
    steps,
    currentStep,
    furthestStep,
    currentStepDefinition,
    error,
    isSubmitting,
    isAssessmentMode,
    isAssessmentActive,
    hasAssessmentStarted,
    showSnapshot,
    snapshotInsights,
    stepAnimationKey,
    stepAnimationClass,
    isJobTitleOpen,
    setIsJobTitleOpen,
    jobTitleQuery,
    setJobTitleQuery,
    isCustomJobTitle,
    setIsCustomJobTitle,
    jobTitleOptions,
    interactiveRefs,
    jobTitleDropdownRef,
    customJobTitleInputRef,
    goalText,
    industryLabel,
    strengthsWithOther,
    normalizeLookingFor,
    getFieldValue,
    isStepValid,
    handleFieldChange,
    handleNext,
    handlePrevious,
    goToStep,
    maybeAutoAdvance,
    handleEnterKey,
    handleSubmit,
    handleExitAssessment,
    startAssessment
  };
}
