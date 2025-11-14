import logoMark from '../assets/logo-mark.svg';

interface LogoProps {
  variant?: 'default' | 'compact';
  className?: string;
}

const accentColor = '#0F4C5C';
const taglineColor = '#1F7A8C';

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
      <div className="leading-tight">
        <div className={mergeClasses('font-semibold tracking-tight', titleClass)} style={{ color: accentColor }}>
          re-imagined<span style={{ color: accentColor }}>.</span>
        </div>
        {showTagline && (
          <div className="text-base sm:text-lg font-medium" style={{ color: taglineColor }}>
            We turn worry into a roadmap.
          </div>
        )}
      </div>
    </div>
  );
}

export default Logo;
