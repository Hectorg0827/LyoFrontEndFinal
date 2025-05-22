import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";

import { ErrorHandler, ErrorType } from "./errorHandler";

/**
 * Service for handling audio recording for the avatar voice interactions
 */
class AudioRecordingService {
  private recording: Audio.Recording | null = null;
  private audioUri: string | null = null;

  /**
   * Start recording audio for voice recognition
   * @returns Promise that resolves when recording starts
   */
  async startRecording(): Promise<void> {
    try {
      // Request permissions
      const permissionResponse = await Audio.requestPermissionsAsync();
      if (!permissionResponse.granted) {
        throw ErrorHandler.createError(
          ErrorType.PERMISSION,
          "Microphone permission not granted",
        );
      }

      // Set up audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Prepare recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY,
      );

      this.recording = recording;
      console.log("Recording started");
    } catch (error) {
      console.error("Failed to start recording:", error);
      throw ErrorHandler.handleVoiceRecognitionError(error);
    }
  }

  /**
   * Stop recording and get the audio file URI
   * @returns URI of the recorded audio
   */
  async stopRecording(): Promise<string> {
    try {
      if (!this.recording) {
        throw ErrorHandler.createError(
          ErrorType.VOICE_RECOGNITION,
          "No active recording to stop",
        );
      }

      await this.recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      // Get audio file URI
      const uri = this.recording.getURI();
      if (!uri) {
        throw ErrorHandler.createError(
          ErrorType.VOICE_RECOGNITION,
          "Failed to get recording URI",
        );
      }

      this.audioUri = uri;
      this.recording = null;

      console.log("Recording stopped, URI:", uri);
      return uri;
    } catch (error) {
      console.error("Failed to stop recording:", error);
      throw ErrorHandler.handleVoiceRecognitionError(error);
    }
  }

  /**
   * Convert recorded audio to base64
   * @returns Base64 encoded audio data
   */
  async getAudioBase64(): Promise<string> {
    try {
      if (!this.audioUri) {
        throw ErrorHandler.createError(
          ErrorType.VOICE_RECOGNITION,
          "No audio recording to convert",
        );
      }

      // Read file as base64
      const base64 = await FileSystem.readAsStringAsync(this.audioUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Add proper header based on file format (usually m4a for iOS, 3gp for Android)
      const mime = Platform.OS === "ios" ? "audio/m4a" : "audio/3gpp";
      return `data:${mime};base64,${base64}`;
    } catch (error) {
      console.error("Failed to convert audio to base64:", error);
      throw ErrorHandler.handleVoiceRecognitionError(error);
    }
  }

  /**
   * Clean up temporary audio files
   */
  async cleanUpAudio(): Promise<void> {
    try {
      if (this.audioUri) {
        await FileSystem.deleteAsync(this.audioUri);
        console.log("Cleaned up audio file:", this.audioUri);
        this.audioUri = null;
      }
    } catch (error) {
      console.error("Failed to clean up audio file:", error);
    }
  }

  /**
   * Clear current recording state
   */
  clearRecording(): void {
    this.recording = null;
    this.audioUri = null;
  }
}

// Export a singleton instance of the service
export const audioRecordingService = new AudioRecordingService();
