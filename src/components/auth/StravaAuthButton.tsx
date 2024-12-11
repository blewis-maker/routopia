import { stravaConfig } from '@/lib/external/strava/config';

export function StravaAuthButton() {
  const handleStravaAuth = () => {
    const params = new URLSearchParams({
      client_id: stravaConfig.clientId,
      redirect_uri: stravaConfig.redirectUri,
      response_type: 'code',
      scope: stravaConfig.scopes.join(',')
    });

    window.location.href = `${stravaConfig.authorizationUrl}?${params}`;
  };

  return (
    <button
      onClick={handleStravaAuth}
      className="flex items-center gap-2 px-4 py-2 bg-[#FC4C02] text-white rounded-md hover:bg-[#E34402] transition-colors"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        {/* Strava logo path */}
        <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7.008 13.828h4.172" />
      </svg>
      Connect with Strava
    </button>
  );
} 