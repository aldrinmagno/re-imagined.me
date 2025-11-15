function About() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <section className="relative px-4 py-24 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),_transparent_65%)]" />
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold sm:text-5xl text-slate-900">
            About
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-700">
            Learn more about re-imagined.me and our mission coming soon.
          </p>
        </div>
      </section>
    </div>
  );
}

export default About;
