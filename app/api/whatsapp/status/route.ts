import { NextResponse } from 'next/server';

// Simulated state for demo purposes
let connectionState = {
  connected: false,
  status: 'Disconnected',
  qr: null as string | null,
  messages: [] as any[],
};

export async function GET() {
  try {
    return NextResponse.json(connectionState);
  } catch (error) {
    return NextResponse.json(
      { connected: false, status: 'Error', messages: [] },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.action === 'simulate_connect') {
      connectionState.connected = true;
      connectionState.status = 'Connected';
      connectionState.qr = null;
    } else if (body.action === 'generate_qr') {
      connectionState.qr = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      connectionState.status = 'Waiting for QR scan';
    } else if (body.action === 'add_message') {
      connectionState.messages.unshift(body.message);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update status' },
      { status: 500 }
    );
  }
}
