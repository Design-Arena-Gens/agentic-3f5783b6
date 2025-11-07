'use client';

import { useState, useEffect } from 'react';

interface Message {
  id: string;
  from: string;
  text: string;
  timestamp: string;
  replied: boolean;
}

interface Settings {
  inactivityTimeout: number;
  enableAutoReply: boolean;
  learningMode: boolean;
  apiKey: string;
}

export default function Home() {
  const [connected, setConnected] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [settings, setSettings] = useState<Settings>({
    inactivityTimeout: 5,
    enableAutoReply: false,
    learningMode: true,
    apiKey: '',
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('Disconnected');
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const checkStatus = async () => {
    try {
      const res = await fetch('/api/whatsapp/status');
      const data = await res.json();
      setConnected(data.connected);
      setStatus(data.status);
      if (data.qr) {
        setQrCode(data.qr);
      }
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Failed to check status:', error);
    }
  };

  const initializeWhatsApp = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/whatsapp/initialize', {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        setStatus('Initializing...');
        setTimeout(checkStatus, 2000);
      }
    } catch (error) {
      console.error('Failed to initialize:', error);
      alert('Failed to initialize WhatsApp');
    }
    setLoading(false);
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        alert('Settings saved successfully!');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings');
    }
    setLoading(false);
  };

  const trainAgent = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/train', {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        alert(`Agent trained on ${data.messageCount} messages!`);
      }
    } catch (error) {
      console.error('Failed to train agent:', error);
      alert('Failed to train agent');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-whatsapp-dark to-whatsapp-green p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-2xl p-6 mb-6">
          <h1 className="text-4xl font-bold text-whatsapp-dark mb-2">
            WhatsApp Auto-Reply Agent 🤖
          </h1>
          <p className="text-gray-600 mb-4">
            AI-powered agent that learns your messaging style and automatically replies when you're away
          </p>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="font-semibold">{status}</span>
            </div>
            {!connected && (
              <button
                onClick={initializeWhatsApp}
                disabled={loading}
                className="bg-whatsapp-green text-white px-6 py-2 rounded-lg hover:bg-whatsapp-dark transition disabled:opacity-50"
              >
                {loading ? 'Initializing...' : 'Connect WhatsApp'}
              </button>
            )}
          </div>

          {qrCode && !connected && (
            <div className="bg-gray-50 p-6 rounded-lg mb-6 text-center">
              <h3 className="text-xl font-semibold mb-4">Scan QR Code with WhatsApp</h3>
              <div className="flex justify-center">
                <img src={qrCode} alt="QR Code" className="max-w-xs border-4 border-whatsapp-green" />
              </div>
              <p className="text-sm text-gray-600 mt-4">
                Open WhatsApp → Settings → Linked Devices → Link a Device
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-xl p-6">
            <h2 className="text-2xl font-bold text-whatsapp-dark mb-4">⚙️ Settings</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Anthropic API Key
                </label>
                <input
                  type="password"
                  value={settings.apiKey}
                  onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                  placeholder="sk-ant-..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-green focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Required for AI responses. Get yours at console.anthropic.com
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Inactivity Timeout (minutes)
                </label>
                <input
                  type="number"
                  value={settings.inactivityTimeout}
                  onChange={(e) => setSettings({ ...settings, inactivityTimeout: parseInt(e.target.value) })}
                  min="1"
                  max="60"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-green focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Auto-reply activates after this period of inactivity
                </p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="autoReply"
                  checked={settings.enableAutoReply}
                  onChange={(e) => setSettings({ ...settings, enableAutoReply: e.target.checked })}
                  className="w-5 h-5 text-whatsapp-green"
                />
                <label htmlFor="autoReply" className="text-sm font-medium text-gray-700">
                  Enable Auto-Reply
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="learning"
                  checked={settings.learningMode}
                  onChange={(e) => setSettings({ ...settings, learningMode: e.target.checked })}
                  className="w-5 h-5 text-whatsapp-green"
                />
                <label htmlFor="learning" className="text-sm font-medium text-gray-700">
                  Learning Mode (analyze your messages)
                </label>
              </div>

              <button
                onClick={saveSettings}
                disabled={loading || !settings.apiKey}
                className="w-full bg-whatsapp-green text-white px-6 py-3 rounded-lg hover:bg-whatsapp-dark transition disabled:opacity-50 font-semibold"
              >
                {loading ? 'Saving...' : 'Save Settings'}
              </button>

              <button
                onClick={trainAgent}
                disabled={loading || !connected || !settings.apiKey}
                className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition disabled:opacity-50 font-semibold"
              >
                {loading ? 'Training...' : 'Train Agent on My Messages'}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-xl p-6">
            <h2 className="text-2xl font-bold text-whatsapp-dark mb-4">💬 Recent Auto-Replies</h2>

            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p>No auto-replies yet</p>
                  <p className="text-sm mt-2">Connect WhatsApp and enable auto-reply to get started</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className="bg-whatsapp-light p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-whatsapp-dark">{msg.from}</span>
                      <span className="text-xs text-gray-500">{msg.timestamp}</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{msg.text}</p>
                    {msg.replied && (
                      <div className="flex items-center gap-2 text-xs text-green-600">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Auto-replied
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-6 mt-6">
          <h2 className="text-2xl font-bold text-whatsapp-dark mb-4">📚 How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-3">📱</div>
              <h3 className="font-semibold mb-2">1. Connect</h3>
              <p className="text-sm text-gray-600">
                Scan QR code to link your WhatsApp account securely
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🧠</div>
              <h3 className="font-semibold mb-2">2. Learn</h3>
              <p className="text-sm text-gray-600">
                AI analyzes your messaging style and common responses
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">✨</div>
              <h3 className="font-semibold mb-2">3. Auto-Reply</h3>
              <p className="text-sm text-gray-600">
                Agent responds automatically when you're inactive
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
