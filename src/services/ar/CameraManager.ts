export class CameraManager {
  private stream: MediaStream | null = null;
  private videoElement: HTMLVideoElement | null = null;

  async initialize(): Promise<void> {
    // Check if browser supports mediaDevices
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Camera access is not supported in this browser');
    }

    // Create video element for camera feed
    this.videoElement = document.createElement('video');
    this.videoElement.setAttribute('playsinline', ''); // Required for iOS
    this.videoElement.setAttribute('autoplay', '');
  }

  async requestCameraAccess(
    constraints: MediaStreamConstraints = {
      video: {
        facingMode: 'environment',
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      },
      audio: false
    }
  ): Promise<MediaStream> {
    try {
      // Request camera access
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);

      // Connect stream to video element
      if (this.videoElement) {
        this.videoElement.srcObject = this.stream;
        await this.videoElement.play();
      }

      return this.stream;
    } catch (error) {
      console.error('Failed to access camera:', error);
      throw new Error('Failed to access camera. Please check permissions.');
    }
  }

  async stopCamera(stream: MediaStream): Promise<void> {
    // Stop all tracks in the stream
    stream.getTracks().forEach(track => track.stop());

    // Clean up video element
    if (this.videoElement) {
      this.videoElement.srcObject = null;
      this.videoElement.remove();
      this.videoElement = null;
    }

    this.stream = null;
  }

  async switchCamera(): Promise<MediaStream> {
    const currentFacingMode = this.getCurrentFacingMode();
    const newFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';

    // Stop current stream
    if (this.stream) {
      await this.stopCamera(this.stream);
    }

    // Request new stream with switched camera
    return this.requestCameraAccess({
      video: {
        facingMode: newFacingMode,
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      },
      audio: false
    });
  }

  async getCameraCapabilities(): Promise<MediaTrackCapabilities | null> {
    if (!this.stream) return null;

    const videoTrack = this.stream.getVideoTracks()[0];
    return videoTrack ? videoTrack.getCapabilities() : null;
  }

  async setCameraSettings(settings: MediaTrackConstraints): Promise<void> {
    if (!this.stream) {
      throw new Error('Camera stream is not initialized');
    }

    const videoTrack = this.stream.getVideoTracks()[0];
    if (videoTrack) {
      await videoTrack.applyConstraints(settings);
    }
  }

  getVideoElement(): HTMLVideoElement | null {
    return this.videoElement;
  }

  private getCurrentFacingMode(): 'user' | 'environment' {
    if (!this.stream) return 'environment';

    const videoTrack = this.stream.getVideoTracks()[0];
    if (!videoTrack) return 'environment';

    const settings = videoTrack.getSettings();
    return settings.facingMode as 'user' | 'environment' || 'environment';
  }

  async takeSnapshot(): Promise<Blob | null> {
    if (!this.videoElement) return null;

    // Create canvas with video dimensions
    const canvas = document.createElement('canvas');
    canvas.width = this.videoElement.videoWidth;
    canvas.height = this.videoElement.videoHeight;

    // Draw current video frame to canvas
    const context = canvas.getContext('2d');
    if (!context) return null;

    context.drawImage(this.videoElement, 0, 0);

    // Convert canvas to blob
    return new Promise(resolve => {
      canvas.toBlob(blob => resolve(blob), 'image/jpeg', 0.95);
    });
  }
} 