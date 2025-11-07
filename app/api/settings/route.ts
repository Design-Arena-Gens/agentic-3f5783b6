import { NextResponse } from 'next/server';

// In-memory storage for demo (in production, use a database)
let settings = {
  inactivityTimeout: 5,
  enableAutoReply: false,
  learningMode: true,
  apiKey: '',
};

export async function GET() {
  return NextResponse.json(settings);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    settings = {
      inactivityTimeout: body.inactivityTimeout || 5,
      enableAutoReply: body.enableAutoReply || false,
      learningMode: body.learningMode || true,
      apiKey: body.apiKey || '',
    };

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}
