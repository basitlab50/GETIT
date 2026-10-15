const fs = require('fs');
const path = require('path');

function createWavBuffer(sampleRate, frequencies, noteDuration, decayDuration, totalSamples) {
  const numChannels = 1;
  const bytesPerSample = 2; // 16-bit PCM
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = totalSamples * bytesPerSample;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF chunk descriptor
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt sub-chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20);  // AudioFormat (1 for PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34); // BitsPerSample

  // data sub-chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Generate audio samples
  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    let sample = 0;

    for (let fIdx = 0; fIdx < frequencies.length; fIdx++) {
      const noteStart = fIdx * noteDuration;
      const noteEnd = noteStart + noteDuration + decayDuration;

      if (t >= noteStart && t < noteEnd) {
        const timeInNote = t - noteStart;
        const freq = frequencies[fIdx];
        // Smooth exponential decay envelope
        const envelope = Math.exp(-timeInNote * 7);
        // Combine sine with subtle bell harmonics
        const val = (
          Math.sin(2 * Math.PI * freq * timeInNote) * 0.7 +
          Math.sin(2 * Math.PI * freq * 2.0 * timeInNote) * 0.2 +
          Math.sin(2 * Math.PI * freq * 3.0 * timeInNote) * 0.1
        ) * envelope;

        sample += val;
      }
    }

    // Clamp and convert to 16-bit signed integer
    const clamped = Math.max(-1, Math.min(1, sample * 0.7));
    const intSample = Math.floor(clamped * 32767);
    buffer.writeInt16LE(intSample, 44 + i * 2);
  }

  return buffer;
}

const sampleRate = 44100;
const soundsDir = path.join(__dirname, '../assets/sounds');
if (!fs.existsSync(soundsDir)) {
  fs.mkdirSync(soundsDir, { recursive: true });
}

// 1. Customer Concierge Chime (E5 -> B5, smooth luxury chime)
const chimeFreqs = [659.25, 987.77];
const chimeNoteDuration = 0.16;
const chimeDecay = 0.6;
const chimeTotalDuration = chimeFreqs.length * chimeNoteDuration + chimeDecay;
const chimeSamples = Math.floor(sampleRate * chimeTotalDuration);
const chimeBuf = createWavBuffer(sampleRate, chimeFreqs, chimeNoteDuration, chimeDecay, chimeSamples);
fs.writeFileSync(path.join(soundsDir, 'chime.wav'), chimeBuf);
console.log('✅ Created chime.wav:', chimeBuf.length, 'bytes');

// 2. Merchant High-Energy Cash Register Chime (C5 -> E5 -> G5 -> C6)
const merchantFreqs = [523.25, 659.25, 783.99, 1046.5];
const merchantNoteDuration = 0.14;
const merchantDecay = 0.5;
const merchantTotalDuration = merchantFreqs.length * merchantNoteDuration + merchantDecay;
const merchantSamples = Math.floor(sampleRate * merchantTotalDuration);
const merchantBuf = createWavBuffer(sampleRate, merchantFreqs, merchantNoteDuration, merchantDecay, merchantSamples);
fs.writeFileSync(path.join(soundsDir, 'merchant_order.wav'), merchantBuf);
console.log('✅ Created merchant_order.wav:', merchantBuf.length, 'bytes');
