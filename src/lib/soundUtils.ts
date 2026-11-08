// ============================================================================
// Hourly Tourism - Web Audio Notification Chimes & Vehicle Horn Buzzers
// ============================================================================

let sharedAudioContext: AudioContext | null = null
let audioUnlocked = false

let continuousBuzzerInterval: any = null
let isBuzzerActive = false

/**
 * Initializes and unlocks the shared browser AudioContext on user interaction.
 * Crucial for mobile Chrome, WebView, Safari, and Edge which block background audio.
 */
export function unlockAudio() {
  if (typeof window === 'undefined') return
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioCtx) return

    if (!sharedAudioContext) {
      sharedAudioContext = new AudioCtx()
    }

    if (sharedAudioContext.state === 'suspended') {
      sharedAudioContext.resume().then(() => {
        audioUnlocked = true
      }).catch(() => {})
    } else {
      audioUnlocked = true
    }
  } catch (e) {
    // Non-fatal
  }
}

// Auto-bind one-time interaction listeners to unlock audio as soon as user touches or clicks the app
if (typeof window !== 'undefined') {
  const unlockEvents = ['click', 'touchstart', 'keydown']
  const handleInteraction = () => {
    unlockAudio()
    unlockEvents.forEach((evt) => window.removeEventListener(evt, handleInteraction))
  }
  unlockEvents.forEach((evt) => window.addEventListener(evt, handleInteraction, { passive: true }))
}

/**
 * Plays a warm, friendly, melodic notification chime.
 * Tuned to an elegant E-Major acoustic chime arpeggio (E5 -> G#5 -> B5),
 * ensuring providers receive a clear, welcoming, pleasant notification
 * that is comfortable to the ears and non-alarming.
 */
export function playMildHornBuzzer() {
  if (typeof window === 'undefined') return

  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioCtx) return

    if (!sharedAudioContext) {
      sharedAudioContext = new AudioCtx()
    }

    const ctx = sharedAudioContext
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {})
    }

    const startTime = ctx.currentTime

    // Friendly 3-note harmonic chime sequence (E5 -> G#5 -> B5)
    const chimeNotes = [
      { freq: 659.25, time: startTime, dur: 0.22, vol: 0.22 },        // E5
      { freq: 830.61, time: startTime + 0.12, dur: 0.24, vol: 0.25 }, // G#5
      { freq: 987.77, time: startTime + 0.26, dur: 0.55, vol: 0.28 }, // B5
    ]

    chimeNotes.forEach(({ freq, time, dur, vol }) => {
      // Primary Oscillator (Pure warm sine wave)
      const osc1 = ctx.createOscillator()
      const gain1 = ctx.createGain()

      osc1.type = 'sine'
      osc1.frequency.setValueAtTime(freq, time)

      gain1.gain.setValueAtTime(0, time)
      gain1.gain.linearRampToValueAtTime(vol, time + 0.02)
      gain1.gain.exponentialRampToValueAtTime(0.001, time + dur)

      osc1.connect(gain1)
      gain1.connect(ctx.destination)

      osc1.start(time)
      osc1.stop(time + dur)

      // Secondary Oscillator (Soft overtone for rich chime body)
      const osc2 = ctx.createOscillator()
      const gain2 = ctx.createGain()

      osc2.type = 'triangle'
      osc2.frequency.setValueAtTime(freq * 1.5, time)

      gain2.gain.setValueAtTime(0, time)
      gain2.gain.linearRampToValueAtTime(vol * 0.25, time + 0.02)
      gain2.gain.exponentialRampToValueAtTime(0.001, time + dur * 0.7)

      osc2.connect(gain2)
      gain2.connect(ctx.destination)

      osc2.start(time)
      osc2.stop(time + dur * 0.7)
    })
  } catch (err) {
    console.debug('Friendly audio notification skipped:', err)
  }
}

/**
 * Starts continuous looping notification for the provider when a new booking arrives.
 * Plays a friendly melodic chime every 3.8 seconds until provider accepts or declines.
 */
export function startContinuousProviderBuzzer() {
  if (typeof window === 'undefined') return
  if (isBuzzerActive) return
  isBuzzerActive = true

  // Play immediately
  playMildHornBuzzer()

  // Repeat every 3.8 seconds in a calm, friendly rhythm
  continuousBuzzerInterval = setInterval(() => {
    playMildHornBuzzer()
  }, 3800)

  // Broadcast event so UI can display ringing status
  window.dispatchEvent(new CustomEvent('hourly-provider-buzzer-change', { detail: { active: true } }))
}

/**
 * Stops continuous buzzer when provider clicks Accept or Reject on the booking request.
 */
export function stopContinuousProviderBuzzer() {
  if (continuousBuzzerInterval) {
    clearInterval(continuousBuzzerInterval)
    continuousBuzzerInterval = null
  }
  isBuzzerActive = false

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('hourly-provider-buzzer-change', { detail: { active: false } }))
  }
}

/**
 * Returns whether provider buzzer is actively sounding.
 */
export function isProviderBuzzerActive(): boolean {
  return isBuzzerActive
}

/**
 * Customer Notification Sound 1: TRIP ACCEPTED / CONFIRMED 🎉
 * Joyful, cheerful 4-note ascending bell chime arpeggio: C5 -> E5 -> G5 -> C6.
 * Plays once on the customer portal when the provider accepts the booking.
 */
export function playBookingAcceptedSound() {
  if (typeof window === 'undefined') return
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioCtx) return

    if (!sharedAudioContext) {
      sharedAudioContext = new AudioCtx()
    }

    const ctx = sharedAudioContext
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {})
    }

    const now = ctx.currentTime

    // Joyful ascending chime notes (C5, E5, G5, C6)
    const notes = [
      { freq: 523.25, time: now, dur: 0.18, vol: 0.45 },
      { freq: 659.25, time: now + 0.1, dur: 0.20, vol: 0.50 },
      { freq: 783.99, time: now + 0.2, dur: 0.25, vol: 0.55 },
      { freq: 1046.5, time: now + 0.32, dur: 0.65, vol: 0.60 },
    ]

    notes.forEach(({ freq, time, dur, vol }) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, time)

      gain.gain.setValueAtTime(0, time)
      gain.gain.linearRampToValueAtTime(vol, time + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, time + dur)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(time)
      osc.stop(time + dur)
    })
  } catch (err) {
    console.debug('Booking accepted sound skipped:', err)
  }
}

/**
 * Customer Notification Sound 2: TRIP REJECTED / DECLINED
 * Distinct, polite 2-note descending alert tone: G4 -> Eb4 (soft warm chime).
 * Clearly intimates customer that host declined so they can choose another host.
 * Non-continuous (single trigger).
 */
export function playBookingRejectedSound() {
  if (typeof window === 'undefined') return
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioCtx) return

    if (!sharedAudioContext) {
      sharedAudioContext = new AudioCtx()
    }

    const ctx = sharedAudioContext
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {})
    }

    const now = ctx.currentTime

    // 2-tone descending alert (G4 392Hz -> Eb4 311Hz)
    const notes = [
      { freq: 392.00, time: now, dur: 0.24, vol: 0.40 },
      { freq: 311.13, time: now + 0.22, dur: 0.42, vol: 0.45 },
    ]

    notes.forEach(({ freq, time, dur, vol }) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, time)

      gain.gain.setValueAtTime(0, time)
      gain.gain.linearRampToValueAtTime(vol, time + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.001, time + dur)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(time)
      osc.stop(time + dur)
    })
  } catch (err) {
    console.debug('Booking rejected sound skipped:', err)
  }
}
