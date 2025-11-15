import { useState, FormEvent, KeyboardEvent, useEffect } from 'react';
import { ArrowRight, CheckCircle, TrendingUp, Map, X } from 'lucide-react';
import { getSupabaseClient } from '../lib/supabaseClient';

interface FormData {
  jobTitle: string;
  industry: string;
  yearsExperience: string;
  strengths: string;
  typicalWeek: string;
  lookingFor: string;
  workPreferences: string;
  email: string;
}

type StepType = 'input' | 'textarea' | 'select' | 'radio';

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
  id: keyof FormData;
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

const createInitialFormData = (): FormData => ({
  jobTitle: '',
  industry: '',
  yearsExperience: '',
  strengths: '',
  typicalWeek: '',
  lookingFor: '',
  workPreferences: '',
  email: ''
});

function Home() {
  const [showSnapshot, setShowSnapshot] = useState(false);
  const [isAssessmentActive, setIsAssessmentActive] = useState(false);
  const [hasAssessmentStarted, setHasAssessmentStarted] = useState(false);
  const [formData, setFormData] = useState<FormData>(() => createInitialFormData());
  const [currentStep, setCurrentStep] = useState(0);
  const [furthestStep, setFurthestStep] = useState(0);
  const [error, setError] = useState('');
  const [stepAnimationKey, setStepAnimationKey] = useState(0);
  const [transitionDirection, setTransitionDirection] = useState<'forward' | 'backward'>('forward');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAssessmentMode = isAssessmentActive && !showSnapshot;

  useEffect(() => {
    setStepAnimationKey((prev) => prev + 1);
  }, [currentStep]);

  useEffect(() => {
    if (isAssessmentMode) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isAssessmentMode]);

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
      prompt: 'Which industry are you working in?',
      type: 'select',
      required: true,
      placeholder: 'Select your industry',
      options: [
        { value: 'software-tech', label: 'Software / Tech' },
        { value: 'design-creative', label: 'Design / Creative' },
        { value: 'marketing-sales', label: 'Marketing / Sales' },
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
      type: 'textarea',
      required: true,
      rows: 5,
      placeholder:
        'E.g., stakeholder communication, JavaScript, system design, UX research, teaching, financial modelling…'
    },
    {
      id: 'typicalWeek',
      title: 'Your day-to-day',
      prompt: 'What does a typical workweek look like for you?',
      type: 'textarea',
      rows: 5,
      helperText: 'Optional — describe 3–5 key activities and roughly how much time each takes.'
    },
    {
      id: 'lookingFor',
      title: 'Your direction',
      prompt: 'What are you mainly looking for right now?',
      type: 'radio',
      required: true,
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
      title: 'Stay in the loop',
      prompt: 'Where should we send your roadmap later?',
      type: 'input',
      required: true,
      inputType: 'email',
      placeholder: 'your.email@example.com'
    }
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const getFieldValue = (field: keyof FormData) => formData[field] ?? '';

  const isStepValid = (stepIndex: number) => {
    const step = steps[stepIndex];
    if (!step) return true;

    if (!step.required) {
      return true;
    }

    switch (step.id) {
      case 'jobTitle':
        return getFieldValue('jobTitle').trim().length > 0;
      case 'industry':
        return getFieldValue('industry').trim().length > 0;
      case 'yearsExperience': {
        const value = getFieldValue('yearsExperience').trim();
        if (value === '') return false;
        const numeric = Number(value);
        return Number.isFinite(numeric) && numeric >= 0;
      }
      case 'strengths':
        return getFieldValue('strengths').trim().length > 0;
      case 'lookingFor':
        return getFieldValue('lookingFor').trim().length > 0;
      case 'email': {
        const value = getFieldValue('email').trim();
        if (!value) return false;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
      }
      default:
        return true;
    }
  };

  const handleFieldChange = (field: keyof FormData, value: string) => {
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

    if (!formData.jobTitle || !formData.industry || !formData.yearsExperience ||
        !formData.strengths || !formData.email || !formData.lookingFor) {
      setError('Please fill in all required fields before submitting.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.');
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
      const { error: submissionError } = await supabase.from('assessment_responses').insert({
        job_title: formData.jobTitle,
        industry: formData.industry,
        years_experience: yearsExperienceValue,
        strengths: formData.strengths,
        typical_week: formData.typicalWeek || null,
        looking_for: formData.lookingFor,
        work_preferences: formData.workPreferences || null,
        email: formData.email,
        submitted_at: new Date().toISOString()
      });

      if (submissionError) {
        console.error('Failed to save assessment response', submissionError);
        setError('We couldn\'t save your answers. Please try again.');
        return;
      }
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

  const goalText = formData.lookingFor === 'strengthen' ? 'Strengthen and future-proof my current role' :
                   formData.lookingFor === 'transition' ? 'Transition to a new role or discipline' :
                   formData.lookingFor === 'explore' ? 'Explore side projects or additional income streams' :
                   formData.lookingFor === 'pioneer' ? 'Chart a path into roles that do not yet exist at scale' : 'your next chapter';

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
  };

  const startAssessment = () => {
    setHasAssessmentStarted(true);
    setIsAssessmentActive(true);
    setTransitionDirection('forward');
    scrollToSection('assessment');
  };

  return (
    <div
      className={`${
        isAssessmentMode
          ? 'relative min-h-screen h-screen w-full bg-slate-100 text-slate-900'
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
              <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1 text-sm font-medium text-emerald-700 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Guided AI-powered planning for experienced professionals
              </div>
              <h1 className="mt-8 text-4xl font-bold leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Design your next chapter, not just your next job
              </h1>
              <p className="mx-auto mt-6 max-w-3xl text-lg text-slate-600 sm:text-xl">
                Capture who you are today, how you work, and where you want to go next as technology reshapes your industry.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <button
                  onClick={startAssessment}
                  className="w-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 px-10 py-4 text-base font-semibold text-white shadow-lg shadow-emerald-300/30 transition hover:shadow-xl hover:shadow-emerald-200/40 sm:w-auto"
                >
                  <span className="inline-flex items-center justify-center gap-2">
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
              <p className="mt-10 text-sm uppercase tracking-[0.3em] text-slate-500">
                Built for experienced professionals who want their work to stay meaningful and relevant.
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
              <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-8 shadow-lg shadow-emerald-200/10 transition hover:-translate-y-1 hover:border-emerald-200/60 hover:shadow-emerald-200/30">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <CheckCircle size={24} />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-slate-900">
                  Clarify your current position
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  We map your role, skills, and day-to-day responsibilities.
                </p>
              </div>

              <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-8 shadow-lg shadow-emerald-200/10 transition hover:-translate-y-1 hover:border-emerald-200/60 hover:shadow-emerald-200/30">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
                  <TrendingUp size={24} />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-slate-900">
                  Explore future-aligned paths
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  We highlight roles and emerging opportunities that fit your strengths and ambitions.
                </p>
              </div>

              <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-8 shadow-lg shadow-emerald-200/10 transition hover:-translate-y-1 hover:border-emerald-200/60 hover:shadow-emerald-200/30">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                  <Map size={24} />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-slate-900">
                  Define your next steps
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
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
            className="absolute right-4 top-4 flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-emerald-300 hover:text-emerald-600"
          >
            <X size={16} aria-hidden="true" />
            Exit
          </button>
        )}
        <div
          className={`${
            isAssessmentMode
              ? 'w-full max-w-2xl'
              : 'relative mx-auto max-w-3xl'
          }`}
        >
          {!isAssessmentMode && (
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                Start your quick assessment
              </h2>
              <p className="text-slate-600">
                This is a simplified starting point. We'll later use your answers to generate a more personalised next-chapter roadmap.
              </p>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className={`${
              isAssessmentMode
                ? 'rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-2xl shadow-emerald-200/20'
                : 'rounded-3xl border border-slate-200/70 bg-white/90 backdrop-blur-sm p-6 sm:p-10 shadow-xl shadow-emerald-200/20'
            } ${hasAssessmentStarted ? 'animate-assessment-enter' : ''}`}
          >
            <div className="space-y-8">
              <div>
                <div
                  className={`flex items-center justify-between text-xs uppercase tracking-wide ${
                    isAssessmentMode ? 'text-slate-500' : 'text-slate-500'
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
                      className={`text-2xl sm:text-3xl font-semibold ${
                        isAssessmentMode ? 'text-slate-900' : 'text-slate-900'
                      }`}
                    >
                      {steps[currentStep].prompt}
                    </h3>
                    {steps[currentStep].helperText && (
                      <p
                        className={`mt-2 text-sm ${
                          isAssessmentMode ? 'text-slate-500' : 'text-slate-500'
                        }`}
                      >
                        {steps[currentStep].helperText}
                      </p>
                    )}
                  </div>
                  <div>
                    {(() => {
                      const step = steps[currentStep];
                      const commonInputClasses = `w-full rounded-xl border px-4 py-3 text-base transition focus:outline-none focus:ring-2 focus:border-transparent ${
                        isAssessmentMode
                          ? 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-emerald-200/60'
                          : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-emerald-200/60'
                      }`;

                      if (step.type === 'input') {
                        return (
                          <input
                            type={step.inputType ?? 'text'}
                            inputMode={step.inputMode}
                            value={getFieldValue(step.id)}
                            onChange={(event) => handleFieldChange(step.id, event.target.value)}
                            onKeyDown={handleEnterKey}
                            placeholder={step.placeholder}
                            className={commonInputClasses}
                            min={step.inputType === 'number' ? 0 : undefined}
                          />
                        );
                      }

                      if (step.type === 'textarea') {
                        return (
                          <textarea
                            value={getFieldValue(step.id)}
                            onChange={(event) => handleFieldChange(step.id, event.target.value)}
                            placeholder={step.placeholder}
                            rows={step.rows ?? 4}
                            className={commonInputClasses}
                          />
                        );
                      }

                      if (step.type === 'select' && step.options) {
                        return (
                          <select
                            value={getFieldValue(step.id)}
                            onChange={(event) => {
                              handleFieldChange(step.id, event.target.value);
                              if (event.target.value) {
                                maybeAutoAdvance();
                              }
                            }}
                            className={`${commonInputClasses} appearance-none`}
                          >
                            <option value="">{step.placeholder ?? 'Select an option'}</option>
                            {step.options.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        );
                      }

                      if (step.type === 'radio' && step.options) {
                        return (
                          <div className="space-y-3">
                            {step.options.map((option) => {
                              const isSelected = getFieldValue(step.id) === option.value;
                              return (
                                <label
                                  key={option.value}
                                className={`flex items-start gap-3 rounded-xl border px-4 py-3 cursor-pointer transition ${
                                    isSelected
                                      ? isAssessmentMode
                                        ? 'border-emerald-300 bg-emerald-50 shadow-inner shadow-emerald-200/30'
                                        : 'border-emerald-300 bg-emerald-50 shadow-inner shadow-emerald-200/30'
                                      : isAssessmentMode
                                        ? 'border-slate-200 hover:border-emerald-300 hover:bg-emerald-50'
                                        : 'border-slate-200 hover:border-emerald-300 hover:bg-emerald-50'
                                  }`}
                                >
                                  <input
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
                                  />
                                  <span className="text-slate-800">
                                    {option.label}
                                  </span>
                                </label>
                              );
                            })}
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
                        ? 'border-slate-200 text-slate-400 cursor-not-allowed'
                        : 'border-slate-200 text-slate-400 cursor-not-allowed'
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
                    disabled={!isStepValid(currentStep) || isSubmitting}
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
      </section>

      {showSnapshot && (
        <section id="snapshot" className="relative bg-slate-100 px-4 py-24 sm:px-6 lg:px-8">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),_transparent_60%)]" />
          <div className="max-w-4xl mx-auto">
            <h2 className="mb-6 text-center text-3xl font-bold text-slate-900 sm:text-4xl">
              Initial snapshot of your next chapter
            </h2>
            <p className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 text-center text-lg text-slate-700 shadow-sm">
              You're currently a <strong>{formData.jobTitle}</strong> in <strong>{formData.industry.replace('-', ' ')}</strong>, and you're focused on: <strong>{goalText}</strong>.
            </p>

            <div className="mb-8 grid gap-8 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg shadow-emerald-200/10">
                <h3 className="mb-3 text-xl font-semibold text-slate-900">
                  How your work may evolve
                </h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  As new technologies such as AI, automation, and robotics advance, certain tasks in your role may change. In the full version, we'll help you identify which parts of your work are likely to increase in strategic value.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg shadow-emerald-200/10">
                <h3 className="mb-3 text-xl font-semibold text-slate-900">
                  Potential future directions
                </h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  We will suggest both established roles and new, emerging opportunities that align with your strengths and industry knowledge — including roles made possible by AI, humanoid robots, 3D printing, AR/VR, and other innovations.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg shadow-emerald-200/10">
                <h3 className="mb-3 text-xl font-semibold text-slate-900">
                  Structured next steps
                </h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  You'll receive a clear, practical 90-day plan outlining skills to focus on, projects to undertake, and ways to position yourself for your next phase.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-inner shadow-emerald-200/10">
              <p className="text-sm text-slate-600">
                For this MVP UI, this is a preview only. In the next iteration we'll connect to our backend and AI engine to provide personalised recommendations.
              </p>
            </div>
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
            <div className="space-y-4 text-lg text-slate-600">
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
