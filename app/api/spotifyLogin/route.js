import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const redirectUri = process.env.REDIRECT_URI || 'http://localhost:3000/';
  const scopes = [
    'user-read-private',
    'user-read-email',
    'user-library-read',
    'user-modify-playback-state'
  ];

  const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join('%20')}&response_type=token&show_dialog=true`;

  return NextResponse.json({ authUrl });
}
