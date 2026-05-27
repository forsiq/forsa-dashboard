/** Chromium PWA install prompt (not in default DOM lib). */
export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export type PwaInstallPlatform = 'chromium' | 'ios' | 'none';
