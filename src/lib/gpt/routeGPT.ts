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
    console.log('Processing request:', request); // Debug log

    const locationContext = request.location 
      ? `The user is currently located at coordinates: ${request.location.latitude}, ${request.location.longitude} in Colorado.`
      : 'The user is somewhere in Colorado.';

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are RouteGPT, a specialized route planning assistant for Colorado. ${locationContext} You help users find routes, discover local attractions, and navigate the area. Focus on providing specific, actionable advice based on the user's location.`
        },
        {
          role: "user",
          content: request.message
        }
      ],
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      max_tokens: 200,
    });

    const response = completion.choices[0].message.content;
    console.log('AI Response:', response); // Debug log
    return response;

  } catch (error) {
    console.error('RouteGPT Error:', error);
    throw error;
  }
} 