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

export async function testRouteGPT(request: ChatRequest) {
  try {
    console.log('Processing request:', request);

    const locationContext = request.location 
      ? `Important: The user is currently at coordinates (${request.location.latitude}° N, ${request.location.longitude}° W) in Colorado. 
         Always consider this location when suggesting routes and calculating travel times.
         If the user hasn't specified a destination, suggest nearby locations within a reasonable distance.`
      : 'The user has not shared their location. Please ask for their location in Colorado to provide accurate suggestions.';

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are RouteGPT, a specialized route planning assistant for Colorado.
          ${locationContext}
          
          When the user's location is provided:
          1. Always use it as the starting point
          2. Calculate approximate travel times from this location
          3. Suggest routes and destinations that make sense from this position
          
          Format ALL responses with:
          1. Name of the suggested location/route
          2. Exact coordinates in parentheses (XX.XXXX° N, XXX.XXXX° W)
          3. Brief description
          4. Travel time from user's current location
          5. Specific parking suggestions or trailhead information
          6. Any relevant tips
          
          Example response with location:
          "Based on your current location, I recommend the Boulder Creek Path (40.0176° N, 105.2797° W). This scenic trail follows Boulder Creek through the heart of the city. From your location, it's approximately 20 minutes by car to the suggested parking at Eben G. Fine Park. The trail offers a beautiful 5.5-mile ride with multiple access points. Best to park at Eben G. Fine Park where there's ample parking and direct trail access."`
        },
        {
          role: "user",
          content: request.message
        }
      ],
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      max_tokens: 400,
    });

    const response = completion.choices[0].message.content;
    console.log('AI Response:', response);
    return response;

  } catch (error) {
    console.error('RouteGPT Error:', error);
    throw error;
  }
} 