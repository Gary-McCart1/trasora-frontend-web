// lib/spotify.ts
let accessToken: string | null = null
let tokenExpiry = 0

export async function getSpotifyAccessToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

  if (!clientId || !clientSecret) throw new Error('Missing Spotify credentials')

  // Use cached token if it's still valid
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  const data = await res.json()

  if (!res.ok) {
    console.error('Failed to fetch Spotify token:', data)
    throw new Error('Spotify token error')
  }

  accessToken = data.access_token
  tokenExpiry = Date.now() + data.expires_in * 1000 - 60_000 // subtract 1 min buffer

  return accessToken
}
