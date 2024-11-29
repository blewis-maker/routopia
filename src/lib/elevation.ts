interface ElevationResponse {
  elevation: number;
}

export async function getElevationData(coordinates: [number, number][]) {
  let gain = 0;
  let loss = 0;
  const points: number[] = [];

  try {
    // Get elevation data for each coordinate pair
    const elevations = await Promise.all(
      coordinates.map(async ([lng, lat]) => {
        const response = await fetch(
          `https://api.mapbox.com/v4/mapbox.terrain-rgb/${lng},${lat}.pngraw?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch elevation data');
        }

        const data = await response.json() as ElevationResponse;
        return data.elevation;
      })
    );

    // Calculate elevation gain/loss
    for (let i = 1; i < elevations.length; i++) {
      const diff = elevations[i] - elevations[i - 1];
      if (diff > 0) {
        gain += diff;
      } else {
        loss += Math.abs(diff);
      }
      points.push(elevations[i]);
    }

    return {
      gain: Math.round(gain),
      loss: Math.round(loss),
      points
    };
  } catch (error) {
    console.error('Error fetching elevation data:', error);
    return {
      gain: 0,
      loss: 0,
      points: []
    };
  }
} 