
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

/**
 * Converts an audio blob to a base64 string
 * @param blob Audio blob
 * @returns Base64 encoded audio string
 */
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Extract only the base64 data without the prefix (e.g., "data:audio/webm;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Create and setup a MediaRecorder with handlers for data availability and recording stop
 * @param stream Media stream to record
 * @param onDataAvailable Callback when data is available
 * @param onStop Callback when recording stops
 * @returns MediaRecorder instance
 */
export const setupMediaRecorder = (
  stream: MediaStream,
  onDataAvailable: (blob: Blob) => void,
  onStop: () => void
): MediaRecorder => {
  const recorder = new MediaRecorder(stream);
  const chunks: BlobPart[] = [];
  
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: 'audio/webm' });
    onDataAvailable(blob);
    onStop();
  };

  return recorder;
};
