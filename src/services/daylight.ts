interface DaylightInfo {
  isDaytime: boolean;
  remainingDaylight: number; // hours
  sunriseTime: number;
  sunsetTime: number;
}

export async function getDaylightInfo(): Promise<DaylightInfo> {
  try {
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });

    // Use sunrise-sunset.org API
    const response = await fetch(
      `https://api.sunrise-sunset.org/json?lat=${position.coords.latitude}&lng=${position.coords.longitude}&formatted=0`
    );

    if (!response.ok) {
      throw new Error('Daylight service request failed');
    }

    const data = await response.json();
    const now = new Date();
    const sunrise = new Date(data.results.sunrise);
    const sunset = new Date(data.results.sunset);

    const isDaytime = now > sunrise && now < sunset;
    const remainingDaylight = isDaytime ? 
      (sunset.getTime() - now.getTime()) / (1000 * 60 * 60) : 0;

    return {
      isDaytime,
      remainingDaylight,
      sunriseTime: sunrise.getTime(),
      sunsetTime: sunset.getTime()
    };
  } catch (error) {
    console.error('Failed to fetch daylight data:', error);
    // Return fallback data based on common daylight hours
    const now = new Date();
    const sunrise = new Date(now.setHours(6, 0, 0, 0));
    const sunset = new Date(now.setHours(18, 0, 0, 0));

    return {
      isDaytime: now > sunrise && now < sunset,
      remainingDaylight: 8,
      sunriseTime: sunrise.getTime(),
      sunsetTime: sunset.getTime()
    };
  }
} 