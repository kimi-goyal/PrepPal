// client/src/utils/vocalAnalysis.js
//
// Lightweight, honest vocal-delivery analysis — NOT machine-learned emotion
// recognition. It measures three real signals from the recorded audio:
//   - pace          (words per minute, using the transcript + audio duration)
//   - pitchVariance (how much the fundamental frequency moves — monotone vs varied)
//   - energyVariance(how much loudness moves — flat vs dynamic delivery)
// and maps them to a small set of descriptive tags with simple thresholds.

// Extracts a single-channel Float32Array of samples from a video/audio Blob.
async function decodeBlobToSamples(blob) {
  const arrayBuffer = await blob.arrayBuffer();
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const ctx = new AudioCtx();
  const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
  const samples = audioBuffer.getChannelData(0); // first channel is enough
  const duration = audioBuffer.duration;
  await ctx.close();
  return { samples, duration, sampleRate: audioBuffer.sampleRate };
}

// Root-mean-square energy of a frame — a proxy for loudness.
function rms(frame) {
  let sum = 0;
  for (let i = 0; i < frame.length; i++) sum += frame[i] * frame[i];
  return Math.sqrt(sum / frame.length);
}

// Very simple autocorrelation-based pitch estimate for one frame.
// Returns 0 if the frame is too quiet/noisy to get a confident estimate.
function estimatePitch(frame, sampleRate) {
  const minFreq = 80;   // ~lowest human voice fundamental
  const maxFreq = 400;  // ~highest before this method gets unreliable
  const minLag = Math.floor(sampleRate / maxFreq);
  const maxLag = Math.floor(sampleRate / minFreq);

  let bestLag = -1;
  let bestCorrelation = 0;

  for (let lag = minLag; lag <= maxLag; lag++) {
    let correlation = 0;
    for (let i = 0; i < frame.length - lag; i++) {
      correlation += frame[i] * frame[i + lag];
    }
    if (correlation > bestCorrelation) {
      bestCorrelation = correlation;
      bestLag = lag;
    }
  }

  if (bestLag <= 0) return 0;
  return sampleRate / bestLag;
}

// Standard deviation helper.
function stdDev(values) {
  if (!values.length) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

/**
 * Analyzes a recorded response and returns descriptive delivery tags + raw metrics.
 * @param {Blob} blob - the recorded video/audio blob
 * @param {number} wordCount - word count of the transcript (from Gemini's transcript)
 */
export async function analyzeVocalDelivery(blob, wordCount) {
  try {
    const { samples, duration, sampleRate } = await decodeBlobToSamples(blob);

    const frameSize = 2048;
    const hop = 1024;
    const pitches = [];
    const energies = [];

    for (let start = 0; start + frameSize < samples.length; start += hop) {
      const frame = samples.subarray(start, start + frameSize);
      const energy = rms(frame);

      // Skip near-silent frames (pauses) — they'd distort pitch/energy stats.
      if (energy < 0.01) continue;

      energies.push(energy);
      const pitch = estimatePitch(frame, sampleRate);
      if (pitch > 0) pitches.push(pitch);
    }

    const pace = duration > 0 ? Math.round((wordCount / duration) * 60) : 0; // words per minute
    const pitchVariance = Math.round(stdDev(pitches));   // Hz
    const energyVariance = Math.round(stdDev(energies) * 1000); // scaled for readability

    const tags = [];

    if (pace > 0) {
      if (pace < 100) tags.push("Slow, deliberate pace");
      else if (pace > 160) tags.push("Fast pace");
      else tags.push("Comfortable pace");
    }

    if (pitches.length > 5) {
      if (pitchVariance < 15) tags.push("Monotone delivery");
      else if (pitchVariance > 40) tags.push("Highly expressive tone");
      else tags.push("Natural tonal variation");
    }

    if (energies.length > 5) {
      if (energyVariance < 5) tags.push("Flat energy");
      else if (energyVariance > 20) tags.push("Dynamic energy");
    }

    return {
      tags,
      metrics: { pace, pitchVariance, energyVariance },
    };
  } catch (err) {
    console.error("Vocal analysis failed:", err);
    return { tags: [], metrics: null };
  }
}