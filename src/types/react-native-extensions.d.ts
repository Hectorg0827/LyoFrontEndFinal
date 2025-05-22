// Types for React Native internals
import { Animated } from 'react-native';

declare module 'react-native' {
  namespace Animated {
    interface Value {
      // Add internal _value property that's used in the codebase
      _value: number;
      // Add getValue method that should be available but TypeScript doesn't know about
      getValue(): number;
    }
    
    interface ValueXY {
      x: Value;
      y: Value;
      // Add setValue method with proper typing
      setValue(value: { x: number; y: number }): void;
      // Add setOffset method with proper typing
      setOffset(offset: { x: number; y: number }): void;
      // Add flattenOffset method
      flattenOffset(): void;
    }
  }
}
