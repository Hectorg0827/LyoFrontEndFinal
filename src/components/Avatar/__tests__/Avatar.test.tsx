import { render, fireEvent as _fireEvent } from "@testing-library/react-native"; // Renamed to _fireEvent
import React from "react";

import Avatar from "../Avatar";
import { AvatarProvider } from "../AvatarContext";

// Mock the LyoAvatar component
jest.mock("../LyoAvatar", () => {
  return function MockLyoAvatar(props) {
    return (
      <div
        data-testid="lyo-avatar"
        data-size={props.size}
        data-color={props.color}
        data-state={props.state}
      />
    );
  };
});

describe("Avatar", () => {
  it("renders correctly with default props", () => {
    const { getByTestId } = render(
      <AvatarProvider>
        <Avatar />
      </AvatarProvider>,
    );
    expect(getByTestId("lyo-avatar")).toBeTruthy();
  });

  it("passes size, color, and state props to LyoAvatar", () => {
    const mockSize = "large";
    const mockColor = "blue";
    const mockState = "listening";

    const { getByTestId } = render(
      <AvatarProvider>
        <Avatar size={mockSize} color={mockColor} state={mockState} />
      </AvatarProvider>,
    );

    const lyoAvatar = getByTestId("lyo-avatar");
    expect(lyoAvatar.props["data-size"]).toBe(mockSize);
    expect(lyoAvatar.props["data-color"]).toBe(mockColor);
    expect(lyoAvatar.props["data-state"]).toBe(mockState);
  });

  // Test for visibility toggle (if applicable)
  // This depends on how visibility is controlled in your Avatar component
  // For example, if AvatarProvider has a toggle function:
  /*
  it("toggles visibility via context", () => {
    const { getByTestId, rerender, queryByTestId } = render(
      <AvatarProvider initialVisibility={true}> // Assuming initialVisibility prop
        <Avatar />
      </AvatarProvider>
    );

    expect(getByTestId("lyo-avatar")).toBeTruthy();

    // Here you would need a way to trigger the toggle from the test
    // This might involve mocking parts of AvatarContext or exposing a toggle function
    // For simplicity, let's assume a re-render with different context state if possible
    // Or, if the Avatar component itself has a prop to hide it:

    // Rerender with Avatar hidden (example, actual implementation may vary)
    // This part is tricky without knowing the exact API of Avatar/AvatarProvider
  });
  */

  // Test for interaction (e.g., onPress)
  // This also depends on the props and behavior of your Avatar component
  /*
  it("handles onPress events", () => {
    const mockOnPress = jest.fn();
    const { getByTestId } = render(
      <AvatarProvider>
        <Avatar onPress={mockOnPress} />
      </AvatarProvider>
    );

    fireEvent.press(getByTestId("lyo-avatar"));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });
  */

  // Add more tests as needed for different props and behaviors
});
