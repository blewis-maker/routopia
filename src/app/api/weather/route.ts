import { NextResponse } from 'next/server';

const WEATHER_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY;
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  if (!lat || !lng) {
    return NextResponse.json(
      { error: 'Missing coordinates' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `${WEATHER_API_URL}?lat=${lat}&lon=${lng}&appid=${WEATHER_API_KEY}&units=imperial`
    );

    if (!response.ok) {
      throw new Error('Weather API error');
    }

    const data = await response.json();
    
    return NextResponse.json({
      temperature: Math.round(data.main.temp),
      conditions: data.weather[0].main,
      windSpeed: Math.round(data.wind.speed),
      windDirection: data.wind.deg,
      windGust: data.wind.gust,
      humidity: data.main.humidity,
      icon: data.weather[0].icon,
      location: data.name
    });

  } catch (error) {
    console.error('Weather fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
} 