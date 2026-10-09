import { useEffect, useRef, useState } from 'react'
import { FaMusic, FaPause } from 'react-icons/fa'

// Background music player with a floating toggle button.
// - Tries to autoplay (browsers usually block this), so it also starts
//   on the visitor's first click/tap/keypress.
// - If /music.mp3 is missing, the button stays hidden (no broken UI).
const BackgroundMusic = () => {
    const audioRef = useRef(null)
    const userPausedRef = useRef(false)
    const [playing, setPlaying] = useState(false)
    const [available, setAvailable] = useState(true)

    useEffect(() => {
        const audio = audioRef.current
        if (!audio) return

        audio.volume = 0.5

        const onPlay = () => setPlaying(true)
        const onPause = () => setPlaying(false)
        const onError = () => {
            setAvailable(false)
            console.warn('[BackgroundMusic] /music.mp3 not found - add a file to public/music.mp3')
        }

        audio.addEventListener('play', onPlay)
        audio.addEventListener('pause', onPause)
        audio.addEventListener('error', onError)

        // First user interaction fallback (browsers block autoplay)
        // Skipped if the user manually paused via the button.
        const handleInteraction = () => {
            if (audio.paused && !userPausedRef.current) {
                audio.play().catch(() => { /* still blocked; wait for next interaction */ })
            }
        }
        const events = ['pointerdown', 'keydown', 'touchend']
        events.forEach((ev) => window.addEventListener(ev, handleInteraction, { passive: true }))

        // Initial autoplay attempt
        audio.play().then(() => setPlaying(true)).catch(() => { /* blocked as expected */ })

        return () => {
            audio.removeEventListener('play', onPlay)
            audio.removeEventListener('pause', onPause)
            audio.removeEventListener('error', onError)
            events.forEach((ev) => window.removeEventListener(ev, handleInteraction))
            audio.pause()
        }
    }, [])

    const toggle = () => {
        const audio = audioRef.current
        if (!audio) return
        if (audio.paused) {
            userPausedRef.current = false
            audio.play().catch(() => {})
        } else {
            userPausedRef.current = true
            audio.pause()
        }
    }

    if (!available) return null

    return (
        <>
            <audio ref={audioRef} src="/music.mp3" loop preload="auto" />
            <button
                onClick={toggle}
                aria-label={playing ? 'Pause background music' : 'Play background music'}
                title={playing ? 'Pause music' : 'Play music'}
                className="fixed z-[999] bottom-5 right-5 w-12 h-12 rounded-full flex items-center justify-center text-white text-lg shadow-lg cursor-pointer transition-transform active:scale-90 hover:scale-110 border-2 border-white/70"
                style={{
                    background: 'radial-gradient(circle at 30% 30%, #d43c3c, #8b0000)',
                    animation: playing ? 'musicPulse 1.6s ease-in-out infinite' : 'none',
                }}
            >
                {playing ? <FaPause /> : <FaMusic />}
            </button>

            {/* Keyframes for the button */}
            <style>{`
                @keyframes musicPulse {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(179, 5, 5, 0.55); }
                    50%      { box-shadow: 0 0 0 12px rgba(179, 5, 5, 0); }
                }
            `}</style>
        </>
    )
}

export default BackgroundMusic