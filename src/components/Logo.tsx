import logoMark from '../assets/logo-mark.svg';

interface LogoProps {
  variant?: 'default' | 'compact';
  className?: string;
}

function mergeClasses(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function Logo({ variant = 'default', className }: LogoProps) {
  const showTagline = variant !== 'compact';
  const iconSize = variant === 'compact' ? 'h-10 w-10' : 'h-16 w-16';
  const titleClass = variant === 'compact' ? 'text-2xl' : 'text-3xl sm:text-4xl';
  const containerClasses = mergeClasses('flex items-center gap-4', showTagline ? 'text-left' : undefined, className);

  return (
    <div className={containerClasses}>
      <img
        src={logoMark}
        alt="re-imagined.me starburst mark"
        className={mergeClasses(iconSize, 'flex-shrink-0')}
      />
      <div className="leading-tight text-slate-900">
        <div
          className={mergeClasses(
            'font-semibold tracking-tight bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 bg-clip-text text-transparent',
            titleClass
          )}
        >
          re-imagined<span className="text-slate-500">.</span>
        </div>
        {showTagline && (
          <div className="text-base sm:text-lg font-medium text-slate-600">
            We turn worry into a roadmap.
          </div>
        )}
      </div>
    </div>
  );
}

export default Logo;
