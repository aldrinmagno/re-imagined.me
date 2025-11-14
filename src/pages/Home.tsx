import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle, TrendingUp, Map } from 'lucide-react';

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

function Home() {
  const navigate = useNavigate();
  const [showSnapshot, setShowSnapshot] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    jobTitle: '',
    industry: '',
    yearsExperience: '',
    strengths: '',
    typicalWeek: '',
    lookingFor: '',
    workPreferences: '',
    email: ''
  });

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!formData.jobTitle || !formData.industry || !formData.yearsExperience ||
        !formData.strengths || !formData.email || !formData.lookingFor) {
      alert('Please fill in all required fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('Please enter a valid email address');
      return;
    }

    console.log('Form submitted:', formData);
    setShowSnapshot(true);

    setTimeout(() => {
      scrollToSection('snapshot');
    }, 100);
  };

  const goalText = formData.lookingFor === 'strengthen' ? 'Strengthen and future-proof my current role' :
                   formData.lookingFor === 'transition' ? 'Transition to a new role or discipline' :
                   formData.lookingFor === 'explore' ? 'Explore side projects or additional income streams' : 'your next chapter';

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Design your next chapter, not just your next job
          </h1>
          <p className="text-xl sm:text-2xl text-slate-600 mb-8 max-w-3xl mx-auto">
            Capture who you are today, how you work, and where you want to go next as technology reshapes your industry.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => scrollToSection('assessment')}
              className="bg-slate-900 text-white px-8 py-4 rounded-lg font-semibold hover:bg-slate-800 transition flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              Start your assessment
              <ArrowRight size={20} />
            </button>
            <button
              onClick={() => navigate('/how-it-works')}
              className="text-slate-700 hover:text-slate-900 transition font-medium"
            >
              How does this work?
            </button>
          </div>
          <p className="mt-8 text-sm text-slate-500">
            Built for experienced professionals who want their work to stay meaningful and relevant.
          </p>
        </div>
      </section>

      <section id="how-it-works" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 text-center mb-12">
            How re-imagined.me supports your next step
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-50 p-8 rounded-xl border border-slate-200">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="text-blue-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Clarify your current position
              </h3>
              <p className="text-slate-600">
                We map your role, skills, and day-to-day responsibilities.
              </p>
            </div>

            <div className="bg-slate-50 p-8 rounded-xl border border-slate-200">
              <div className="bg-emerald-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="text-emerald-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Explore future-aligned paths
              </h3>
              <p className="text-slate-600">
                We highlight roles and emerging opportunities that fit your strengths and ambitions.
              </p>
            </div>

            <div className="bg-slate-50 p-8 rounded-xl border border-slate-200">
              <div className="bg-amber-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Map className="text-amber-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Define your next steps
              </h3>
              <p className="text-slate-600">
                We outline a structured 90-day plan to move toward your next chapter.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="assessment" className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Start your quick assessment
            </h2>
            <p className="text-slate-600">
              This is a simplified starting point. We'll later use your answers to generate a more personalised next-chapter roadmap.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 sm:p-10 border border-slate-200">
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Who you are at work</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Current job title *
                    </label>
                    <input
                      type="text"
                      value={formData.jobTitle}
                      onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                      placeholder="e.g., Senior Product Manager"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Industry *
                    </label>
                    <select
                      value={formData.industry}
                      onChange={(e) => setFormData({...formData, industry: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                      required
                    >
                      <option value="">Select your industry</option>
                      <option value="software-tech">Software / Tech</option>
                      <option value="design-creative">Design / Creative</option>
                      <option value="marketing-sales">Marketing / Sales</option>
                      <option value="finance-accounting">Finance / Accounting</option>
                      <option value="operations-admin">Operations / Admin</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="education-training">Education / Training</option>
                      <option value="public-nonprofit">Public Sector / Nonprofit</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Years of experience *
                    </label>
                    <input
                      type="number"
                      value={formData.yearsExperience}
                      onChange={(e) => setFormData({...formData, yearsExperience: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                      placeholder="e.g., 8"
                      min="0"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Your strengths & skills</h3>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    What do you consider your core strengths and skills? *
                  </label>
                  <textarea
                    value={formData.strengths}
                    onChange={(e) => setFormData({...formData, strengths: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    rows={4}
                    placeholder="E.g., stakeholder communication, JavaScript, system design, UX research, teaching, financial modelling…"
                    required
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Your day-to-day</h3>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    What does a typical workweek look like for you?
                  </label>
                  <textarea
                    value={formData.typicalWeek}
                    onChange={(e) => setFormData({...formData, typicalWeek: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    rows={4}
                    placeholder="Describe 3–5 key activities and roughly how much time each takes."
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Your direction</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">
                      What are you mainly looking for right now? *
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="lookingFor"
                          value="strengthen"
                          checked={formData.lookingFor === 'strengthen'}
                          onChange={(e) => setFormData({...formData, lookingFor: e.target.value})}
                          className="mt-1 text-slate-900 focus:ring-slate-900"
                          required
                        />
                        <span className="text-slate-700">Strengthen and future-proof my current role</span>
                      </label>
                      <label className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="lookingFor"
                          value="transition"
                          checked={formData.lookingFor === 'transition'}
                          onChange={(e) => setFormData({...formData, lookingFor: e.target.value})}
                          className="mt-1 text-slate-900 focus:ring-slate-900"
                        />
                        <span className="text-slate-700">Transition to a new role or discipline</span>
                      </label>
                      <label className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="lookingFor"
                          value="explore"
                          checked={formData.lookingFor === 'explore'}
                          onChange={(e) => setFormData({...formData, lookingFor: e.target.value})}
                          className="mt-1 text-slate-900 focus:ring-slate-900"
                        />
                        <span className="text-slate-700">Explore side projects or additional income streams</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      What would you like to see more (or less) of in your work? (optional)
                    </label>
                    <textarea
                      value={formData.workPreferences}
                      onChange={(e) => setFormData({...formData, workPreferences: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                      rows={3}
                      placeholder="E.g., more ownership, more creativity, more stability, less routine work…"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Contact</h3>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email (to receive your roadmap later) *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-8 bg-slate-900 text-white px-8 py-4 rounded-lg font-semibold hover:bg-slate-800 transition"
            >
              Generate my snapshot
            </button>
          </form>
        </div>
      </section>

      {showSnapshot && (
        <section id="snapshot" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 text-center mb-6">
              Initial snapshot of your next chapter
            </h2>
            <p className="text-lg text-slate-700 text-center mb-12 bg-slate-50 p-6 rounded-lg border border-slate-200">
              You're currently a <strong>{formData.jobTitle}</strong> in <strong>{formData.industry.replace('-', ' ')}</strong>, and you're focused on: <strong>{goalText}</strong>.
            </p>

            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div className="bg-blue-50 p-8 rounded-xl border border-blue-200">
                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  How your work may evolve
                </h3>
                <p className="text-slate-700">
                  As new technologies such as AI, automation, and robotics advance, certain tasks in your role may change. In the full version, we'll help you identify which parts of your work are likely to increase in strategic value.
                </p>
              </div>

              <div className="bg-emerald-50 p-8 rounded-xl border border-emerald-200">
                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  Potential future directions
                </h3>
                <p className="text-slate-700">
                  We will suggest both established roles and new, emerging opportunities that align with your strengths and industry knowledge — including roles made possible by AI, humanoid robots, 3D printing, AR/VR, and other innovations.
                </p>
              </div>

              <div className="bg-amber-50 p-8 rounded-xl border border-amber-200">
                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  Structured next steps
                </h3>
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

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">
            More than a job title
          </h2>
          <div className="space-y-4 text-lg text-slate-600">
            <p>
              Your experience, judgment, and relationships are not easily replaced by tools.
            </p>
            <p>
              re-imagined.me helps you translate those strengths into roles that stay relevant as industries evolve.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
