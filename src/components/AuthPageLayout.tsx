import type { ReactNode } from 'react';

interface AuthPageLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

function AuthPageLayout({ title, subtitle, children, footer }: AuthPageLayoutProps) {
  return (
    <div className="flex w-full items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl ring-1 ring-slate-200">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
          {subtitle ? <p className="text-sm text-slate-600">{subtitle}</p> : null}
        </div>
        <div className="mt-8 space-y-6">{children}</div>
        {footer ? <div className="mt-8 text-center text-sm text-slate-600">{footer}</div> : null}
      </div>
    </div>
  );
}

export default AuthPageLayout;
