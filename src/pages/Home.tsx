import { Link } from 'react-router-dom';
import { ArrowRight, ClipboardList, Flag, Sparkles, X } from 'lucide-react';
import AssessmentPreviewPanel from '../components/AssessmentPreviewPanel';
import { useAssessmentForm } from '../lib/useAssessmentForm';
import type { AssessmentFormData } from '../types/assessment';

function Home() {
  const form = useAssessmentForm();

  const currentInputId = `assessment-${form.currentStepDefinition.id}`;
  const currentPromptId = `${currentInputId}-prompt`;
  const currentHelperTextId = form.currentStepDefinition.helperText ? `${currentInputId}-helper` : undefined;

  return (
    <div
      className={`${
        form.isAssessmentMode
          ? 'absolute min-h-screen h-screen w-full bg-slate-100 text-slate-900'
          : 'relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900'
      }`}
    >
      {form.isSubmitting && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm"
          role="status"
          aria-live="assertive"
        >
          <div className="flex items-center gap-4 rounded-2xl bg-white px-6 py-5 shadow-2xl ring-1 ring-slate-200">
            <div className="h-12 w-12 animate-spin rounded-full border-[4px] border-emerald-200 border-t-emerald-500" />
            <div className="space-y-1">
              <p className="text-base font-semibold text-slate-900">Generating your report…</p>
              <p className="text-sm text-slate-600">We're turning your answers into a personalised 90-day plan.</p>
            </div>
          </div>
        </div>
      )}

      {!form.isAssessmentMode && (
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
              <div className="mt-10 flex flex-col items-center justify-center">
                <button
                  type="button"
                  onClick={form.startAssessment}
                  className="w-full max-w-md rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-sky-500 px-12 py-4 text-lg font-semibold text-white shadow-lg shadow-emerald-300/40 transition hover:shadow-xl hover:shadow-emerald-200/50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200 sm:text-xl"
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    Start my 5-minute assessment
                    <ArrowRight size={20} />
                  </span>
                </button>
                <p className="mt-3 max-w-md text-center text-xs text-slate-600">
                  re-imagined.me will be a low-cost subscription (around $9/month). Early users may
                  receive discounted or lifetime pricing.
                </p>
                <Link
                  to="/sample-report"
                  className="mt-4 text-sm font-semibold text-emerald-700 underline decoration-emerald-300/70 transition hover:text-emerald-600"
                >
                  View a sample report
                </Link>
              </div>
              <p className="mt-10 text-sm uppercase tracking-[0.3em] text-slate-600">
                Built for professionals who want their work to stay meaningful and relevant.
              </p>
            </div>
          </section>
        </>
      )}

      {!form.isAssessmentMode && (
        <section id="how-it-works" className="relative bg-white/80 px-4 py-24 sm:px-6 lg:px-8">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.08),_transparent_60%)]" />
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">How it works</p>
              <h2 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">Three simple steps to your personalised roadmap</h2>
              <p className="mt-3 text-base text-slate-700">Designed to be calm, clear, and easy to complete.</p>
              <div className="mt-4 flex items-center justify-center">
                <Link to="/sample-report" className="text-sm font-semibold text-emerald-700 underline decoration-emerald-300/70 transition hover:text-emerald-600">
                  View a sample report
                </Link>
              </div>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 shadow-lg shadow-emerald-200/15 transition hover:-translate-y-1 hover:border-emerald-200/60 hover:shadow-emerald-200/30">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700"><ClipboardList size={24} aria-hidden="true" /></div>
                <p className="mt-6 text-xs font-semibold uppercase tracking-[0.15em] text-emerald-700">Step 1</p>
                <h3 className="mt-3 text-lg font-semibold text-slate-900">Answer a short assessment (about 5–10 minutes).</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">Quick, focused questions about your role, strengths, and goals.</p>
              </div>
              <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 shadow-lg shadow-emerald-200/15 transition hover:-translate-y-1 hover:border-emerald-200/60 hover:shadow-emerald-200/30">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100 text-sky-700"><Sparkles size={24} aria-hidden="true" /></div>
                <p className="mt-6 text-xs font-semibold uppercase tracking-[0.15em] text-sky-700">Step 2</p>
                <h3 className="mt-3 text-lg font-semibold text-slate-900">We analyse your current role and skills.</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">Our system connects the dots between what you do now and where you want to grow.</p>
              </div>
              <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 shadow-lg shadow-emerald-200/15 transition hover:-translate-y-1 hover:border-emerald-200/60 hover:shadow-emerald-200/30">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700"><Flag size={24} aria-hidden="true" /></div>
                <p className="mt-6 text-xs font-semibold uppercase tracking-[0.15em] text-indigo-700">Step 3</p>
                <h3 className="mt-3 text-lg font-semibold text-slate-900">You get 3–5 future roles and a personalized 90-day action plan.</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">Receive clear options, next steps, and progress-friendly tasks.</p>
              </div>
            </div>
          </div>
        </section>
      )}

      <section
        id="assessment"
        className={`${
          form.isAssessmentMode
            ? 'relative flex min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8'
            : 'relative px-4 py-24 sm:px-6 lg:px-8'
        }`}
      >
        {!form.isAssessmentMode && (
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,_rgba(115,110,254,0.12),_transparent_65%)]" />
        )}
        {form.isAssessmentMode && (
          <button
            type="button"
            onClick={form.handleExitAssessment}
            className="absolute z-50 right-4 top-4 flex items-center gap-2 rounded-full border border-slate-300 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700 transition hover:border-emerald-300 hover:text-emerald-600"
          >
            <X size={16} aria-hidden="true" />
            Exit
          </button>
        )}
        <div className={`${form.isAssessmentMode ? 'relative mx-auto grid w-full max-w-6xl gap-8  lg:items-start' : 'relative mx-auto max-w-3xl'}`}>
          <div className={`${form.isAssessmentMode ? 'order-1 flex w-full justify-center lg:order-1' : 'w-full'}`}>
            {!form.isAssessmentMode && (
              <div className="mb-12 text-center">
                <h2 className="mb-4 text-3xl font-bold text-slate-900 sm:text-4xl">Start your quick assessment</h2>
                <p className="text-slate-700">This is a simplified starting point. We'll later use your answers to generate a more personalised next-chapter roadmap.</p>
              </div>
            )}

            <form
              id='assessment-form'
              onSubmit={form.handleSubmit}
              className={`${
                form.isAssessmentMode
                  ? 'mx-auto w-full max-w-2xl rounded-3xl border border-slate-300 bg-white p-6 sm:p-10 shadow-2xl shadow-emerald-200/20 mt-14'
                  : 'rounded-3xl border border-slate-300/70 bg-white/90 backdrop-blur-sm p-6 sm:p-10 shadow-xl shadow-emerald-200/20'
              } ${form.hasAssessmentStarted ? 'animate-assessment-enter' : ''}`}
            >
            <div className="space-y-8">
              {form.isAssessmentMode && (
                <div aria-live="polite" className="sr-only" key={form.currentStepDefinition.id}>
                  {form.currentStepDefinition.prompt}
                </div>
              )}
              <div>
                <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-600">
                  <span>Question {form.currentStep + 1} of {form.steps.length}</span>
                  <span className="truncate text-right">{form.steps[form.currentStep].title}</span>
                </div>
                <div className="mt-4 flex items-center justify-center gap-3">
                  {form.steps.map((step, index) => {
                    const isActive = index === form.currentStep;
                    const isComplete = index < form.currentStep;
                    const isAccessible = index <= form.furthestStep;
                    return (
                      <button
                        key={step.id} type="button" onClick={() => form.goToStep(index)} disabled={!isAccessible}
                        className={`h-2.5 w-2.5 rounded-full transition ${isActive ? 'bg-emerald-500' : isComplete ? 'bg-emerald-200' : 'bg-slate-200'} ${!isAccessible ? 'opacity-40 cursor-not-allowed' : 'hover:scale-110'}`}
                        aria-label={`Go to question ${index + 1}`}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="relative">
                <div key={form.stepAnimationKey} className={`space-y-6 ${form.stepAnimationClass}`}>
                  <div>
                    <h3 id={currentPromptId} className="text-2xl sm:text-3xl font-semibold text-slate-900">
                      {form.currentStepDefinition.prompt}
                    </h3>
                    {form.currentStepDefinition.helperText && (
                      <p id={currentHelperTextId} className="mt-2 text-sm text-slate-600">{form.currentStepDefinition.helperText}</p>
                    )}
                  </div>
                  <div>{renderStepInput(form, currentInputId, currentHelperTextId)}</div>
                </div>
              </div>

              {form.error && (
                <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{form.error}</div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <button
                  type="button" onClick={form.handlePrevious} disabled={form.currentStep === 0}
                  className={`w-full sm:w-auto rounded-lg border px-6 py-3 text-sm font-medium transition ${
                    form.currentStep === 0
                      ? 'border-slate-300 text-slate-400 cursor-not-allowed'
                      : 'border-slate-300 text-slate-600 hover:border-emerald-300 hover:text-emerald-600'
                  }`}
                >
                  Previous question
                </button>

                {form.currentStep === form.steps.length - 1 ? (
                  <button
                    type="submit"
                    className={`w-full sm:w-auto rounded-lg px-6 py-3 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed ${
                      form.isAssessmentMode
                        ? 'bg-emerald-500 text-white hover:bg-emerald-400 disabled:bg-slate-300 disabled:text-white/70'
                        : 'bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 text-white shadow-lg shadow-emerald-300/20 hover:shadow-xl hover:shadow-emerald-200/30 disabled:bg-slate-300/60 disabled:text-white/70'
                    }`}
                    disabled={!form.isStepValid(form.currentStep) || form.isSubmitting || form.showSnapshot}
                  >
                    {form.isSubmitting ? 'Saving your answers…' : 'Generate my snapshot'}
                  </button>
                ) : (
                  <button
                    type="button" onClick={() => form.handleNext()} disabled={!form.isStepValid(form.currentStep)}
                    className={`w-full sm:w-auto rounded-lg px-6 py-3 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed ${
                      form.isAssessmentMode
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
        </div>
      </section>

      {form.showSnapshot && (
        <section id="snapshot" className="relative bg-slate-100 px-4 py-24 sm:px-6 lg:px-8">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),_transparent_60%)]" />
          <div className="mx-auto max-w-4xl">
            <div className="relative overflow-hidden rounded-3xl">
              <AssessmentPreviewPanel
                formData={{ ...form.formData, strengths: form.strengthsWithOther }}
                goalText={form.goalText}
                industryLabel={form.industryLabel}
                mode="full"
                snapshotInsights={form.snapshotInsights}
              />
              <div className="absolute left-0 top-1/4 h-1/5 w-full overflow-hidden">
                <div className="flex h-full w-full justify-center backdrop-blur-md">
                  <div className="flex flex-col items-center gap-3 text-center text-slate-800 mt-8 mb-8">
                    <div className='rounded-2xl bg-white/80 p-5 ring-1 ring-slate-200/70'>
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Unlock everything</p>
                      <p className="max-w-xs text-base font-medium text-slate-700">
                        Log in to see your full snapshot, 90-day plan, and the skills tailored to you.
                      </p>
                      <Link
                        to="/login"
                        className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-sky-400 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-200/70 transition hover:translate-y-[-1px] hover:shadow-emerald-200/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200"
                      >
                        Log in to unlock everything
                        <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {!form.isAssessmentMode && (
        <section className="relative px-4 py-24 sm:px-6 lg:px-8">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_bottom,_rgba(56,189,248,0.12),_transparent_70%)]" />
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-6 text-3xl font-bold text-slate-900">More than a job title</h2>
            <div className="space-y-4 text-lg text-slate-700">
              <p className="leading-relaxed">Your experience, judgment, and relationships are not easily replaced by tools.</p>
              <p className="leading-relaxed">re-imagined.me helps you translate those strengths into roles that stay relevant as industries evolve.</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

type FormReturn = ReturnType<typeof import('../lib/useAssessmentForm').useAssessmentForm>;

function renderStepInput(form: FormReturn, currentInputId: string, currentHelperTextId: string | undefined) {
  const step = form.currentStepDefinition;
  const fieldValue = form.getFieldValue(step.id);
  const stringValue = typeof fieldValue === 'string' ? fieldValue : '';
  const stringArrayValue = Array.isArray(fieldValue)
    ? fieldValue
    : step.id === 'lookingFor'
      ? form.normalizeLookingFor(fieldValue as AssessmentFormData['lookingFor'])
      : [];
  const commonInputClasses = 'w-full rounded-xl border px-4 py-3 text-base transition focus:outline-none focus:ring-2 focus:border-transparent border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-emerald-200/60';

  if (step.id === 'jobTitle') {
    const filteredJobTitles = form.jobTitleOptions.filter((title) =>
      title.toLowerCase().includes(form.jobTitleQuery.toLowerCase().trim())
    );
    const selectJobTitle = (title: string) => {
      form.handleFieldChange(step.id, title);
      form.setJobTitleQuery(title);
      form.setIsJobTitleOpen(false);
      form.setIsCustomJobTitle(false);
    };
    return (
      <div className="relative" ref={form.jobTitleDropdownRef}>
        <label htmlFor={currentInputId} className="sr-only">{step.prompt}</label>
        <input
          id={currentInputId} role="combobox" aria-expanded={form.isJobTitleOpen}
          aria-controls="job-title-listbox" aria-autocomplete="list" type="text"
          value={form.jobTitleQuery}
          onFocus={() => form.setIsJobTitleOpen(true)}
          onChange={(event) => {
            form.handleFieldChange(step.id, event.target.value);
            form.setJobTitleQuery(event.target.value);
            form.setIsJobTitleOpen(true);
            form.setIsCustomJobTitle(false);
          }}
          onKeyDown={form.handleEnterKey} placeholder={step.placeholder}
          className={`${commonInputClasses} pr-10`} aria-describedby={currentHelperTextId}
          ref={(el: HTMLInputElement | null) => { form.interactiveRefs.current[step.id] = el; }}
        />
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        {form.isJobTitleOpen && (
          <div id="job-title-listbox" role="listbox" className="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
            {filteredJobTitles.length > 0 ? (
              filteredJobTitles.map((title) => (
                <button type="button" key={title} role="option" aria-selected={stringValue === title}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => { selectJobTitle(title); form.maybeAutoAdvance(); }}
                  className="block w-full px-4 py-2 text-left text-slate-800 transition hover:bg-emerald-50"
                >{title}</button>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-slate-500">No matching job titles</div>
            )}
            <div className="border-t border-slate-100">
              <button type="button" role="option" aria-selected={form.isCustomJobTitle}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  form.setIsCustomJobTitle(true);
                  form.setIsJobTitleOpen(false);
                  form.setJobTitleQuery('Other');
                  form.handleFieldChange(step.id, '');
                  requestAnimationFrame(() => { form.customJobTitleInputRef.current?.focus(); });
                }}
                className="block w-full px-4 py-2 text-left text-slate-800 transition hover:bg-emerald-50"
              >Other</button>
            </div>
          </div>
        )}
        {form.isCustomJobTitle && (
          <div className="mt-3">
            <label htmlFor={`${currentInputId}-custom`} className="sr-only">Enter your job title</label>
            <input
              id={`${currentInputId}-custom`} type="text" value={stringValue}
              onChange={(e) => form.handleFieldChange(step.id, e.target.value)}
              onKeyDown={form.handleEnterKey} placeholder="Type your job title"
              className={commonInputClasses} aria-describedby={currentHelperTextId}
              ref={(el: HTMLInputElement | null) => { form.customJobTitleInputRef.current = el; form.interactiveRefs.current[step.id] = el; }}
            />
          </div>
        )}
      </div>
    );
  }

  if (step.type === 'input') {
    return (
      <>
        <label htmlFor={currentInputId} className="sr-only">{step.prompt}</label>
        <input
          id={currentInputId} type={step.inputType ?? 'text'} inputMode={step.inputMode}
          value={stringValue} onChange={(e) => form.handleFieldChange(step.id, e.target.value)}
          onKeyDown={form.handleEnterKey} placeholder={step.placeholder} className={commonInputClasses}
          min={step.inputType === 'number' ? 0 : undefined} aria-describedby={currentHelperTextId}
          ref={(el: HTMLInputElement | null) => { form.interactiveRefs.current[step.id] = el; }}
        />
      </>
    );
  }

  if (step.type === 'textarea') {
    return (
      <>
        <label htmlFor={currentInputId} className="sr-only">{step.prompt}</label>
        <textarea
          id={currentInputId} value={stringValue}
          onChange={(e) => form.handleFieldChange(step.id, e.target.value)}
          placeholder={step.placeholder} rows={step.rows ?? 4} className={commonInputClasses}
          aria-describedby={currentHelperTextId}
          ref={(el: HTMLTextAreaElement | null) => { form.interactiveRefs.current[step.id] = el; }}
        />
      </>
    );
  }

  if (step.type === 'select' && step.options) {
    return (
      <>
        <label htmlFor={currentInputId} className="sr-only">{step.prompt}</label>
        <select
          id={currentInputId} value={stringValue}
          onChange={(e) => { form.handleFieldChange(step.id, e.target.value); if (e.target.value) form.maybeAutoAdvance(); }}
          className={`${commonInputClasses} appearance-none`} aria-describedby={currentHelperTextId}
          ref={(el: HTMLSelectElement | null) => { form.interactiveRefs.current[step.id] = el; }}
        >
          <option value="">{step.placeholder ?? 'Select an option'}</option>
          {step.options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </>
    );
  }

  if (step.type === 'multiselect' && step.options) {
    if (step.id === 'strengths') {
      const isOtherSelected = stringArrayValue.includes('other');
      return (
        <div className="flex flex-wrap gap-3" role="group" aria-describedby={currentHelperTextId}>
          {step.options.map((opt, i) => {
            const isSelected = stringArrayValue.includes(opt.value);
            return (
              <button key={opt.value} type="button"
                onClick={() => {
                  const updated = isSelected ? stringArrayValue.filter((v) => v !== opt.value) : [...stringArrayValue, opt.value];
                  form.handleFieldChange(step.id, updated as AssessmentFormData[typeof step.id]);
                  if (opt.value === 'other' && isSelected) form.handleFieldChange('strengthsOther', '' as AssessmentFormData['strengthsOther']);
                }}
                aria-pressed={isSelected}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 ${isSelected ? 'border-emerald-300 bg-emerald-50 text-emerald-800 shadow-inner shadow-emerald-200/60 focus:ring-emerald-200' : 'border-slate-300 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50 focus:ring-emerald-200'}`}
                ref={(el: HTMLButtonElement | null) => { if (i === 0) form.interactiveRefs.current[step.id] = el; }}
              >{opt.label}</button>
            );
          })}
          {isOtherSelected && (
            <div className="mt-2 w-full space-y-2">
              <label htmlFor={`${currentInputId}-other`} className="block text-sm font-semibold text-slate-800">Describe your other strengths</label>
              <input id={`${currentInputId}-other`} type="text" value={form.formData.strengthsOther}
                onChange={(e) => form.handleFieldChange('strengthsOther', e.target.value as AssessmentFormData['strengthsOther'])}
                className={`${commonInputClasses} max-w-xl`} placeholder="e.g., domain expertise, unique tools, or niches" aria-describedby={currentHelperTextId} />
              <p className="text-sm text-slate-500">We'll include this alongside your selected strengths.</p>
            </div>
          )}
        </div>
      );
    }

    const isTransitionSelected = step.id === 'lookingFor' ? stringArrayValue.includes('transition') : false;
    return (
      <div className="space-y-4">
        <fieldset className="space-y-3" aria-describedby={currentHelperTextId}>
          <legend className="sr-only">{step.prompt}</legend>
          {step.options.map((opt, i) => {
            const optionId = `${currentInputId}-${opt.value}`;
            const isSelected = stringArrayValue.includes(opt.value);
            return (
              <label key={opt.value} htmlFor={optionId}
                className={`flex items-start gap-3 rounded-xl border px-4 py-3 cursor-pointer transition ${isSelected ? 'border-emerald-300 bg-emerald-50 shadow-inner shadow-emerald-200/30' : 'border-slate-300 hover:border-emerald-300 hover:bg-emerald-50'}`}>
                <input id={optionId} type="checkbox" name={`${step.id}-${opt.value}`} value={opt.value} checked={isSelected}
                  onChange={(e) => {
                    const updated = e.target.checked ? [...stringArrayValue, opt.value] : stringArrayValue.filter((v) => v !== opt.value);
                    form.handleFieldChange(step.id, updated as AssessmentFormData[typeof step.id]);
                    if (step.id === 'lookingFor' && !updated.includes('transition')) form.handleFieldChange('transitionTarget', '');
                  }}
                  className="mt-1 text-emerald-500 focus:ring-2 focus:ring-emerald-200"
                  ref={(el: HTMLInputElement | null) => { if (i === 0) form.interactiveRefs.current[step.id] = el; }} />
                <span className="text-slate-800">{opt.label}</span>
              </label>
            );
          })}
        </fieldset>
        {step.id === 'lookingFor' && isTransitionSelected && (
          <div className="space-y-2">
            <label htmlFor={`${currentInputId}-transition-target`} className="block text-sm font-semibold text-slate-800">
              What role or discipline are you interested in transitioning into?
            </label>
            <input id={`${currentInputId}-transition-target`} type="text" value={form.formData.transitionTarget}
              onChange={(e) => form.handleFieldChange('transitionTarget', e.target.value as AssessmentFormData['transitionTarget'])}
              className={`${commonInputClasses} max-w-xl`} placeholder="e.g., product management, data science, UX design" aria-describedby={currentHelperTextId} />
          </div>
        )}
      </div>
    );
  }

  if (step.type === 'radio' && step.options) {
    return (
      <fieldset className="space-y-3" aria-describedby={currentHelperTextId}>
        <legend className="sr-only">{step.prompt}</legend>
        {step.options.map((opt, i) => {
          const optionId = `${currentInputId}-${opt.value}`;
          const isSelected = stringValue === opt.value;
          return (
            <label key={opt.value} htmlFor={optionId}
              className={`flex items-start gap-3 rounded-xl border px-4 py-3 cursor-pointer transition ${isSelected ? 'border-emerald-300 bg-emerald-50 shadow-inner shadow-emerald-200/30' : 'border-slate-300 hover:border-emerald-300 hover:bg-emerald-50'}`}>
              <input id={optionId} type="radio" name={step.id} value={opt.value} checked={isSelected}
                onChange={(e) => { form.handleFieldChange(step.id, e.target.value); form.maybeAutoAdvance(); }}
                className="mt-1 text-emerald-500 focus:ring-2 focus:ring-emerald-200"
                ref={(el: HTMLInputElement | null) => { if (i === 0) form.interactiveRefs.current[step.id] = el; }} />
              <span className="text-slate-800">{opt.label}</span>
            </label>
          );
        })}
      </fieldset>
    );
  }

  if (step.type === 'signup') {
    return (
      <div className="space-y-6">
        <p className="text-base text-slate-700">Join re-imagined.me to store your answers, revisit your roadmap, and access the portal when it opens.</p>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor={`${currentInputId}-name`} className="text-sm font-medium text-slate-800">Full name</label>
            <input id={`${currentInputId}-name`} type="text" placeholder="Ada Lovelace" value={form.formData.fullName}
              onChange={(e) => form.handleFieldChange('fullName', e.target.value)} className={commonInputClasses} />
          </div>
          <div className="space-y-2">
            <label htmlFor={`${currentInputId}-email`} className="text-sm font-medium text-slate-800">Email address</label>
            <input id={`${currentInputId}-email`} type="email" placeholder="you@example.com" value={form.formData.email}
              onChange={(e) => form.handleFieldChange('email', e.target.value)} className={commonInputClasses}
              ref={(el: HTMLInputElement | null) => { form.interactiveRefs.current[step.id] = el; }} />
          </div>
          {!form.user && (
            <div className="space-y-2">
              <label htmlFor={`${currentInputId}-password`} className="text-sm font-medium text-slate-800">Create a password</label>
              <input id={`${currentInputId}-password`} type="password" placeholder="••••••••" value={form.formData.password}
                minLength={6} onChange={(e) => form.handleFieldChange('password', e.target.value)} className={commonInputClasses} />
              <p className="text-xs text-slate-500">Minimum 6 characters.</p>
            </div>
          )}
        </div>
        {!form.user && (
          <p className="text-sm text-slate-600">
            Already signed up?{' '}
            <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-500">Log in</Link>{' '}
            to continue.
          </p>
        )}
      </div>
    );
  }

  return null;
}

export default Home;
