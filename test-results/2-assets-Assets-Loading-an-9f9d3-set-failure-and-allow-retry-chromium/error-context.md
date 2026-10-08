# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 2-assets.spec.ts >> Assets Loading and Retries >> should show loading, handle asset failure, and allow retry
- Location: e2e\2-assets.spec.ts:6:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Start Battle' })

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - img "React logo" [ref=e5]
      - img "Vite logo" [ref=e6]
    - generic [ref=e7]:
      - heading "Get started" [level=1] [ref=e8]
      - paragraph [ref=e9]:
        - text: Edit
        - code [ref=e10]: src/App.tsx
        - text: and save to test
        - code [ref=e11]: HMR
    - button "Count is 0" [ref=e12]
  - generic [ref=e13]:
    - generic [ref=e14]:
      - heading "Documentation" [level=2] [ref=e17]
      - paragraph [ref=e18]: Your questions, answered
      - list [ref=e19]:
        - listitem [ref=e20]:
          - link "Explore Vite" [ref=e21] [cursor=pointer]:
            - /url: https://vite.dev/
        - listitem [ref=e22]:
          - link "Learn more" [ref=e23] [cursor=pointer]:
            - /url: https://react.dev/
    - generic [ref=e24]:
      - heading "Connect with us" [level=2] [ref=e27]
      - paragraph [ref=e28]: Join the Vite community
      - list [ref=e29]:
        - listitem [ref=e30]:
          - link "GitHub" [ref=e31] [cursor=pointer]:
            - /url: https://github.com/vitejs/vite
        - listitem [ref=e34]:
          - link "Discord" [ref=e35] [cursor=pointer]:
            - /url: https://chat.vite.dev/
        - listitem [ref=e38]:
          - link "X.com" [ref=e39] [cursor=pointer]:
            - /url: https://x.com/vite_js
        - listitem [ref=e42]:
          - link "Bluesky" [ref=e43] [cursor=pointer]:
            - /url: https://bsky.app/profile/vite.dev
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Assets Loading and Retries', () => {
  4  |   test.use({ serviceWorkers: 'block' });
  5  | 
  6  |   test('should show loading, handle asset failure, and allow retry', async ({ page }) => {
  7  |     await page.goto('/');
  8  |     
  9  |     await page.route('**/assets/png/default/ships/ship_1.png', route => route.abort('failed'));
  10 |     
> 11 |     await page.getByRole('button', { name: 'Start Battle' }).click();
     |                                                              ^ Error: locator.click: Test timeout of 30000ms exceeded.
  12 | 
  13 |     await expect(page.getByRole('alert').getByText('Failed to load game assets')).toBeVisible();
  14 | 
  15 |     // Now remove the interception and click Retry
  16 |     await page.unroute('**/assets/png/default/ships/ship_1.png');
  17 |     
  18 |     await page.getByRole('button', { name: 'Retry' }).click();
  19 | 
  20 |     await expect(page.getByRole('banner', { name: 'Combat Heads-Up Display' })).toBeVisible();
  21 |   });
  22 | });
  23 | 
  24 | 
```