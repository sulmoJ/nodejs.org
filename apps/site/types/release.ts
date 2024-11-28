import type { ReactNode } from 'react';

import type { NodeRelease } from '@/types/releases';
import type { UserOS } from '@/types/userOS';

/**
 * @deprecated
 */
export type PackageManager = 'NVM' | 'FNM' | 'BREW' | 'DOCKER' | 'CHOCO';

export type VersionManager = 'NVM' | 'FNM';

export interface ReleaseState {
  os: UserOS;
  release: NodeRelease;
  releases: Array<NodeRelease>;
  bitness: string | number;
  platform: PackageManager;
  versionManager: VersionManager;
}

export type ReleaseAction =
  | { type: 'SET_OS'; payload: UserOS }
  | { type: 'SET_VERSION'; payload: string }
  | { type: 'SET_BITNESS'; payload: string | number }
  | { type: 'SET_PLATFORM'; payload: PackageManager }
  | { type: 'SET_VERSION_MANAGER'; payload: VersionManager };

export interface ReleaseDispatchActions {
  setVersion: (version: string) => void;
  setOS: (os: UserOS) => void;
  setBitness: (bitness: string | number) => void;
  setPlatform: (platform: PackageManager) => void;
  setVersionManager: (versionManager: VersionManager) => void;
}

export interface ReleaseContextType
  extends ReleaseState,
    ReleaseDispatchActions {}

export interface ReleaseProviderProps {
  children: ReactNode;
  releases: Array<NodeRelease>;
  initialRelease: NodeRelease;
}
