import { useEffect, useRef, useState } from 'react';

export function useSciFiDrone(isPlaying: boolean) {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const gainNodeRef = useRef<GainNode | null>(null);
  const lfoRef = useRef<OscillatorNode | null>(null);
  const lfoGainRef = useRef<GainNode | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isPlaying) {
      try {
        if (!audioCtxRef.current) {
          const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
          audioCtxRef.current = new AudioContext();
        }

        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') {
          ctx.resume();
        }

        // Create master gain
        const masterGain = ctx.createGain();
        masterGain.gain.value = 0; // Start silent for fade in
        masterGain.connect(ctx.destination);
        gainNodeRef.current = masterGain;

        // Fade in
        masterGain.gain.setTargetAtTime(0.15, ctx.currentTime, 2);

        // Create a low drone (fundamental)
        const osc1 = ctx.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.value = 55; // A1
        
        // Create a slightly detuned drone for thickness
        const osc2 = ctx.createOscillator();
        osc2.type = 'triangle';
        osc2.frequency.value = 55.5;

        // Create a higher harmonic
        const osc3 = ctx.createOscillator();
        osc3.type = 'sine';
        osc3.frequency.value = 110; // A2

        // Create an LFO for slow modulation
        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.1; // Very slow modulation

        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 10; // Modulation depth

        lfo.connect(lfoGain);
        lfoGain.connect(osc2.frequency);
        lfoGain.connect(osc3.frequency);

        // Connect oscillators to master gain
        osc1.connect(masterGain);
        osc2.connect(masterGain);
        osc3.connect(masterGain);

        // Start everything
        osc1.start();
        osc2.start();
        osc3.start();
        lfo.start();

        oscillatorsRef.current = [osc1, osc2, osc3];
        lfoRef.current = lfo;
        lfoGainRef.current = lfoGain;

      } catch (err) {
        console.error("Failed to initialize Web Audio API", err);
        setError(true);
      }
    } else {
      // Fade out and stop
      if (gainNodeRef.current && audioCtxRef.current) {
        const ctx = audioCtxRef.current;
        const gain = gainNodeRef.current;
        
        gain.gain.setTargetAtTime(0, ctx.currentTime, 0.5);
        
        setTimeout(() => {
          oscillatorsRef.current.forEach(osc => {
            try { osc.stop(); osc.disconnect(); } catch (e) {}
          });
          if (lfoRef.current) {
            try { lfoRef.current.stop(); lfoRef.current.disconnect(); } catch (e) {}
          }
          if (lfoGainRef.current) {
            try { lfoGainRef.current.disconnect(); } catch (e) {}
          }
          try { gain.disconnect(); } catch (e) {}
          
          oscillatorsRef.current = [];
          lfoRef.current = null;
          lfoGainRef.current = null;
          gainNodeRef.current = null;
        }, 1000);
      }
    }

    return () => {
      // Cleanup on unmount
      if (gainNodeRef.current && audioCtxRef.current) {
        const ctx = audioCtxRef.current;
        gainNodeRef.current.gain.setTargetAtTime(0, ctx.currentTime, 0.1);
      }
    };
  }, [isPlaying]);

  return { error };
}
