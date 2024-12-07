interface PageTemplateProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  showBackButton?: boolean;
}

export default function PageTemplate({
  children,
  title,
  description,
  showBackButton = false,
}: PageTemplateProps) {
  return (
    <div className="min-h-screen bg-brand-offwhite">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-4 mb-8">
          {showBackButton && (
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center text-brand-text hover:text-brand-primary transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back
            </button>
          )}
          <h1 className="font-montserrat text-3xl font-bold text-brand-text">
            {title}
          </h1>
          {description && (
            <p className="font-inter text-lg text-brand-text/80">{description}</p>
          )}
        </div>
        <main>{children}</main>
      </div>
    </div>
  );
} 