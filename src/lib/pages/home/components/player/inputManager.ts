// InputManager.ts
// Class to handle user inputs in a reusable way

// Interface to define the state of a key
export interface KeyState {
    isPressed: boolean;
    justPressed: boolean;
    justReleased: boolean;
  }
  
  // Interface for the key map
  export interface KeyMap {
    [key: string]: KeyState;
  }
  
  // Class to handle keyboard inputs
  export class InputManager {
    keys: KeyMap = {};
    
    // Method to initialize the keys we want to monitor
    initKeys(keyList: string[]) {
      for (const key of keyList) {
        this.keys[key] = {
          isPressed: false,
          justPressed: false,
          justReleased: false,
        };
      }
    }
  
    // Method to activate event listeners
    activate() {
      document.addEventListener("keydown", this.handleKeyDown.bind(this));
      document.addEventListener("keyup", this.handleKeyUp.bind(this));
    }
  
    // Method to deactivate event listeners
    deactivate() {
      document.removeEventListener("keydown", this.handleKeyDown.bind(this));
      document.removeEventListener("keyup", this.handleKeyUp.bind(this));
    }
  
    // Handler for keydown
    private handleKeyDown(e: KeyboardEvent) {
      const key = e.key.toLowerCase();
      if (this.keys[key]) {
        if (!this.keys[key].isPressed) {
          this.keys[key].justPressed = true;
        }
        this.keys[key].isPressed = true;
        e.preventDefault();
      }
    }
  
    // Handler for keyup
    private handleKeyUp(e: KeyboardEvent) {
      const key = e.key.toLowerCase();
      if (this.keys[key]) {
        this.keys[key].isPressed = false;
        this.keys[key].justReleased = true;
        e.preventDefault();
      }
    }
  
    // Method to update key states (call on each frame)
    update() {
      for (const key in this.keys) {
        // Reset justPressed and justReleased after one frame
        if (this.keys[key].justPressed) {
          this.keys[key].justPressed = false;
        }
        if (this.keys[key].justReleased) {
          this.keys[key].justReleased = false;
        }
      }
    }
  
    // Method to check if a key is pressed
    isKeyPressed(key: string): boolean {
      return this.keys[key]?.isPressed || false;
    }
  
    // Method to check if a key was just pressed
    isKeyJustPressed(key: string): boolean {
      return this.keys[key]?.justPressed || false;
    }
  
    // Method to check if a key was just released
    isKeyJustReleased(key: string): boolean {
      return this.keys[key]?.justReleased || false;
    }
  
    // Method to get the key map directly
    getKeyMap(): KeyMap {
      return this.keys;
    }
  }
  
  // Singleton to use throughout the application
  export const inputManager = new InputManager();