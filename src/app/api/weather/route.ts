import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat') || '');
    const lng = parseFloat(searchParams.get('lng') || '');

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { error: 'Invalid coordinates' },
        { status: 400 }
      );
    }

    const OPENWEATHER_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
    if (!OPENWEATHER_API_KEY) {
      throw new Error('OpenWeather API key not configured');
    }

    console.log('Fetching weather for:', { lat, lng }); // Debug log

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${OPENWEATHER_API_KEY}&units=imperial`,
      { cache: 'no-store' } // Ensure fresh data
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenWeather API error:', errorText);
      throw new Error('Weather API request failed');
    }

    const data = await response.json();
    console.log('Weather data received:', data); // Debug log

    return NextResponse.json({
      temperature: Math.round(data.main.temp),
      conditions: data.weather[0].description,
      windSpeed: Math.round(data.wind.speed),
      humidity: data.main.humidity,
      icon: data.weather[0].icon
    });

  } catch (error) {
    console.error('Weather API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
} 