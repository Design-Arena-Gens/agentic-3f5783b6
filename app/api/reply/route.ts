import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: Request) {
  try {
    const { message, apiKey, userProfile } = await request.json();

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'API key not configured' },
        { status: 400 }
      );
    }

    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    const systemPrompt = `You are an AI assistant that mimics the user's messaging style on WhatsApp.
Your goal is to respond to messages as if you were the user themselves.

${userProfile ? `User's messaging style profile:\n${userProfile}` : ''}

Guidelines:
- Keep responses brief and casual, like typical WhatsApp messages
- Match the user's tone, vocabulary, and emoji usage
- Be friendly but natural
- Don't reveal that you're an AI
- If you don't know how to respond, keep it simple and honest`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Someone sent me this WhatsApp message: "${message}"\n\nHow should I reply to match my usual messaging style?`
        }
      ],
      system: systemPrompt,
    });

    const replyText = response.content[0].type === 'text'
      ? response.content[0].text
      : 'Sorry, could you send that again?';

    return NextResponse.json({
      success: true,
      reply: replyText,
    });
  } catch (error: any) {
    console.error('Reply generation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate reply' },
      { status: 500 }
    );
  }
}
