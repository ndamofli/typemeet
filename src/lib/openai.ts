
import OpenAI from 'openai'

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})
/*
export interface DreamAnalysisResult {
  analysis_text: string
  emotions: Record<string, number>
  symbols: Record<string, string>
  themes: string[]
  interpretation: string
  confidence_score: number
}

export async function analyzeDream(dreamContent: string, dreamTitle: string): Promise<DreamAnalysisResult> {
  try {
    const prompt = `
    Analyze this dream and provide a comprehensive interpretation. Return a JSON object with the following structure:

    {
      "analysis_text": "A detailed analysis of the dream content",
      "emotions": {"emotion1": 0.8, "emotion2": 0.6}, // emotional intensity scores from 0-1
      "symbols": {"symbol1": "meaning1", "symbol2": "meaning2"}, // key symbols and their meanings
      "themes": ["theme1", "theme2"], // main themes identified
      "interpretation": "A thoughtful interpretation of what this dream might mean",
      "confidence_score": 0.85 // confidence in the analysis from 0-1
    }

    Dream Title: ${dreamTitle}
    Dream Content: ${dreamContent}

    Please provide a thoughtful, psychological interpretation based on common dream symbolism and psychology. Be empathetic and insightful.
    `

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a professional dream analyst with expertise in psychology and dream interpretation. Provide thoughtful, empathetic analyses that help users understand their dreams better. Always return valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No content returned from OpenAI')
    }

    try {
      const analysis = JSON.parse(content)
      return analysis
    } catch {
      // If JSON parsing fails, create a basic analysis
      return {
        analysis_text: content,
        emotions: { curiosity: 0.7, wonder: 0.6 },
        symbols: { dream: 'subconscious exploration' },
        themes: ['self-reflection', 'inner thoughts'],
        interpretation: 'This dream appears to reflect your subconscious mind processing daily experiences and emotions.',
        confidence_score: 0.6,
      }
    }
  } catch (error) {
    console.error('Error analyzing dream:', error)
    throw new Error('Failed to analyze dream')
  }
}

export async function generatePatterns(dreams: unknown[]): Promise<unknown> {
  try {
    const prompt = `
    Analyze these dreams and identify patterns. Return a JSON object with pattern insights:

    {
      "recurring_symbols": [{"symbol": "water", "frequency": 5, "meaning": "emotions"}],
      "emotion_trends": {"anxiety": 0.3, "happiness": 0.6, "fear": 0.1},
      "theme_patterns": ["relationships", "career", "family"],
      "sleep_correlations": {"poor_sleep_themes": ["anxiety", "stress"], "good_sleep_themes": ["peaceful", "flying"]},
      "insights": "Key insights about dream patterns",
      "recommendations": "Recommendations based on patterns"
    }

    Dreams: ${JSON.stringify(dreams)}
    `

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a dream pattern analyst. Identify meaningful patterns in dream data and provide insights. Always return valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.5,
      max_tokens: 800,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No content returned from OpenAI')
    }

    return JSON.parse(content)
  } catch (error) {
    console.error('Error generating patterns:', error)
    throw new Error('Failed to generate patterns')
  }
}
*/