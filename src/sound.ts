/**
 * Side effects confined to Audio I/O.
 * One runtime per mounted tree (see `useMemo(() => createAudioRuntime(), [])`).
 */

export type AudioRuntime = Readonly<{
  playRollTick(soundOn: boolean): void
  playRevealSound(soundOn: boolean): void
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
  })
}
