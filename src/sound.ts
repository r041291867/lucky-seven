/**
 * Side effects confined to Audio I/O.
 * One runtime per mounted tree (see `useMemo(() => createAudioRuntime(), [])`).
 */

export type AudioRuntime = Readonly<{
  playRollTick(soundOn: boolean): void
  playRevealSound(soundOn: boolean): void
  playJiaobeiTick(soundOn: boolean): void
  playJiaobeiDrop(soundOn: boolean): void
}>

export function createAudioRuntime(): AudioRuntime {
  let context: AudioContext | null = null

  const getContext = (): AudioContext =>
    context ?? (context = new AudioContext())

  const resumeIfSuspended = (audio: AudioContext): void => {
    if (audio.state === 'suspended') {
      void audio.resume()
    }
  }

  const playNoiseTap = (
    audio: AudioContext,
    t: number,
    duration: number,
    gainValue: number,
  ): void => {
    const sampleCount = Math.max(64, Math.floor(audio.sampleRate * duration))
    const buffer = audio.createBuffer(1, sampleCount, audio.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < sampleCount; i += 1) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / sampleCount)
    }

    const source = audio.createBufferSource()
    source.buffer = buffer

    const highpass = audio.createBiquadFilter()
    highpass.type = 'highpass'
    highpass.frequency.setValueAtTime(850, t)

    const gain = audio.createGain()
    gain.gain.setValueAtTime(gainValue, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration)

    source.connect(highpass)
    highpass.connect(gain)
    gain.connect(audio.destination)
    source.start(t)
    source.stop(t + duration)
  }

  return Object.freeze({
    playRollTick(soundOn: boolean): void {
      if (!soundOn) return
      const audio = getContext()
      resumeIfSuspended(audio)
      const t = audio.currentTime
      const osc = audio.createOscillator()
      const gain = audio.createGain()
      osc.type = 'square'
      osc.frequency.setValueAtTime(880, t)
      gain.gain.setValueAtTime(0.06, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04)
      osc.connect(gain)
      gain.connect(audio.destination)
      osc.start(t)
      osc.stop(t + 0.05)
    },

    playRevealSound(soundOn: boolean): void {
      if (!soundOn) return
      const audio = getContext()
      resumeIfSuspended(audio)
      const t = audio.currentTime
      const osc = audio.createOscillator()
      const gain = audio.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(523.25, t)
      osc.frequency.exponentialRampToValueAtTime(783.99, t + 0.12)
      gain.gain.setValueAtTime(0.12, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22)
      osc.connect(gain)
      gain.connect(audio.destination)
      osc.start(t)
      osc.stop(t + 0.23)
    },

    playJiaobeiTick(soundOn: boolean): void {
      if (!soundOn) return
      const audio = getContext()
      resumeIfSuspended(audio)
      const t = audio.currentTime
      playNoiseTap(audio, t, 0.028, 0.055)

      const knock = audio.createOscillator()
      const gain = audio.createGain()
      knock.type = 'triangle'
      knock.frequency.setValueAtTime(210, t)
      knock.frequency.exponentialRampToValueAtTime(130, t + 0.035)
      gain.gain.setValueAtTime(0.045, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04)
      knock.connect(gain)
      gain.connect(audio.destination)
      knock.start(t)
      knock.stop(t + 0.045)
    },

    playJiaobeiDrop(soundOn: boolean): void {
      if (!soundOn) return
      const audio = getContext()
      resumeIfSuspended(audio)
      const t = audio.currentTime
      playNoiseTap(audio, t, 0.04, 0.08)
      playNoiseTap(audio, t + 0.045, 0.026, 0.048)

      const body = audio.createOscillator()
      const gain = audio.createGain()
      body.type = 'triangle'
      body.frequency.setValueAtTime(170, t)
      body.frequency.exponentialRampToValueAtTime(95, t + 0.11)
      gain.gain.setValueAtTime(0.065, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.13)
      body.connect(gain)
      gain.connect(audio.destination)
      body.start(t)
      body.stop(t + 0.14)
    },
  })
}
