import OpenAI from 'openai';

export class OpenAIEmbeddings {
  private openai: OpenAI;
  private readonly MODEL = "text-embedding-ada-002";
  private readonly DIMENSION = 1536;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async embedText(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: this.MODEL,
        input: this.preprocessText(text),
        dimensions: this.DIMENSION
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('Embedding generation error:', error);
      throw new Error('Failed to generate embedding');
    }
  }

  private preprocessText(text: string): string {
    return text
      .replace(/\n/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }
} 