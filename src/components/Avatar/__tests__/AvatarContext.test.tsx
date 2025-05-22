import { render, act, fireEvent, waitFor } from "@testing-library/react-native";
import * as Speech from "expo-speech";
import React from "react";

import { avatarService } from "../../../services/avatarService";
import { AvatarProvider, useAvatar } from "../AvatarContext";

// Mock the external services
jest.mock("../../../services/avatarService", () => ({
  avatarService: {
    getUserPreferences: jest.fn(),
    saveUserPreferences: jest.fn(),
    startVoiceRecognition: jest.fn(),
    stopVoiceRecognition: jest.fn(),
    generateResponse: jest.fn(),
  },
}));

jest.mock("expo-speech", () => ({
  speak: jest.fn(() => Promise.resolve()),
}));

jest.mock("../../../services/errorHandler", () => ({
  ErrorHandler: {
    handleError: jest.fn(),
  },
  ErrorType: {
    STORAGE: "STORAGE",
    VALIDATION: "VALIDATION",
    VOICE_RECOGNITION: "VOICE_RECOGNITION",
  },
}));

jest.mock("../../../services/validationUtils", () => ({
  validateUserPreferences: jest.fn(() => ({ valid: true })),
}));

// Test component that uses the avatar context
const TestComponent = () => {
  const {
    avatarState,
    isVisible,
    toggleAvatar,
    userPreferences,
    updateUserPreference,
    startVoiceRecognition,
    speakResponse,
    currentSubtitle,
  } = useAvatar();

  return (
    <>
      <div data-testid="avatar-state">{avatarState}</div>
      <div data-testid="avatar-visibility">
        {isVisible ? "visible" : "hidden"}
      </div>
      <div data-testid="subtitle">{currentSubtitle}</div>
      <button data-testid="toggle-visibility" onPress={toggleAvatar}>
        Toggle
      </button>
      <button data-testid="start-voice" onPress={startVoiceRecognition}>
        Start Voice
      </button>
      <button data-testid="speak" onPress={() => speakResponse("Hello")}>
        Speak
      </button>
      <button
        data-testid="toggle-subtitles"
        onPress={() =>
          updateUserPreference(
            "subtitlesEnabled",
            !userPreferences.subtitlesEnabled,
          )
        }
      >
        Toggle Subtitles
      </button>
    </>
  );
};

describe("AvatarContext", () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup default mock implementation
    avatarService.getUserPreferences.mockResolvedValue(null);
    avatarService.saveUserPreferences.mockResolvedValue(undefined);
    avatarService.startVoiceRecognition.mockResolvedValue("Test speech");
    avatarService.generateResponse.mockResolvedValue("Response");
  });

  it("should have default values on initialization", async () => {
    const { getByTestId } = render(
      <AvatarProvider>
        <TestComponent />
      </AvatarProvider>,
    );

    expect(getByTestId("avatar-state").children[0]).toBe("idle");
    expect(getByTestId("avatar-visibility").children[0]).toBe("visible");
  });

  it("should toggle avatar visibility", async () => {
    const { getByTestId } = render(
      <AvatarProvider>
        <TestComponent />
      </AvatarProvider>,
    );

    const toggleButton = getByTestId("toggle-visibility");

    // Initially visible
    expect(getByTestId("avatar-visibility").children[0]).toBe("visible");

    // Toggle to hidden
    fireEvent.press(toggleButton);
    expect(getByTestId("avatar-visibility").children[0]).toBe("hidden");

    // Toggle back to visible
    fireEvent.press(toggleButton);
    expect(getByTestId("avatar-visibility").children[0]).toBe("visible");
  });

  it("should activate voice recognition", async () => {
    const { getByTestId } = render(
      <AvatarProvider>
        <TestComponent />
      </AvatarProvider>,
    );

    const voiceButton = getByTestId("start-voice");

    await act(async () => {
      fireEvent.press(voiceButton);
      // Wait for all promises to resolve
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(avatarService.startVoiceRecognition).toHaveBeenCalled();
    expect(avatarService.generateResponse).toHaveBeenCalledWith("Test speech");
    expect(Speech.speak).toHaveBeenCalledWith("Response", expect.any(Object));
  });

  it("should show subtitles when enabled", async () => {
    const { getByTestId } = render(
      <AvatarProvider>
        <TestComponent />
      </AvatarProvider>,
    );

    // Toggle subtitles on
    const subtitlesToggle = getByTestId("toggle-subtitles");
    fireEvent.press(subtitlesToggle);

    // Speak something
    const speakButton = getByTestId("speak");

    await act(async () => {
      fireEvent.press(speakButton);
      // Wait for all promises to resolve
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Check that subtitles are shown
    await waitFor(() => {
      expect(getByTestId("subtitle")).not.toBeNull();
    });
  });
});
