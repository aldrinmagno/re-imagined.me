import { useState, FormEvent, KeyboardEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import AssessmentLayout from '../components/AssessmentLayout';
import HeroSection from '../components/home/HeroSection';
import SupportTiles from '../components/home/SupportTiles';
import MoreThanTitleSection from '../components/home/MoreThanTitleSection';
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
  const navigate = useNavigate();
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

  const renderAssessmentForm = (isActiveView: boolean) => (
    <form
      onSubmit={handleSubmit}
      className={`${
        isActiveView
          ? 'rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur p-6 sm:p-10 shadow-2xl'
          : 'bg-white rounded-xl shadow-lg p-6 sm:p-10 border border-slate-200'
      } ${hasAssessmentStarted ? 'animate-assessment-enter' : ''}`}
    >
      <div className="space-y-8">
        <div>
          <div
            className={`flex items-center justify-between text-xs uppercase tracking-wide ${
              isActiveView ? 'text-slate-400' : 'text-slate-500'
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
                      ? isActiveView
                        ? 'bg-white'
                        : 'bg-slate-900'
                      : isComplete
                        ? isActiveView
                          ? 'bg-slate-300'
                          : 'bg-emerald-500'
                        : isActiveView
                          ? 'bg-slate-700'
                          : 'bg-slate-300'
                  } ${!isAccessible ? 'opacity-40 cursor-not-allowed' : 'hover:scale-110'}`}
                  aria-label={`Go to question ${index + 1}`}
                />
              );
            })}
          </div>
        </div>

        <div className="relative">
          <div key={stepAnimationKey} className={`space-y-6 ${stepAnimationClass}`}>
            <div>
              <h3 className={`text-2xl sm:text-3xl font-semibold ${isActiveView ? 'text-white' : 'text-slate-900'}`}>
                {steps[currentStep].prompt}
              </h3>
              {steps[currentStep].helperText && (
                <p className={`mt-2 text-sm ${isActiveView ? 'text-slate-400' : 'text-slate-500'}`}>
                  {steps[currentStep].helperText}
                </p>
              )}
            </div>
            <div>
              {(() => {
                const step = steps[currentStep];
                const commonInputClasses = `w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-base ${
                  isActiveView
                    ? 'bg-slate-800/80 border-slate-700 text-white placeholder-slate-400 focus:ring-white'
                    : 'border-slate-300 focus:ring-slate-900'
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
                      className={`${commonInputClasses} ${isActiveView ? 'bg-slate-800/80 text-white' : 'bg-white'}`}
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
                                ? isActiveView
                                  ? 'border-white/70 bg-white/5'
                                  : 'border-slate-900 bg-slate-900/5'
                                : isActiveView
                                  ? 'border-slate-700 hover:border-slate-500'
                                  : 'border-slate-200 hover:border-slate-900'
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
                                isActiveView ? 'text-white focus:ring-white' : 'text-slate-900 focus:ring-slate-900'
                              }`}
                            />
                            <span className={isActiveView ? 'text-slate-100' : 'text-slate-700'}>
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
              isActiveView
                ? 'border-red-500/60 bg-red-500/10 text-red-200'
                : 'border-red-200 bg-red-50 text-red-700'
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
                ? isActiveView
                  ? 'border-slate-700 text-slate-600 cursor-not-allowed'
                  : 'border-slate-200 text-slate-400 cursor-not-allowed'
                : isActiveView
                  ? 'border-slate-700 text-slate-200 hover:border-slate-500 hover:text-white'
                  : 'border-slate-300 text-slate-700 hover:border-slate-900 hover:text-slate-900'
            }`}
          >
            Previous question
          </button>

          {currentStep === steps.length - 1 ? (
            <button
              type="submit"
              className={`w-full sm:w-auto rounded-lg px-6 py-3 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed ${
                isActiveView
                  ? 'bg-white text-slate-900 hover:bg-slate-200 disabled:bg-slate-500 disabled:text-slate-300'
                  : 'bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-300'
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
                isActiveView
                  ? 'bg-white text-slate-900 hover:bg-slate-200 disabled:bg-slate-500 disabled:text-slate-300'
                  : 'bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-300'
              }`}
            >
              Next question
            </button>
          )}
        </div>
      </div>
    </form>
  );

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

  if (isAssessmentMode) {
    return (
      <AssessmentLayout>
        <div id="assessment" className="relative space-y-6">
          <button
            type="button"
            onClick={handleExitAssessment}
            className="absolute right-0 top-0 flex items-center gap-2 rounded-full border border-slate-700/60 bg-slate-900/80 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-300 transition hover:border-slate-500 hover:text-white"
          >
            <X size={16} aria-hidden="true" />
            Exit
          </button>
          <div className="pt-12 lg:pt-0">{renderAssessmentForm(true)}</div>
        </div>
      </AssessmentLayout>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <HeroSection onStartAssessment={startAssessment} />
      <SupportTiles />

      <section id="assessment" className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Start your quick assessment</h2>
          <p className="text-slate-600">
            This is a simplified starting point. We'll later use your answers to generate a more personalised next-chapter roadmap.
          </p>
        </div>
        <div className="mx-auto max-w-3xl">{renderAssessmentForm(false)}</div>
      </section>

      {showSnapshot && (
        <section id="snapshot" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 text-center mb-6">
              Initial snapshot of your next chapter
            </h2>
            <p className="text-lg text-slate-700 text-center mb-12 bg-slate-50 p-6 rounded-lg border border-slate-200">
              You're currently a <strong>{formData.jobTitle}</strong> in <strong>{formData.industry.replace('-', ' ')}</strong>, and you're focused on: <strong>{goalText}</strong>.
            </p>

            <div className="grid gap-8 md:grid-cols-3 mb-8">
              <div className="bg-blue-50 p-8 rounded-xl border border-blue-200">
                <h3 className="text-xl font-semibold text-slate-900 mb-3">How your work may evolve</h3>
                <p className="text-slate-700">
                  As new technologies such as AI, automation, and robotics advance, certain tasks in your role may change. In the full version, we'll help you identify which parts of your work are likely to increase in strategic value.
                </p>
              </div>

              <div className="bg-emerald-50 p-8 rounded-xl border border-emerald-200">
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Potential future directions</h3>
                <p className="text-slate-700">
                  We will suggest both established roles and new, emerging opportunities that align with your strengths and industry knowledge — including roles made possible by AI, humanoid robots, 3D printing, AR/VR, and other innovations.
                </p>
              </div>

              <div className="bg-amber-50 p-8 rounded-xl border border-amber-200">
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Structured next steps</h3>
                <p className="text-slate-700">
                  You'll receive a clear, practical 90-day plan outlining skills to focus on, projects to undertake, and ways to position yourself for your next phase.
                </p>
              </div>
            </div>

            <div className="bg-slate-100 p-6 rounded-lg border border-slate-300 text-center">
              <p className="text-slate-700">
                For this MVP UI, this is a preview only. In the next iteration we'll connect to our backend and AI engine to provide personalised recommendations.
              </p>
            </div>
          </div>
        </section>
      )}

      <MoreThanTitleSection />
    </div>
  );
}

export default Home;
