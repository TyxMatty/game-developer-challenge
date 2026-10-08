export {};

declare global {
  interface Window {
    __GAME_TEST_CONFIG__?: {
      seed?: number;
      manualClock?: boolean;
    };
  }
}
