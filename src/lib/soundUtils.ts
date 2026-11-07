// ============================================================================
// Hourly Tourism - Web Audio Notification Chime (Mild Horn / Buzzer Alert)
// ============================================================================

let sharedAudioContext: AudioContext | null = null
let audioUnlocked = false

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
 * Tuned to mimic friendly automotive/scooter horn frequencies (587Hz D5 -> 784Hz G5),
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
