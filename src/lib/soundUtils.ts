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
 * Plays an authentic, crisp double-tone vehicle horn / buzzer alert.
 * Tuned to mimic friendly automotive/scooter horn frequencies (587Hz D5 -> 783Hz G5),
 * ensuring providers instantly hear incoming booking alerts even when app is in the background.
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

    // Helper: Play a single crisp vehicle horn blast
    const playHornPulse = (pulseStart: number, duration: number) => {
      // Primary Oscillator (Triangle wave for warm acoustic vehicle horn body)
      const osc1 = ctx.createOscillator()
      const gain1 = ctx.createGain()

      osc1.type = 'triangle'
      osc1.frequency.setValueAtTime(587.33, pulseStart) // D5
      osc1.frequency.exponentialRampToValueAtTime(783.99, pulseStart + 0.08) // G5

      gain1.gain.setValueAtTime(0, pulseStart)
      gain1.gain.linearRampToValueAtTime(0.55, pulseStart + 0.02)
      gain1.gain.exponentialRampToValueAtTime(0.001, pulseStart + duration)

      osc1.connect(gain1)
      gain1.connect(ctx.destination)

      osc1.start(pulseStart)
      osc1.stop(pulseStart + duration)

      // Secondary Oscillator (Sine wave for bright upper harmonic resonance)
      const osc2 = ctx.createOscillator()
      const gain2 = ctx.createGain()

      osc2.type = 'sine'
      osc2.frequency.setValueAtTime(740, pulseStart)
      osc2.frequency.exponentialRampToValueAtTime(880, pulseStart + 0.08) // A5

      gain2.gain.setValueAtTime(0, pulseStart)
      gain2.gain.linearRampToValueAtTime(0.4, pulseStart + 0.02)
      gain2.gain.exponentialRampToValueAtTime(0.001, pulseStart + duration)

      osc2.connect(gain2)
      gain2.connect(ctx.destination)

      osc2.start(pulseStart)
      osc2.stop(pulseStart + duration)
    }

    // Pulse 1: First honk (0.16s)
    playHornPulse(startTime, 0.16)

    // Pulse 2: Second honk after 0.1s pause (0.22s) -> Authentic Indian double-honk "Beep-Beep!"
    playHornPulse(startTime + 0.22, 0.22)
  } catch (err) {
    console.debug('Mild horn audio notification skipped:', err)
  }
}

/**
 * Starts continuous looping buzzer for the provider when a new booking arrives.
 * Rings every 1.8 seconds. Provider can stop it ONLY by accepting or declining the trip.
 */
export function startContinuousProviderBuzzer() {
  if (typeof window === 'undefined') return
  if (isBuzzerActive) return
  isBuzzerActive = true

  // Play immediately
  playMildHornBuzzer()

  // Repeat every 1.8 seconds until stopped by provider accepting or declining
  continuousBuzzerInterval = setInterval(() => {
    playMildHornBuzzer()
  }, 1800)

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
