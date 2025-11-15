import { ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  onStartAssessment: () => void;
}

function HeroSection({ onStartAssessment }: HeroSectionProps) {
  return (
    <section className="bg-gradient-to-b from-white via-slate-50 to-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl text-center space-y-8">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
          Design your next chapter, not just your next job
        </h1>
        <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto">
          Capture who you are today, how you work, and where you want to go next as technology reshapes your industry.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={onStartAssessment}
            className="bg-slate-900 text-white px-8 py-4 rounded-lg font-semibold hover:bg-slate-800 transition flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            Start your assessment
            <ArrowRight size={20} />
          </button>
          <a href="#how-it-works" className="text-slate-700 hover:text-slate-900 transition font-medium">
            How does this work?
          </a>
        </div>
        <p className="text-sm text-slate-500">
          Built for experienced professionals who want their work to stay meaningful and relevant.
        </p>
      </div>
    </section>
  );
}

export default HeroSection;
