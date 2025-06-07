// Declaration file for third-party modules without type definitions

declare module 'react-native-onboarding-swiper' {
  import { ComponentType } from 'react';
  import { ViewStyle, TextStyle, ImageSourcePropType } from 'react-native';

  export interface OnboardingProps {
    pages: Array<{
      backgroundColor: string;
      image: React.ReactElement | ImageSourcePropType;
      title: string;
      subtitle: string;
      titleStyles?: TextStyle;
      subTitleStyles?: TextStyle;
    }>;
    bottomBarHighlight?: boolean;
    bottomBarHeight?: number;
    bottomBarColor?: string;
    controlStatusBar?: boolean;
    showSkip?: boolean;
    showNext?: boolean;
    showDone?: boolean;
    skipLabel?: string;
    nextLabel?: string;
    DoneButtonComponent?: ComponentType<any>;
    SkipButtonComponent?: ComponentType<any>;
    NextButtonComponent?: ComponentType<any>;
    DotComponent?: ComponentType<any>;
    containerStyles?: ViewStyle;
    imageContainerStyles?: ViewStyle;
    allowFontScaling?: boolean;
    transitionAnimationDuration?: number;
    skipToPage?: number;
    pageIndexCallback?: (index: number) => void;
    onSkip?: () => void;
    onDone?: () => void;
  }

  export default class Onboarding extends React.Component<OnboardingProps> {}
}

declare module 'expo-location' {
  export interface LocationObject {
    coords: {
      latitude: number;
      longitude: number;
      altitude: number | null;
      accuracy: number | null;
      altitudeAccuracy: number | null;
      heading: number | null;
      speed: number | null;
    };
    timestamp: number;
  }

  export interface LocationOptions {
    accuracy?: LocationAccuracy;
    mayShowUserSettingsDialog?: boolean;
  }

  export enum LocationAccuracy {
    Lowest = 1,
    Low = 2,
    Balanced = 3,
    High = 4,
    Highest = 5,
    BestForNavigation = 6,
  }

  export type LocationPermissionResponse = {
    status: 'granted' | 'denied' | 'undetermined';
    granted: boolean;
    canAskAgain: boolean;
    expires?: 'never' | number;
  };

  export function requestForegroundPermissionsAsync(): Promise<LocationPermissionResponse>;
  export function getCurrentPositionAsync(options?: LocationOptions): Promise<LocationObject>;
  export function watchPositionAsync(
    options: LocationOptions,
    callback: (location: LocationObject) => void
  ): { remove: () => void };
}
