import { useState, FormEvent, KeyboardEvent, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, TrendingUp, Map, X } from 'lucide-react';
import AssessmentPreviewPanel from '../components/AssessmentPreviewPanel';
import { getSupabaseClient } from '../lib/supabaseClient';
import { generateSnapshotInsights } from '../lib/generateSnapshotInsights';
import type { AssessmentFormData, SnapshotInsights } from '../types/assessment';
import { useAuth } from '../context/AuthContext';
import { jobTitles } from '../data/jobTitles';

type StepType = 'input' | 'textarea' | 'select' | 'multiselect' | 'radio' | 'signup';

type InputModeType =
  | 'none'
  | 'text'
  | 'tel'
  | 'url'
  | 'email'
  | 'numeric'
  | 'decimal'
  | 'search';

interface StepDefinition {
  id: keyof AssessmentFormData;
  title: string;
  prompt: string;
  type: StepType;
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string; description?: string }[];
  rows?: number;
  helperText?: string;
  inputMode?: InputModeType;
  inputType?: string;
}

const createInitialFormData = (): AssessmentFormData => ({
  jobTitle: '',
  industry: [],
  yearsExperience: '',
  strengths: [],
  strengthsOther: '',
  typicalWeek: '',
  lookingFor: [],
  transitionTarget: '',
  workPreferences: '',
  fullName: '',
  email: '',
  password: ''
});

