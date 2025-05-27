// Integration helper - Avatar Component Migration
// This file replaces the original Avatar component with the optimized version

import { memo } from 'react';

// Import the optimized components
import { AvatarOptimized } from './AvatarOptimized';
import { AvatarContextOptimized, useAvatarOptimized } from './AvatarContextOptimized';

// Re-export the optimized version as the default Avatar
export const Avatar = memo(AvatarOptimized);

// Re-export the optimized context as the default
export const AvatarProvider = AvatarContextOptimized;
export const useAvatar = useAvatarOptimized;

// For backward compatibility during transition
export { AvatarOptimized, AvatarContextOptimized, useAvatarOptimized };

// Default export
export default Avatar;
