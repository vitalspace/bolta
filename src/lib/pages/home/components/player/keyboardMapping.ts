// KeyboardMapping.ts
// Define key mappings for different game actions

import { inputManager } from './inputManager';

// Type for game actions
export type GameAction =
  | 'moveForward'
  | 'moveBackward'
  | 'moveLeft'
  | 'moveRight'
  | 'jump'
  | 'sprint'
  | 'crouch'
  | 'interact';

// Map of actions to keys
export interface ActionMapping {
  [action: string]: string[];
}

// Class that allows mapping actions to keys
export class KeyboardMapping {
  private mapping: ActionMapping = {};

  constructor() {
    // Default configuration
    this.setDefaultMapping();
  }

  // Sets the default mapping
  private setDefaultMapping() {
    this.mapping = {
      moveForward: ['w', 'arrowup'],
      moveBackward: ['s', 'arrowdown'],
      moveLeft: ['a', 'arrowleft'],
      moveRight: ['d', 'arrowright'],
      jump: [' '],
      sprint: ['shift'],
      crouch: ['control', 'c'],
      interact: ['e', 'f'],
    };

    // Initialize all keys in the input manager
    const allKeys = this.getAllKeys();
    inputManager.initKeys(allKeys);
  }

  // Gets all used keys
  private getAllKeys(): string[] {
    const keys = new Set<string>();

    for (const action in this.mapping) {
      for (const key of this.mapping[action]) {
        keys.add(key);
      }
    }

    return Array.from(keys);
  }

  // Changes the mapping for an action
  remapAction(action: GameAction, keys: string[]) {
    this.mapping[action] = keys;

    // Re-initialize the input manager with the new keys
    const allKeys = this.getAllKeys();
    inputManager.initKeys(allKeys);
  }

  // Checks if an action is being executed
  isActionActive(action: GameAction): boolean {
    if (!this.mapping[action]) return false;

    for (const key of this.mapping[action]) {
      if (inputManager.isKeyPressed(key)) {
        return true;
      }
    }

    return false;
  }

  // Checks if an action was just activated
  isActionJustActivated(action: GameAction): boolean {
    if (!this.mapping[action]) return false;

    for (const key of this.mapping[action]) {
      if (inputManager.isKeyJustPressed(key)) {
        return true;
      }
    }

    return false;
  }

  // Checks if an action was just deactivated
  isActionJustDeactivated(action: GameAction): boolean {
    if (!this.mapping[action]) return false;

    for (const key of this.mapping[action]) {
      if (inputManager.isKeyJustReleased(key)) {
        return true;
      }
    }

    return false;
  }

  // Returns the current mapping
  getMapping(): ActionMapping {
    return { ...this.mapping };
  }
}

// Singleton to use throughout the application
export const keyboardMapping = new KeyboardMapping();