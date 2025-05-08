
/**
 * Converts a base64 encoded audio string to an audio buffer and plays it
 * @param base64Audio Base64 encoded audio string
 */
export const playAudioFromBase64 = async (base64Audio: string): Promise<void> => {
  try {
    // Convert base64 to array buffer
    const binaryString = window.atob(base64Audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Create audio context
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Decode audio data
    const audioBuffer = await audioContext.decodeAudioData(bytes.buffer);
    
    // Create source node
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    
    // Play audio
    source.start();
    
    // Return a promise that resolves when audio finishes playing
    return new Promise((resolve) => {
      source.onended = () => {
        resolve();
      };
    });
  } catch (error) {
    console.error('Error playing audio:', error);
    throw error;
  }
};