function Home() {
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

  const interactiveRefs = useRef<Record<string, HTMLElement | null>>({});
  const jobTitleDropdownRef = useRef<HTMLDivElement | null>(null);
  const customJobTitleInputRef = useRef<HTMLInputElement | null>(null);

  const isAssessmentMode = isAssessmentActive && !showSnapshot;

  const getStrengthsWithOther = (data: AssessmentFormData = formData) => {
    const strengths = data.strengths || [];
    const customStrength = data.strengthsOther.trim();
    const hasOther = strengths.includes('other');
    const baseStrengths = strengths.filter((value) => value !== 'other');

    if (hasOther && customStrength) {
      return [...baseStrengths, customStrength];
    }

    return baseStrengths;
  };

  const normalizeLookingFor = (value: AssessmentFormData['lookingFor']) => {
    if (Array.isArray(value)) {
      return value;
    }

    if (value) {
      return [value];
    }

    return [];
  };

  useEffect(() => {
    setStepAnimationKey((prev) => prev + 1);
  }, [currentStep]);

  useEffect(() => {
    if (isAssessmentMode) {
      scrollToSection('assessment');
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isAssessmentMode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        jobTitleDropdownRef.current &&
        !jobTitleDropdownRef.current.contains(event.target as Node)
      ) {
        setIsJobTitleOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setJobTitleQuery(formData.jobTitle);
  }, [formData.jobTitle]);

  const stepAnimationClass =
    transitionDirection === 'forward' ? 'animate-step-forward' : 'animate-step-backward';

  const steps: StepDefinition[] = [
    {
      id: 'jobTitle',
      title: 'Who you are at work',
      prompt: 'What is your current job title?',
      type: 'input',
      required: true,
      placeholder: 'e.g., Senior Product Manager'
    },
    {
      id: 'industry',
      title: 'Your context',
      prompt: 'Which industries are you working in?',
      type: 'multiselect',
      required: true,
      placeholder: 'Select your industries',
      options: [
        { value: 'software-tech', label: 'Software / Tech' },
        { value: 'design-creative', label: 'Design / Creative' },
        { value: 'marketing-sales', label: 'Marketing / Sales' },
        {
          value: 'Banking / Financial Services',
          label: 'Banking / Financial Services'
        },
        { value: 'finance-accounting', label: 'Finance / Accounting' },
        { value: 'operations-admin', label: 'Operations / Admin' },
        { value: 'healthcare', label: 'Healthcare' },
        { value: 'education-training', label: 'Education / Training' },
        { value: 'public-nonprofit', label: 'Public Sector / Nonprofit' },
        { value: 'other', label: 'Other' }
      ]
    },
    {
      id: 'yearsExperience',
      title: 'Experience snapshot',
      prompt: 'How many years of experience do you have?',
      type: 'input',
      required: true,
      inputType: 'number',
      placeholder: 'e.g., 8',
      helperText: 'Enter a whole number. If less than one year, enter 0.'
    },
    {
      id: 'strengths',
      title: 'Your strengths & skills',
      prompt: 'What do you consider your core strengths and skills?',
      type: 'multiselect',
      required: true,
      helperText: 'Select all that apply — you can choose multiple.',
      options: [
        { value: 'leadership', label: 'Leadership & people management' },
        { value: 'stakeholder-communication', label: 'Stakeholder communication' },
        { value: 'product-strategy', label: 'Product strategy' },
        { value: 'user-research', label: 'User research' },
        { value: 'data-analysis', label: 'Data analysis & insights' },
        { value: 'technical-architecture', label: 'Technical architecture' },
        { value: 'project-delivery', label: 'Project management & delivery' },
        { value: 'design-thinking', label: 'Design thinking & UX' },
        { value: 'sales-partnerships', label: 'Sales & partnerships' },
        { value: 'process-optimisation', label: 'Process optimisation' },
        { value: 'coaching-mentoring', label: 'Coaching & mentoring' },
        { value: 'writing-storytelling', label: 'Writing & storytelling' },
        { value: 'other', label: 'Other (write manually)' }
      ]
    },
    {
      id: 'typicalWeek',
      title: 'Your day-to-day',
      prompt: 'What does a typical workweek look like for you?',
      type: 'textarea',
      rows: 5,
      helperText:
        'Optional — outline key tasks and time patterns (e.g., 50% client meetings, 30% analysis, 20% admin; mornings for deep work; on-site Tue–Thu).'
    },
    {
      id: 'lookingFor',
      title: 'Your direction',
      prompt: 'What are you mainly looking for right now?',
      type: 'multiselect',
      required: true,
      helperText: 'Select all that apply to your current priorities.',
      options: [
        {
          value: 'pioneer',
          label: 'Chart a path into roles that do not yet exist at scale'
        },
        {
          value: 'strengthen',
          label: 'Strengthen and future-proof my current role'
        },
        {
          value: 'transition',
          label: 'Transition to a new role or discipline'
        },
        {
          value: 'explore',
          label: 'Explore side projects or additional income streams'
        }
      ]
    },
    {
      id: 'workPreferences',
      title: 'Designing your next chapter',
      prompt: 'What would you like to see more (or less) of in your work?',
      type: 'textarea',
      rows: 4,
      helperText: 'Optional — e.g., more ownership, more creativity, more stability, less routine work…'
    },
    {
      id: 'email',
      title: 'Create your account',
      prompt: 'Sign up to save your roadmap and unlock your personalised plan.',
      type: 'signup',
      required: true
    }
  ];

  const currentStepDefinition = steps[currentStep];
  const currentInputId = `assessment-${currentStepDefinition.id}`;
  const currentPromptId = `${currentInputId}-prompt`;
  const currentHelperTextId = currentStepDefinition.helperText ? `${currentInputId}-helper` : undefined;

  useEffect(() => {
    if (!isAssessmentMode) {
      return;
    }

    const element = interactiveRefs.current[currentStepDefinition.id];
    element?.focus();
  }, [currentStepDefinition.id, isAssessmentMode]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const getFieldValue = <K extends keyof AssessmentFormData>(field: K): AssessmentFormData[K] =>
    formData[field];

  const isStepValid = (stepIndex: number) => {
    const step = steps[stepIndex];
    if (!step) return true;

    if (!step.required) {
      return true;
    }

    switch (step.id) {
      case 'jobTitle':
        return getFieldValue('jobTitle').trim().length > 0;
      case 'industry': {
        const industries = getFieldValue('industry');
        return industries.length > 0;
      }
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
        const hasStandardStrengths = strengths.filter((value) => value !== 'other').length > 0;
        return hasStandardStrengths || (hasOther && hasOtherText);
      }
      case 'lookingFor': {
        const lookingForSelections = normalizeLookingFor(getFieldValue('lookingFor'));
        const hasTransitionFocus = lookingForSelections.includes('transition');
        const hasPrimaryFocus = lookingForSelections.length > 0;
        const hasTransitionDetail = formData.transitionTarget.trim().length > 0;
        return hasPrimaryFocus && (!hasTransitionFocus || hasTransitionDetail);
      }
      case 'email': {
        const value = getFieldValue('email').trim();
        if (!value) return false;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isEmailValid = emailRegex.test(value);
        const passwordIsValid = user ? true : formData.password.trim().length >= 6;
        return isEmailValid && passwordIsValid;
      }
      default:
        return true;
    }
  };

  const handleFieldChange = <K extends keyof AssessmentFormData>(
    field: K,
    value: AssessmentFormData[K]
  ) => {
    if (!isAssessmentActive) {
      setHasAssessmentStarted(true);
      setIsAssessmentActive(true);
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = (autoAdvance = false) => {
    setTransitionDirection('forward');
    if (currentStep >= steps.length - 1) {
      return;
    }

    if (!isStepValid(currentStep)) {
      if (!autoAdvance) {
        setError('Please complete this question before continuing.');
      }
      return;
    }

    setError('');
    setCurrentStep((prev) => {
      const next = Math.min(prev + 1, steps.length - 1);
      setFurthestStep((prevFurthest) => Math.max(prevFurthest, next));
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

  const handleEnterKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      if (currentStep < steps.length - 1) {
        event.preventDefault();
        handleNext();
      }

      scrollToSection('assessment');
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (!isStepValid(currentStep)) {
      setError('Please complete this question before continuing.');
      return;
    }

    if (
      !formData.jobTitle ||
      !formData.industry.length ||
      !formData.yearsExperience ||
      !formData.strengths.length ||
      !formData.email ||
      !normalizeLookingFor(formData.lookingFor).length
    ) {
      setError('Please fill in all required fields before submitting.');
      return;
    }

    const lookingForSelections = normalizeLookingFor(formData.lookingFor);
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

      if (!user) {
        const { error: signUpError } = await supabase.auth.signUp({
          email: formData.email.trim(),
          password: formData.password,
          options: {
            data: { full_name: formData.fullName || null }
          }
        });

        if (signUpError) {
          setError(
            signUpError.message.includes('already registered')
              ? 'You already have an account with this email. Try logging in instead.'
              : signUpError.message || 'We could not create your account. Please try again.'
          );
          return;
        }
      }

      const insights = await generateSnapshotInsights({
        formData: {
          ...formData,
          strengths: strengthsWithOther,
          lookingFor: lookingForSelections,
          transitionTarget: transitionTargetValue
        },
        goalText,
        industryLabels
      });

      const serializedStrengths = JSON.stringify(strengthsWithOther ?? []);
      const serializedLookingFor = JSON.stringify(lookingForSelections);
      const transitionTarget =
        lookingForSelections.includes('transition') && transitionTargetValue
          ? transitionTargetValue
          : null;

      const { error: submissionError } = await supabase.from('assessment_responses').insert({
        job_title: formData.jobTitle,
        industry: formData.industry,
        years_experience: yearsExperienceValue,
        strengths: serializedStrengths,
        typical_week: formData.typicalWeek || null,
        looking_for: serializedLookingFor,
        transition_target: transitionTarget,
        work_preferences: formData.workPreferences || null,
        email: formData.email.trim(),
        full_name: formData.fullName || null,
        submitted_at: new Date().toISOString(),
        snapshot_insights: insights
      });

      if (submissionError) {
        console.error('Failed to save assessment response', submissionError);
        setError('We couldn\'t save your answers. Please try again.');
        return;
      }

      setSnapshotInsights(insights);
    } catch (supabaseError) {
      console.error('Error saving assessment response', supabaseError);
      setError('We\'re having trouble connecting right now. Please try again later.');
      return;
    } finally {
      setIsSubmitting(false);
    }

    setShowSnapshot(true);
    setIsAssessmentActive(false);
    setHasAssessmentStarted(false);

    setTimeout(() => {
      scrollToSection('snapshot');
    }, 100);
  };

  const goalLabelMap = {
    strengthen: 'Strengthen and future-proof my current role',
    transition: 'Transition to a new role or discipline',
    explore: 'Explore side projects or additional income streams',
    pioneer: 'Chart a path into roles that do not yet exist at scale'
  } as const;

  const lookingForSelections = normalizeLookingFor(formData.lookingFor);
  const transitionTargetValue = lookingForSelections.includes('transition')
    ? formData.transitionTarget.trim()
    : '';
  const goalLabels = lookingForSelections
    .map((value) => {
      if (value === 'transition' && formData.transitionTarget.trim()) {
        return `${goalLabelMap.transition} (${formData.transitionTarget.trim()})`;
      }

      return goalLabelMap[value as keyof typeof goalLabelMap] ?? value;
    })
    .filter(Boolean);
  const goalText = goalLabels.length > 0 ? goalLabels.join(', ') : 'your next chapter';

  const industryOptions = steps.find((step) => step.id === 'industry')?.options ?? [];
  const industryLabels = industryOptions
    .filter((option) => formData.industry.includes(option.value))
    .map((option) => option.label);
  const industryLabel = industryLabels.join(', ');
  const strengthsWithOther = getStrengthsWithOther();

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

  return (
    <div
      className={`${
        isAssessmentMode
          ? 'absolute min-h-screen h-screen w-full bg-slate-100 text-slate-900'
          : 'relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900'
      }`}
    >
      {!isAssessmentMode && (
        <>
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-48 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-emerald-200/40 blur-3xl" />
            <div className="absolute -bottom-32 right-0 h-80 w-80 rounded-full bg-sky-200/40 blur-3xl" />
            <div className="absolute bottom-16 left-12 h-48 w-48 rounded-full bg-teal-200/30 blur-3xl" />
          </div>
          <section className="relative px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
            <div className="mx-auto max-w-5xl text-center">
              <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-4 py-1 text-sm font-medium text-emerald-700 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Guided AI-powered planning for professionals
              </div>
              <h1 className="mt-8 text-4xl font-bold leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Design your next chapter, not just your next job
              </h1>
              <p className="mx-auto mt-6 max-w-3xl text-lg text-slate-700 sm:text-xl">
                Capture who you are today, how you work, and where you want to go next as technology reshapes your industry.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <button
                  onClick={startAssessment}
                  className="w-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 px-10 py-4 text-base font-semibold text-white shadow-lg shadow-emerald-300/30 transition hover:shadow-xl hover:shadow-emerald-200/40 sm:w-auto"
                >
                  <span className="inline-flex items-center justify-center gap-2 text-xl">
                    Start your assessment
                    <ArrowRight size={20} />
                  </span>
                </button>
                <a
                  href="#how-it-works"
                  className="group inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 transition hover:text-emerald-500"
                >
                  How does this work?
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </a>
              </div>
              <p className="mt-10 text-sm uppercase tracking-[0.3em] text-slate-600">
                Built for professionals who want their work to stay meaningful and relevant.
              </p>
            </div>
          </section>
        </>
      )}

      {!isAssessmentMode && (
        <section id="how-it-works" className="relative bg-white/80 px-4 py-24 sm:px-6 lg:px-8">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.08),_transparent_60%)]" />
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-3xl font-bold text-slate-900 sm:text-4xl">
              How re-imagined.me supports your next step
            </h2>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              <div className="group relative overflow-hidden rounded-2xl border border-slate-300 bg-white p-8 shadow-lg shadow-emerald-200/10 transition hover:-translate-y-1 hover:border-emerald-200/60 hover:shadow-emerald-200/30">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <CheckCircle size={24} />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-slate-900">
                  Clarify your current position
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-700">
                  We map your role, skills, and day-to-day responsibilities.
                </p>
              </div>

              <div className="group relative overflow-hidden rounded-2xl border border-slate-300 bg-white p-8 shadow-lg shadow-emerald-200/10 transition hover:-translate-y-1 hover:border-emerald-200/60 hover:shadow-emerald-200/30">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
                  <TrendingUp size={24} />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-slate-900">
                  Explore future-aligned paths
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-700">
                  We highlight roles and emerging opportunities that fit your strengths and ambitions.
                </p>
              </div>

              <div className="group relative overflow-hidden rounded-2xl border border-slate-300 bg-white p-8 shadow-lg shadow-emerald-200/10 transition hover:-translate-y-1 hover:border-emerald-200/60 hover:shadow-emerald-200/30">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                  <Map size={24} />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-slate-900">
                  Define your next steps
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-700">
                  We outline a structured 90-day plan to move toward your next chapter.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      <section
        id="assessment"
        className={`${
          isAssessmentMode
            ? 'relative flex min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8'
            : 'relative px-4 py-24 sm:px-6 lg:px-8'
        }`}
      >
        {!isAssessmentMode && (
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,_rgba(115,110,254,0.12),_transparent_65%)]" />
        )}
        {isAssessmentMode && (
          <button
            type="button"
            onClick={handleExitAssessment}
            className="absolute z-50 right-4 top-4 flex items-center gap-2 rounded-full border border-slate-300 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700 transition hover:border-emerald-300 hover:text-emerald-600"
          >
            <X size={16} aria-hidden="true" />
            Exit
          </button>
        )}
        <div
          className={`${
            isAssessmentMode
              ? 'relative mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start'
              : 'relative mx-auto max-w-3xl'
          }`}
        >
          <div
            className={`${
              isAssessmentMode
                ? 'order-1 flex w-full justify-center lg:order-1'
                : 'w-full'
            }`}
          >
            {!isAssessmentMode && (
              <div className="mb-12 text-center">
                <h2 className="mb-4 text-3xl font-bold text-slate-900 sm:text-4xl">
                  Start your quick assessment
                </h2>
                <p className="text-slate-700">
                  This is a simplified starting point. We'll later use your answers to generate a more personalised next-chapter roadmap.
                </p>
              </div>
            )}

            <form
              id='assessment-form'
              onSubmit={handleSubmit}
              className={`${
                isAssessmentMode
                  ? 'mx-auto w-full max-w-2xl rounded-3xl border border-slate-300 bg-white p-6 sm:p-10 shadow-2xl shadow-emerald-200/20 mt-14'
                  : 'rounded-3xl border border-slate-300/70 bg-white/90 backdrop-blur-sm p-6 sm:p-10 shadow-xl shadow-emerald-200/20'
              } ${hasAssessmentStarted ? 'animate-assessment-enter' : ''}`}
            >
            <div className="space-y-8">
              {isAssessmentMode && (
                <div aria-live="polite" className="sr-only" key={currentStepDefinition.id}>
                  {currentStepDefinition.prompt}
                </div>
              )}
              <div>
                <div
                  className={`flex items-center justify-between text-xs uppercase tracking-wide ${
                    isAssessmentMode ? 'text-slate-600' : 'text-slate-600'
                  }`}
                >
                  <span>Question {currentStep + 1} of {steps.length}</span>
                  <span className="truncate text-right">{steps[currentStep].title}</span>
                </div>
                <div className="mt-4 flex items-center justify-center gap-3">
                  {steps.map((step, index) => {
                    const isActive = index === currentStep;
                    const isComplete = index < currentStep;
                    const isAccessible = index <= furthestStep;
                    return (
                      <button
                        key={step.id}
                        type="button"
                        onClick={() => goToStep(index)}
                        disabled={!isAccessible}
                        className={`h-2.5 w-2.5 rounded-full transition ${
                          isActive
                            ? isAssessmentMode
                              ? 'bg-emerald-500'
                              : 'bg-emerald-500'
                            : isComplete
                              ? isAssessmentMode
                                ? 'bg-emerald-200'
                                : 'bg-emerald-200'
                              : isAssessmentMode
                                ? 'bg-slate-200'
                                : 'bg-slate-200'
                        } ${!isAccessible ? 'opacity-40 cursor-not-allowed' : 'hover:scale-110'}`}
                        aria-label={`Go to question ${index + 1}`}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="relative">
                <div
                  key={stepAnimationKey}
                  className={`space-y-6 ${stepAnimationClass}`}
                >
                  <div>
                    <h3
                      id={currentPromptId}
                      className={`text-2xl sm:text-3xl font-semibold ${
                        isAssessmentMode ? 'text-slate-900' : 'text-slate-900'
                      }`}
                    >
                      {currentStepDefinition.prompt}
                    </h3>
                    {currentStepDefinition.helperText && (
                      <p
                        id={currentHelperTextId}
                        className={`mt-2 text-sm ${
                          isAssessmentMode ? 'text-slate-600' : 'text-slate-600'
                        }`}
                      >
                        {currentStepDefinition.helperText}
                      </p>
                    )}
                  </div>
                  <div>
                    {(() => {
                      const step = currentStepDefinition;
                      const fieldValue = getFieldValue(step.id);
                      const stringValue = typeof fieldValue === 'string' ? fieldValue : '';
                      const stringArrayValue = Array.isArray(fieldValue)
                        ? fieldValue
                        : step.id === 'lookingFor'
                          ? normalizeLookingFor(fieldValue as AssessmentFormData['lookingFor'])
                          : [];
                      const commonInputClasses = `w-full rounded-xl border px-4 py-3 text-base transition focus:outline-none focus:ring-2 focus:border-transparent ${
                        isAssessmentMode
                          ? 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-emerald-200/60'
                          : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-emerald-200/60'
                      }`;

                      if (step.id === 'jobTitle') {
                        const filteredJobTitles = jobTitles.filter((title) =>
                          title.toLowerCase().includes(jobTitleQuery.toLowerCase().trim())
                        );

                        const selectJobTitle = (title: string) => {
                          handleFieldChange(step.id, title);
                          setJobTitleQuery(title);
                          setIsJobTitleOpen(false);
                          setIsCustomJobTitle(false);
                        };

                        return (
                          <div className="relative" ref={jobTitleDropdownRef}>
                            <label htmlFor={currentInputId} className="sr-only">
                              {step.prompt}
                            </label>
                            <input
                              id={currentInputId}
                              role="combobox"
                              aria-expanded={isJobTitleOpen}
                              aria-controls="job-title-listbox"
                              aria-autocomplete="list"
                              type="text"
                              value={jobTitleQuery}
                              onFocus={() => setIsJobTitleOpen(true)}
                              onChange={(event) => {
                                const value = event.target.value;
                                handleFieldChange(step.id, value);
                                setJobTitleQuery(value);
                                setIsJobTitleOpen(true);
                                setIsCustomJobTitle(false);
                              }}
                              onKeyDown={handleEnterKey}
                              placeholder={step.placeholder}
                              className={`${commonInputClasses} pr-10`}
                              aria-describedby={currentHelperTextId}
                              ref={(element: HTMLInputElement | null) => {
                                interactiveRefs.current[step.id] = element;
                              }}
                            />
                            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                              <svg
                                className="h-4 w-4"
                                viewBox="0 0 20 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                aria-hidden="true"
                              >
                                <path
                                  d="M5 7.5L10 12.5L15 7.5"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>
                            {isJobTitleOpen && (
                              <div
                                id="job-title-listbox"
                                role="listbox"
                                className="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg"
                              >
                                {filteredJobTitles.length > 0 ? (
                                  filteredJobTitles.map((title) => (
                                    <button
                                      type="button"
                                      key={title}
                                      role="option"
                                      aria-selected={stringValue === title}
                                      onMouseDown={(event) => event.preventDefault()}
                                      onClick={() => {
                                        selectJobTitle(title);
                                        maybeAutoAdvance();
                                      }}
                                      className="block w-full px-4 py-2 text-left text-slate-800 transition hover:bg-emerald-50"
                                    >
                                      {title}
                                    </button>
                                  ))
                                ) : (
                                  <div className="px-4 py-3 text-sm text-slate-500">No matching job titles</div>
                                )}
                                <div className="border-t border-slate-100">
                                  <button
                                    type="button"
                                    role="option"
                                    aria-selected={isCustomJobTitle}
                                    onMouseDown={(event) => event.preventDefault()}
                                    onClick={() => {
                                      setIsCustomJobTitle(true);
                                      setIsJobTitleOpen(false);
                                      setJobTitleQuery('Other');
                                      handleFieldChange(step.id, '');
                                      requestAnimationFrame(() => {
                                        customJobTitleInputRef.current?.focus();
                                      });
                                    }}
                                    className="block w-full px-4 py-2 text-left text-slate-800 transition hover:bg-emerald-50"
                                  >
                                    Other
                                  </button>
                                </div>
                              </div>
                            )}
                            {isCustomJobTitle && (
                              <div className="mt-3">
                                <label htmlFor={`${currentInputId}-custom`} className="sr-only">
                                  Enter your job title
                                </label>
                                <input
                                  id={`${currentInputId}-custom`}
                                  type="text"
                                  value={stringValue}
                                  onChange={(event) => handleFieldChange(step.id, event.target.value)}
                                  onKeyDown={handleEnterKey}
                                  placeholder="Type your job title"
                                  className={commonInputClasses}
                                  aria-describedby={currentHelperTextId}
                                  ref={(element: HTMLInputElement | null) => {
                                    customJobTitleInputRef.current = element;
                                    interactiveRefs.current[step.id] = element;
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        );
                      }

                      if (step.type === 'input') {
                        return (
                          <>
                            <label htmlFor={currentInputId} className="sr-only">
                              {step.prompt}
                            </label>
                            <input
                              id={currentInputId}
                              type={step.inputType ?? 'text'}
                              inputMode={step.inputMode}
                              value={stringValue}
                              onChange={(event) => handleFieldChange(step.id, event.target.value)}
                              onKeyDown={handleEnterKey}
                              placeholder={step.placeholder}
                              className={commonInputClasses}
                              min={step.inputType === 'number' ? 0 : undefined}
                              aria-describedby={currentHelperTextId}
                              ref={(element: HTMLInputElement | null) => {
                                interactiveRefs.current[step.id] = element;
                              }}
                            />
                          </>
                        );
                      }

                      if (step.type === 'textarea') {
                        return (
                          <>
                            <label htmlFor={currentInputId} className="sr-only">
                              {step.prompt}
                            </label>
                            <textarea
                              id={currentInputId}
                              value={stringValue}
                              onChange={(event) => handleFieldChange(step.id, event.target.value)}
                              placeholder={step.placeholder}
                              rows={step.rows ?? 4}
                              className={commonInputClasses}
                              aria-describedby={currentHelperTextId}
                              ref={(element: HTMLTextAreaElement | null) => {
                                interactiveRefs.current[step.id] = element;
                              }}
                            />
                          </>
                        );
                      }

                      if (step.type === 'select' && step.options) {
                        return (
                          <>
                            <label htmlFor={currentInputId} className="sr-only">
                              {step.prompt}
                            </label>
                            <select
                              id={currentInputId}
                              value={stringValue}
                              onChange={(event) => {
                                handleFieldChange(step.id, event.target.value);
                                if (event.target.value) {
                                  maybeAutoAdvance();
                                }
                              }}
                              className={`${commonInputClasses} appearance-none`}
                              aria-describedby={currentHelperTextId}
                              ref={(element: HTMLSelectElement | null) => {
                                interactiveRefs.current[step.id] = element;
                              }}
                            >
                              <option value="">{step.placeholder ?? 'Select an option'}</option>
                              {step.options.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </>
                        );
                      }

                      if (step.type === 'multiselect' && step.options) {
                        if (step.id === 'strengths') {
                          const isOtherSelected = stringArrayValue.includes('other');
                          return (
                            <div
                              className="flex flex-wrap gap-3"
                              role="group"
                              aria-describedby={currentHelperTextId}
                            >
                              {step.options.map((option, optionIndex) => {
                                const isSelected = stringArrayValue.includes(option.value);
                                const isOtherOption = option.value === 'other';
                                return (
                                  <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                      const updatedStrengths = isSelected
                                        ? stringArrayValue.filter((value) => value !== option.value)
                                        : [...stringArrayValue, option.value];
                                      handleFieldChange(
                                        step.id,
                                        updatedStrengths as AssessmentFormData[typeof step.id]
                                      );
                                      if (isOtherOption && isSelected) {
                                        handleFieldChange(
                                          'strengthsOther',
                                          '' as AssessmentFormData['strengthsOther']
                                        );
                                      }
                                    }}
                                    aria-pressed={isSelected}
                                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 ${
                                      isSelected
                                        ? 'border-emerald-300 bg-emerald-50 text-emerald-800 shadow-inner shadow-emerald-200/60 focus:ring-emerald-200'
                                        : 'border-slate-300 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50 focus:ring-emerald-200'
                                    }`}
                                    ref={(element: HTMLButtonElement | null) => {
                                      if (optionIndex === 0) {
                                        interactiveRefs.current[step.id] = element;
                                      }
                                    }}
                                  >
                                    {option.label}
                                  </button>
                                );
                              })}
                              {isOtherSelected && (
                                <div className="mt-2 w-full space-y-2">
                                  <label
                                    htmlFor={`${currentInputId}-other`}
                                    className="block text-sm font-semibold text-slate-800"
                                  >
                                    Describe your other strengths
                                  </label>
                                  <input
                                    id={`${currentInputId}-other`}
                                    type="text"
                                    value={formData.strengthsOther}
                                    onChange={(event) =>
                                      handleFieldChange(
                                        'strengthsOther',
                                        event.target.value as AssessmentFormData['strengthsOther']
                                      )
                                    }
                                    className={`${commonInputClasses} max-w-xl`}
                                    placeholder="e.g., domain expertise, unique tools, or niches"
                                    aria-describedby={currentHelperTextId}
                                  />
                                  <p className="text-sm text-slate-500">
                                    We'll include this alongside your selected strengths.
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        }

                        const isTransitionSelected = step.id === 'lookingFor'
                          ? stringArrayValue.includes('transition')
                          : false;

                        return (
                          <div className="space-y-4">
                            <fieldset
                              className="space-y-3"
                              aria-describedby={currentHelperTextId}
                            >
                              <legend className="sr-only">{step.prompt}</legend>
                              {step.options.map((option, optionIndex) => {
                                const optionId = `${currentInputId}-${option.value}`;
                                const isSelected = stringArrayValue.includes(option.value);
                                return (
                                  <label
                                    key={option.value}
                                    htmlFor={optionId}
                                    className={`flex items-start gap-3 rounded-xl border px-4 py-3 cursor-pointer transition ${
                                      isSelected
                                        ? isAssessmentMode
                                          ? 'border-emerald-300 bg-emerald-50 shadow-inner shadow-emerald-200/30'
                                          : 'border-emerald-300 bg-emerald-50 shadow-inner shadow-emerald-200/30'
                                        : isAssessmentMode
                                          ? 'border-slate-300 hover:border-emerald-300 hover:bg-emerald-50'
                                          : 'border-slate-300 hover:border-emerald-300 hover:bg-emerald-50'
                                    }`}
                                  >
                                    <input
                                      id={optionId}
                                      type="checkbox"
                                      name={`${step.id}-${option.value}`}
                                      value={option.value}
                                      checked={isSelected}
                                      onChange={(event) => {
                                        const updatedSelections = event.target.checked
                                          ? [...stringArrayValue, option.value]
                                          : stringArrayValue.filter((value) => value !== option.value);

                                        handleFieldChange(
                                          step.id,
                                          updatedSelections as AssessmentFormData[typeof step.id]
                                        );

                                        if (
                                          step.id === 'lookingFor' &&
                                          !updatedSelections.includes('transition')
                                        ) {
                                          handleFieldChange('transitionTarget', '');
                                        }
                                      }}
                                      className={`mt-1 focus:ring-2 ${
                                        isAssessmentMode
                                          ? 'text-emerald-500 focus:ring-emerald-200'
                                          : 'text-emerald-500 focus:ring-emerald-200'
                                      }`}
                                      ref={(element: HTMLInputElement | null) => {
                                        if (optionIndex === 0) {
                                          interactiveRefs.current[step.id] = element;
                                        }
                                      }}
                                    />
                                    <span className="text-slate-800">{option.label}</span>
                                  </label>
                                );
                              })}
                            </fieldset>

                            {step.id === 'lookingFor' && isTransitionSelected && (
                              <div className="space-y-2">
                                <label
                                  htmlFor={`${currentInputId}-transition-target`}
                                  className="block text-sm font-semibold text-slate-800"
                                >
                                  What role or discipline are you interested in transitioning into?
                                </label>
                                <input
                                  id={`${currentInputId}-transition-target`}
                                  type="text"
                                  value={formData.transitionTarget}
                                  onChange={(event) =>
                                    handleFieldChange(
                                      'transitionTarget',
                                      event.target.value as AssessmentFormData['transitionTarget']
                                    )
                                  }
                                  className={`${commonInputClasses} max-w-xl`}
                                  placeholder="e.g., product management, data science, UX design"
                                  aria-describedby={currentHelperTextId}
                                />
                              </div>
                            )}
                          </div>
                        );
                      }

                      if (step.type === 'radio' && step.options) {
                        return (
                          <fieldset
                            className="space-y-3"
                            aria-describedby={currentHelperTextId}
                          >
                            <legend className="sr-only">{step.prompt}</legend>
                            {step.options.map((option, optionIndex) => {
                              const optionId = `${currentInputId}-${option.value}`;
                              const isSelected = stringValue === option.value;
                              return (
                                <label
                                  key={option.value}
                                  htmlFor={optionId}
                                  className={`flex items-start gap-3 rounded-xl border px-4 py-3 cursor-pointer transition ${
                                    isSelected
                                      ? isAssessmentMode
                                        ? 'border-emerald-300 bg-emerald-50 shadow-inner shadow-emerald-200/30'
                                        : 'border-emerald-300 bg-emerald-50 shadow-inner shadow-emerald-200/30'
                                      : isAssessmentMode
                                        ? 'border-slate-300 hover:border-emerald-300 hover:bg-emerald-50'
                                        : 'border-slate-300 hover:border-emerald-300 hover:bg-emerald-50'
                                  }`}
                                >
                                  <input
                                    id={optionId}
                                    type="radio"
                                    name={step.id}
                                    value={option.value}
                                    checked={isSelected}
                                    onChange={(event) => {
                                      handleFieldChange(step.id, event.target.value);
                                      maybeAutoAdvance();
                                    }}
                                    className={`mt-1 focus:ring-2 ${
                                      isAssessmentMode
                                        ? 'text-emerald-500 focus:ring-emerald-200'
                                        : 'text-emerald-500 focus:ring-emerald-200'
                                    }`}
                                    ref={(element: HTMLInputElement | null) => {
                                      if (optionIndex === 0) {
                                        interactiveRefs.current[step.id] = element;
                                      }
                                    }}
                                  />
                                  <span className="text-slate-800">
                                    {option.label}
                                  </span>
                                </label>
                              );
                            })}
                          </fieldset>
                        );
                      }

                      if (step.type === 'signup') {
                        return (
                          <div className="space-y-6">
                            <p className="text-base text-slate-700">
                              Join re-imagined.me to store your answers, revisit your roadmap, and access the portal when it opens.
                            </p>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <label htmlFor={`${currentInputId}-name`} className="text-sm font-medium text-slate-800">
                                  Full name
                                </label>
                                <input
                                  id={`${currentInputId}-name`}
                                  type="text"
                                  placeholder="Ada Lovelace"
                                  value={formData.fullName}
                                  onChange={(event) => handleFieldChange('fullName', event.target.value)}
                                  className={commonInputClasses}
                                />
                              </div>
                              <div className="space-y-2">
                                <label htmlFor={`${currentInputId}-email`} className="text-sm font-medium text-slate-800">
                                  Email address
                                </label>
                                <input
                                  id={`${currentInputId}-email`}
                                  type="email"
                                  placeholder="you@example.com"
                                  value={formData.email}
                                  onChange={(event) => handleFieldChange('email', event.target.value)}
                                  className={commonInputClasses}
                                  ref={(element: HTMLInputElement | null) => {
                                    interactiveRefs.current[step.id] = element;
                                  }}
                                />
                              </div>
                              {!user && (
                                <div className="space-y-2">
                                  <label htmlFor={`${currentInputId}-password`} className="text-sm font-medium text-slate-800">
                                    Create a password
                                  </label>
                                  <input
                                    id={`${currentInputId}-password`}
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    minLength={6}
                                    onChange={(event) => handleFieldChange('password', event.target.value)}
                                    className={commonInputClasses}
                                  />
                                  <p className="text-xs text-slate-500">Minimum 6 characters.</p>
                                </div>
                              )}
                            </div>
                            {!user && (
                              <p className="text-sm text-slate-600">
                                Already signed up?{' '}
                                <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-500">
                                  Log in
                                </Link>{' '}
                                to continue.
                              </p>
                            )}
                          </div>
                        );
                      }

                      return null;
                    })()}
                  </div>
                </div>
              </div>

              {error && (
                <div
                  className={`rounded-lg border px-4 py-3 text-sm ${
                    isAssessmentMode
                      ? 'border-red-300 bg-red-50 text-red-700'
                      : 'border-red-300 bg-red-50 text-red-700'
                  }`}
                >
                  {error}
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className={`w-full sm:w-auto rounded-lg border px-6 py-3 text-sm font-medium transition ${
                    currentStep === 0
                      ? isAssessmentMode
                        ? 'border-slate-300 text-slate-400 cursor-not-allowed'
                        : 'border-slate-300 text-slate-400 cursor-not-allowed'
                      : isAssessmentMode
                        ? 'border-slate-300 text-slate-600 hover:border-emerald-300 hover:text-emerald-600'
                        : 'border-slate-300 text-slate-600 hover:border-emerald-300 hover:text-emerald-600'
                  }`}
                >
                  Previous question
                </button>

                {currentStep === steps.length - 1 ? (
                  <button
                    type="submit"
                    className={`w-full sm:w-auto rounded-lg px-6 py-3 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed ${
                      isAssessmentMode
                        ? 'bg-emerald-500 text-white hover:bg-emerald-400 disabled:bg-slate-300 disabled:text-white/70'
                        : 'bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 text-white shadow-lg shadow-emerald-300/20 hover:shadow-xl hover:shadow-emerald-200/30 disabled:bg-slate-300/60 disabled:text-white/70'
                    }`}
                    disabled={!isStepValid(currentStep) || isSubmitting || showSnapshot}
                  >
                    {isSubmitting ? 'Saving your answers…' : 'Generate my snapshot'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleNext()}
                    disabled={!isStepValid(currentStep)}
                    className={`w-full sm:w-auto rounded-lg px-6 py-3 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed ${
                      isAssessmentMode
                        ? 'bg-emerald-500 text-white hover:bg-emerald-400 disabled:bg-slate-300 disabled:text-white/70'
                        : 'bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 text-white shadow-lg shadow-emerald-300/20 hover:shadow-xl hover:shadow-emerald-200/30 disabled:bg-slate-300/60 disabled:text-white/70'
                    }`}
                  >
                    Next question
                  </button>
                )}
              </div>
            </div>
            </form>
          </div>

          {isAssessmentMode && (
            <div className="order-2 mt-8 w-full self-start lg:order-2 lg:mt-0 lg:sticky lg:top-24 lg:max-w-sm lg:justify-self-end">
              <AssessmentPreviewPanel
                formData={{ ...formData, strengths: strengthsWithOther }}
                goalText={goalText}
                industryLabel={industryLabel}
                mode="live"
                snapshotInsights={snapshotInsights}
              />
            </div>
          )}
        </div>
      </section>

      {showSnapshot && (
        <section id="snapshot" className="relative bg-slate-100 px-4 py-24 sm:px-6 lg:px-8">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),_transparent_60%)]" />
          <div className="mx-auto max-w-4xl">
            <AssessmentPreviewPanel
              formData={{ ...formData, strengths: strengthsWithOther }}
              goalText={goalText}
              industryLabel={industryLabel}
              mode="full"
              snapshotInsights={snapshotInsights}
            />
          </div>
        </section>
      )}

      {!isAssessmentMode && (
        <section className="relative px-4 py-24 sm:px-6 lg:px-8">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_bottom,_rgba(56,189,248,0.12),_transparent_70%)]" />
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-6 text-3xl font-bold text-slate-900">
              More than a job title
            </h2>
            <div className="space-y-4 text-lg text-slate-700">
              <p className="leading-relaxed">
                Your experience, judgment, and relationships are not easily replaced by tools.
              </p>
              <p className="leading-relaxed">
                re-imagined.me helps you translate those strengths into roles that stay relevant as industries evolve.
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default Home;
