# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 1-options.spec.ts >> Options Navigation, Validation, and Persistence >> should navigate to options, validate inputs, save, and persist after refresh
- Location: e2e\1-options.spec.ts:20:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Game Options' })

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
  3  | test.describe('Options Navigation, Validation, and Persistence', () => {
  4  |   test('should contain keyboard focus and close with Escape', async ({ page }) => {
  5  |     await page.goto('/');
  6  |     await page.getByRole('button', { name: 'Game Options' }).click();
  7  |     await expect(page.getByRole('dialog', { name: 'Battle Options' })).toBeVisible();
  8  | 
  9  |     const firstControl = page.getByRole('button', { name: 'Increase session time by 15s' });
  10 |     const lastControl = page.getByRole('button', { name: 'Back' });
  11 |     await expect(firstControl).toBeFocused();
  12 |     await page.keyboard.press('Shift+Tab');
  13 |     await expect(lastControl).toBeFocused();
  14 |     await page.keyboard.press('Escape');
  15 | 
  16 |     await expect(page.getByRole('button', { name: 'Start Battle' })).toBeVisible();
  17 |     await expect(page.getByRole('dialog')).toHaveCount(0);
  18 |   });
  19 | 
  20 |   test('should navigate to options, validate inputs, save, and persist after refresh', async ({ page }) => {
  21 |     await page.goto('/');
  22 |     
  23 |     // Click Options in main menu
> 24 |     await page.getByRole('button', { name: 'Game Options' }).click();
     |                                                              ^ Error: locator.click: Test timeout of 30000ms exceeded.
  25 |     await expect(page.getByRole('heading', { name: 'Battle Options' })).toBeVisible();
  26 | 
  27 |     const sessionTime = page.getByText('60s', { exact: true });
  28 |     const spawnInterval = page.getByText('3.0s', { exact: true });
  29 |     await expect(sessionTime).toBeVisible();
  30 |     await expect(spawnInterval).toBeVisible();
  31 | 
  32 |     const decreaseSession = page.getByRole('button', { name: 'Decrease session time by 15s' });
  33 |     const increaseSession = page.getByRole('button', { name: 'Increase session time by 15s' });
  34 |     const increaseSpawn = page.getByRole('button', { name: 'Increase spawn interval by 0.5s' });
  35 | 
  36 |     await expect(decreaseSession).toBeDisabled();
  37 |     for (let step = 0; step < 2; step++) await increaseSession.click();
  38 |     for (let step = 0; step < 6; step++) await increaseSession.click();
  39 |     await expect(page.getByText('180s', { exact: true })).toBeVisible();
  40 |     await expect(increaseSession).toBeDisabled();
  41 |     for (let step = 0; step < 6; step++) await page.getByRole('button', { name: 'Decrease session time by 15s' }).click();
  42 |     for (let step = 0; step < 4; step++) await increaseSpawn.click();
  43 |     for (let step = 0; step < 8; step++) await page.getByRole('button', { name: 'Decrease spawn interval by 0.5s' }).click();
  44 |     await expect(page.getByText('1.0s', { exact: true })).toBeVisible();
  45 |     await expect(page.getByRole('button', { name: 'Decrease spawn interval by 0.5s' })).toBeDisabled();
  46 |     for (let step = 0; step < 8; step++) await increaseSpawn.click();
  47 |     await expect(page.getByText('90s', { exact: true })).toBeVisible();
  48 |     await expect(page.getByText('5.0s', { exact: true })).toBeVisible();
  49 | 
  50 |     // Refresh the page
  51 |     await page.reload();
  52 | 
  53 |     // Verify persistence
  54 |     await page.getByRole('button', { name: 'Game Options' }).click();
  55 |     await expect(page.getByText('90s', { exact: true })).toBeVisible();
  56 |     await expect(page.getByText('5.0s', { exact: true })).toBeVisible();
  57 |   });
  58 | });
  59 | 
  60 | 
```