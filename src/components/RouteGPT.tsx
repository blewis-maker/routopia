import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ChatRequest {
  message: string;
  location?: {
    latitude: number;
    longitude: number;
  } | null;
}

interface RouteGPTProps {
  onDestinationFound?: (destination: string) => void;
}

export async function testRouteGPT(request: ChatRequest, onDestinationFound?: (destination: string) => void) {
  try {
    console.log('Processing request with location:', request);

    const locationContext = request.location 
      ? `You have access to the user's current location: (${request.location.latitude}° N, ${request.location.longitude}° W).
         Use this to provide accurate travel times and directions.
         For cities and resorts, focus on travel time and directions.
         Only include coordinates when suggesting specific trailheads or outdoor recreation spots.`
      : 'Ask for the user\'s location to provide better recommendations.';

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are RouteGPT, a knowledgeable Colorado travel assistant.

          Key Instructions:
          - Start responses by clearly stating the destination you're recommending
          - For cities/resorts: Focus on travel times and general directions
          - For hiking/outdoor spots: Include coordinates and trail details
          - Always mention parking information and any seasonal considerations
          
          Response Structure:
          1. Start with "I recommend [destination]" or "Let's head to [destination]"
          2. Mention travel time from user's location
          3. Add relevant details based on destination type:
             - Cities/Resorts: Parking areas, main attractions
             - Outdoor spots: Coordinates, difficulty, elevation, trailhead info
          4. End with important tips or seasonal warnings

          ${locationContext}`
        },
        {
          role: "user",
          content: request.message
        }
      ],
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      max_tokens: 500,
    });

    const response = completion.choices[0].message.content;

    // Enhanced destination parsing
    if (response && onDestinationFound) {
      const patterns = [
        /I recommend ([^\.]+)/i,
        /Let's head to ([^\.]+)/i,
        /heading to ([^\.]+)/i,
        /suggesting ([^\.]+)/i,
        /recommend visiting ([^\.]+)/i
      ];

      for (const pattern of patterns) {
        const match = response.match(pattern);
        if (match) {
          const destination = match[1]
            .trim()
            .replace(/\.$/, '')
            .replace(/ \([^)]+\)/, ''); // Remove coordinates if present
          onDestinationFound(destination);
          break;
        }
      }
    }

    return response;

  } catch (error) {
    console.error('RouteGPT Error:', error);
    throw error;
  }
}

const handleSendMessage = async (message: string) => {
  if (!currentLocation.current) {
    console.log('No location available');
    return;
  }

  const request: ChatRequest = {
    message,
    location: {
      latitude: currentLocation.current.lat,
      longitude: currentLocation.current.lng
    }
  };

  console.log('Sending request with location:', request);
  const response = await testRouteGPT(request, (destination) => {
    // Update the destination input field
    if (onDestinationChange) {
      onDestinationChange(destination);
    }
  });
  // ... handle response
};