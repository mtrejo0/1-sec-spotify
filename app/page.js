"use client"

import { useState, useEffect, useRef } from 'react'
import SpotifyWebApi from 'spotify-web-api-js'
import axios from 'axios'

const spotifyApi = new SpotifyWebApi()

function LoginScreen({ onLogin }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-8 w-[350px] text-black">
      <h2 className="text-3xl font-bold text-center mb-6">Spotify Song Player</h2>
      <div className="flex justify-center">
        <button
          onClick={onLogin}
          className="bg-[#1DB954] hover:bg-[#1ed760] text-white text-xl font-bold py-3 px-6 rounded-lg flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" viewBox="0 0 20 20" fill="currentColor">
            <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
          </svg>
          Login with Spotify
        </button>
      </div>
    </div>
  )
}

export default function Home() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [currentSong, setCurrentSong] = useState(null)
  const [preloadedTracks, setPreloadedTracks] = useState([])
  const [timeoutId, setTimeoutId] = useState(null)

  useEffect(() => {
    const token = getTokenFromUrl()
    if (token) {
      spotifyApi.setAccessToken(token)
      setLoggedIn(true)
    }
  }, [])

  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }


  useEffect(() => {
    if (currentSong) {
      // Start playback on user's active device
      spotifyApi.play({
        uris: [`spotify:track:${currentSong.id}`]
      }).catch(error => console.error('Playback failed:', error));

      // Set timeout to skip after 3 seconds
      const newTimeoutId = setTimeout(() => {
        playNextSong()
      }, 5000)

      setTimeoutId(newTimeoutId)
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [currentSong])

  const getTokenFromUrl = () => {
    return window.location.hash
      .substring(1)
      .split('&')
      .reduce((initial, item) => {
        let parts = item.split('=')
        initial[parts[0]] = decodeURIComponent(parts[1])
        return initial
      }, {}).access_token
  }

  const login = async () => {
    try {
      const response = await axios.get('/api/spotifyLogin')
      window.location = response.data.authUrl
    } catch (error) {
      console.error('Error during login:', error)
    }
  }

  const preloadNextTrack = () => {
    if (preloadedTracks.length > 0) {
      const nextTrack = preloadedTracks[0]
      nextAudioRef.current.src = nextTrack.preview_url
      nextAudioRef.current.load()
    }
  }

  const playShuffledLikedSongs = async () => {
    try {
      const offset = Math.floor(Math.random() * 1000); // Random offset between 0 and 999
      const data = await spotifyApi.getMySavedTracks({ limit: 50, offset: offset })
      const randomTracks = data.items.map(item => item.track)
      shuffleArray(randomTracks)
      setPreloadedTracks(randomTracks.slice(1))
      setCurrentSong(randomTracks[0])
      preloadNextTrack()
    } catch (error) {
      console.error('Error fetching random liked songs:', error)
    }
  }

  const playNextSong = () => {
    if (preloadedTracks.length > 0) {
      setCurrentSong(preloadedTracks[0])
      setPreloadedTracks(prev => prev.slice(1))
      
    } else {
      setCurrentSong(null)
    }
  }


  const skipToNextSong = () => {
    if (timeoutId) clearTimeout(timeoutId)
    currentAudioRef.current.pause()
    nextAudioRef.current.pause()
    playNextSong()
  }

  useEffect(() => {
    if (loggedIn) {
      playShuffledLikedSongs();
    }
  }, [loggedIn]);

  if (!loggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
        <LoginScreen onLogin={login} />
      </div>
    )
  }

  return (
    <div className="text-black flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 p-8">
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-lg">
        <h1 className="text-3xl font-bold text-center mb-6">5s Song Shuffle</h1>
        {currentSong && (
          <div className="text-center">
            <img
              src={currentSong.album.images[0].url}
              alt={`${currentSong.album.name} cover`}
              className="w-64 h-64 mx-auto mb-4 rounded-lg shadow-md"
            />
            <p className="text-xl font-bold mb-2">{currentSong.name}</p>
            <p className="text-lg mb-4">{currentSong.artists[0].name}</p>
            <div className="flex justify-center items-center space-x-4">
              <button
                onClick={skipToNextSong}
                className="bg-[#1DB954] hover:bg-[#1ed760] text-white font-bold py-2 px-4 rounded-full"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}