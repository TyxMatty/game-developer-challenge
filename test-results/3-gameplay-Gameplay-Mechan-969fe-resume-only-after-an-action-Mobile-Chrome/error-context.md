# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 3-gameplay.spec.ts >> Gameplay Mechanics >> should auto-pause on focus loss and resume only after an action
- Location: e2e\3-gameplay.spec.ts:334:3

# Error details

```
Error: locator.click: Target page, context or browser has been closed
Call log:
  - waiting for getByRole('button', { name: /Resume/ })
    - waiting for "http://localhost:5173/" navigation to finish...
    - navigated to "http://localhost:5173/"

```

```
Error: browserContext.close: Test ended.
Browser logs:

<launching> C:/Users/mateu/AppData/Local/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-win64/chrome-headless-shell.exe --disable-field-trial-config --disable-background-networking --disable-background-timer-throttling --disable-backgrounding-occluded-windows --disable-back-forward-cache --disable-breakpad --disable-client-side-phishing-detection --disable-component-extensions-with-background-pages --disable-component-update --no-default-browser-check --disable-default-apps --disable-dev-shm-usage --disable-edgeupdater --disable-extensions --disable-features=AvoidUnnecessaryBeforeUnloadCheckSync,DestroyProfileOnBrowserClose,DialMediaRouteProvider,GlobalMediaControls,HttpsUpgrades,LensOverlay,MediaRouter,PaintHolding,ThirdPartyStoragePartitioning,BlockOriginHeaderModificationOnRedirect,Translate,AutoDeElevate,OptimizationHints,msForceBrowserSignIn,msEdgeUpdateLaunchServicesPreferredVersion --enable-features=CDPScreenshotNewSurface --allow-pre-commit-input --disable-hang-monitor --disable-ipc-flooding-protection --disable-popup-blocking --disable-prompt-on-repost --disable-renderer-backgrounding --disable-updater-scheduler --force-color-profile=srgb --metrics-recording-only --no-first-run --password-store=basic --use-mock-keychain --no-service-autorun --export-tagged-pdf --disable-search-engine-choice-screen --unsafely-disable-devtools-self-xss-warnings --edge-skip-compat-layer-relaunch --disable-infobars --disable-search-engine-choice-screen --disable-sync --enable-unsafe-swiftshader --headless --hide-scrollbars --mute-audio --blink-settings=primaryHoverType=2,availableHoverTypes=2,primaryPointerType=4,availablePointerTypes=4 --no-sandbox --user-data-dir=C:\Users\mateu\AppData\Local\Temp\playwright_chromiumdev_profile-gwOE25 --remote-debugging-pipe --no-startup-window
<launched> pid=2932
[pid=2932][err] [1007/212538.200:INFO:CONSOLE:934] "[vite] connecting...", source: http://localhost:5173/@vite/client (934)
[pid=2932][err] [1007/212538.228:INFO:CONSOLE:1047] "[vite] connected.", source: http://localhost:5173/@vite/client (1047)
[pid=2932][err] [1007/212538.438:INFO:CONSOLE:15805] "%cDownload the React DevTools for a better development experience: https://react.dev/link/react-devtools font-weight:bold", source: http://localhost:5173/node_modules/.vite/deps/react-dom_client.js?v=416a5cf7 (15805)
[pid=2932][err] [1007/212538.581:INFO:CONSOLE:2458] "%c[MSW] Mocking enabled. color:orangered;font-weight:bold;", source: http://localhost:5173/node_modules/.vite/deps/msw_browser.js?v=416a5cf7 (2458)
[pid=2932][err] [1007/212538.582:INFO:CONSOLE:2459] "%cDocumentation: %chttps://mswjs.io/docs font-weight:bold font-weight:normal", source: http://localhost:5173/node_modules/.vite/deps/msw_browser.js?v=416a5cf7 (2459)
[pid=2932][err] [1007/212538.582:INFO:CONSOLE:2460] "Found an issue? https://github.com/mswjs/msw/issues", source: http://localhost:5173/node_modules/.vite/deps/msw_browser.js?v=416a5cf7 (2460)
[pid=2932][err] [1007/212538.582:INFO:CONSOLE:2461] "Worker script URL: http://localhost:5173/mockServiceWorker.js", source: http://localhost:5173/node_modules/.vite/deps/msw_browser.js?v=416a5cf7 (2461)
[pid=2932][err] [1007/212538.582:INFO:CONSOLE:2462] "Worker scope: http://localhost:5173/", source: http://localhost:5173/node_modules/.vite/deps/msw_browser.js?v=416a5cf7 (2462)
[pid=2932][err] [1007/212538.582:INFO:CONSOLE:2463] "Client ID: %s (%s) 88745a26-4906-4f11-806c-c2c5ad79f9b3 top-level", source: http://localhost:5173/node_modules/.vite/deps/msw_browser.js?v=416a5cf7 (2463)
[pid=2932][err] [1007/212538.582:INFO:CONSOLE:2464] "console.groupEnd", source: http://localhost:5173/node_modules/.vite/deps/msw_browser.js?v=416a5cf7 (2464)
[pid=2932][err] [1007/212539.511:ERROR:gpu\command_buffer\service\gl_utils.cc:431] [.WebGL-0x1a040040d600]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels
[pid=2932][err] [1007/212539.564:INFO:CONSOLE:0] "[.WebGL-0x1a040040d600]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels", source: http://localhost:5173/ (0)
[pid=2932][err] [1007/212539.574:ERROR:gpu\command_buffer\service\gl_utils.cc:431] [.WebGL-0x1a040040d600]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels
[pid=2932][err] [1007/212539.604:INFO:CONSOLE:0] "[.WebGL-0x1a040040d600]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels", source: http://localhost:5173/ (0)
[pid=2932][err] [1007/212539.614:ERROR:gpu\command_buffer\service\gl_utils.cc:431] [.WebGL-0x1a040040d600]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels
[pid=2932][err] [1007/212539.631:INFO:CONSOLE:0] "[.WebGL-0x1a040040d600]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels", source: http://localhost:5173/ (0)
[pid=2932][err] [1007/212539.641:ERROR:gpu\command_buffer\service\gl_utils.cc:431] [.WebGL-0x1a040040d600]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels (this message will no longer repeat)
[pid=2932][err] [1007/212539.654:INFO:CONSOLE:0] "[.WebGL-0x1a040040d600]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels (this message will no longer repeat)", source: http://localhost:5173/ (0)
[pid=2932][err] [1007/212552.562:INFO:CONSOLE:934] "[vite] connecting...", source: http://localhost:5173/@vite/client (934)
[pid=2932][err] [1007/212552.606:INFO:CONSOLE:1047] "[vite] connected.", source: http://localhost:5173/@vite/client (1047)
[pid=2932][err] [1007/212552.912:INFO:CONSOLE:15805] "%cDownload the React DevTools for a better development experience: https://react.dev/link/react-devtools font-weight:bold", source: http://localhost:5173/node_modules/.vite/deps/react-dom_client.js?v=416a5cf7 (15805)
[pid=2932][err] [1007/212553.052:INFO:CONSOLE:2458] "%c[MSW] Mocking enabled. color:orangered;font-weight:bold;", source: http://localhost:5173/node_modules/.vite/deps/msw_browser.js?v=416a5cf7 (2458)
[pid=2932][err] [1007/212553.052:INFO:CONSOLE:2459] "%cDocumentation: %chttps://mswjs.io/docs font-weight:bold font-weight:normal", source: http://localhost:5173/node_modules/.vite/deps/msw_browser.js?v=416a5cf7 (2459)
[pid=2932][err] [1007/212553.052:INFO:CONSOLE:2460] "Found an issue? https://github.com/mswjs/msw/issues", source: http://localhost:5173/node_modules/.vite/deps/msw_browser.js?v=416a5cf7 (2460)
[pid=2932][err] [1007/212553.052:INFO:CONSOLE:2461] "Worker script URL: http://localhost:5173/mockServiceWorker.js", source: http://localhost:5173/node_modules/.vite/deps/msw_browser.js?v=416a5cf7 (2461)
[pid=2932][err] [1007/212553.052:INFO:CONSOLE:2462] "Worker scope: http://localhost:5173/", source: http://localhost:5173/node_modules/.vite/deps/msw_browser.js?v=416a5cf7 (2462)
[pid=2932][err] [1007/212553.053:INFO:CONSOLE:2463] "Client ID: %s (%s) da76a766-b1b1-4f9b-a61e-9946c138b5e1 top-level", source: http://localhost:5173/node_modules/.vite/deps/msw_browser.js?v=416a5cf7 (2463)
[pid=2932][err] [1007/212553.053:INFO:CONSOLE:2464] "console.groupEnd", source: http://localhost:5173/node_modules/.vite/deps/msw_browser.js?v=416a5cf7 (2464)
[pid=2932][err] [1007/212604.812:INFO:CONSOLE:14] "Uncaught RangeError: Maximum call stack size exceeded.", source: http://localhost:5173/src/hooks/useDialogFocus.ts?t=1791417617263 (14)
[pid=2932][err] [1007/212604.814:INFO:CONSOLE:14] "Uncaught RangeError: Maximum call stack size exceeded.", source: http://localhost:5173/src/hooks/useDialogFocus.ts?t=1791417617263 (14)
[pid=2932][err] [1007/212604.816:INFO:CONSOLE:14] "Uncaught RangeError: Maximum call stack size exceeded.", source: http://localhost:5173/src/hooks/useDialogFocus.ts?t=1791417617263 (14)
[pid=2932][err] [1007/212604.818:INFO:CONSOLE:14] "Uncaught RangeError: Maximum call stack size exceeded.", source: http://localhost:5173/src/hooks/useDialogFocus.ts?t=1791417617263 (14)
[pid=2932][err] [1007/212604.819:INFO:CONSOLE:14] "Uncaught RangeError: Maximum call stack size exceeded.", source: http://localhost:5173/src/hooks/useDialogFocus.ts?t=1791417617263 (14)
[pid=2932][err] [1007/212604.820:INFO:CONSOLE:14] "Uncaught RangeError: Maximum call stack size exceeded.", source: http://localhost:5173/src/hooks/useDialogFocus.ts?t=1791417617263 (14)
[pid=2932][err] [1007/212607.126:INFO:CONSOLE:14] "Uncaught RangeError: Maximum call stack size exceeded.", source: http://localhost:5173/src/hooks/useDialogFocus.ts?t=1791417617263 (14)
[pid=2932][err] [1007/212607.128:INFO:CONSOLE:14] "Uncaught RangeError: Maximum call stack size exceeded.", source: http://localhost:5173/src/hooks/useDialogFocus.ts?t=1791417617263 (14)
[pid=2932][err] [1007/212607.146:INFO:CONSOLE:14] "Uncaught RangeError: Maximum call stack size exceeded.", source: http://localhost:5173/src/hooks/useDialogFocus.ts?t=1791417617263 (14)
[pid=2932][err] [1007/212607.147:INFO:CONSOLE:14] "Uncaught RangeError: Maximum call stack size exceeded.", source: http://localhost:5173/src/hooks/useDialogFocus.ts?t=1791417617263 (14)
[pid=2932][err] [1007/212607.147:INFO:CONSOLE:14] "Uncaught RangeError: Maximum call stack size exceeded.", source: http://localhost:5173/src/hooks/useDialogFocus.ts?t=1791417617263 (14)
[pid=2932][err] [1007/212607.148:INFO:CONSOLE:14] "Uncaught RangeError: Maximum call stack size exceeded.", source: http://localhost:5173/src/hooks/useDialogFocus.ts?t=1791417617263 (14)
[pid=2932][err] [1007/212610.873:INFO:CONSOLE:934] "[vite] connecting...", source: http://localhost:5173/@vite/client (934)
[pid=2932][err] [1007/212610.922:INFO:CONSOLE:1047] "[vite] connected.", source: http://localhost:5173/@vite/client (1047)
[pid=2932][err] [1007/212611.192:INFO:CONSOLE:15805] "%cDownload the React DevTools for a better development experience: https://react.dev/link/react-devtools font-weight:bold", source: http://localhost:5173/node_modules/.vite/deps/react-dom_client.js?v=416a5cf7 (15805)
[pid=2932][err] [1007/212611.273:INFO:CONSOLE:2458] "%c[MSW] Mocking enabled. color:orangered;font-weight:bold;", source: http://localhost:5173/node_modules/.vite/deps/msw_browser.js?v=416a5cf7 (2458)
[pid=2932][err] [1007/212611.274:INFO:CONSOLE:2459] "%cDocumentation: %chttps://mswjs.io/docs font-weight:bold font-weight:normal", source: http://localhost:5173/node_modules/.vite/deps/msw_browser.js?v=416a5cf7 (2459)
[pid=2932][err] [1007/212611.274:INFO:CONSOLE:2460] "Found an issue? https://github.com/mswjs/msw/issues", source: http://localhost:5173/node_modules/.vite/deps/msw_browser.js?v=416a5cf7 (2460)
[pid=2932][err] [1007/212611.274:INFO:CONSOLE:2461] "Worker script URL: http://localhost:5173/mockServiceWorker.js", source: http://localhost:5173/node_modules/.vite/deps/msw_browser.js?v=416a5cf7 (2461)
[pid=2932][err] [1007/212611.274:INFO:CONSOLE:2462] "Worker scope: http://localhost:5173/", source: http://localhost:5173/node_modules/.vite/deps/msw_browser.js?v=416a5cf7 (2462)
[pid=2932][err] [1007/212611.274:INFO:CONSOLE:2463] "Client ID: %s (%s) 39282956-4b5d-4cd8-a6f6-29053c786ed1 top-level", source: http://localhost:5173/node_modules/.vite/deps/msw_browser.js?v=416a5cf7 (2463)
[pid=2932][err] [1007/212611.274:INFO:CONSOLE:2464] "console.groupEnd", source: http://localhost:5173/node_modules/.vite/deps/msw_browser.js?v=416a5cf7 (2464)
[pid=2932][err] [1007/212615.449:ERROR:content\browser\network_service_instance_impl.cc:652] Network service crashed or was terminated, restarting service.
[pid=2932][err] [1007/212615.925:INFO:CONSOLE:1082] "[vite] server connection lost. Polling for restart...", source: http://localhost:5173/@vite/client (1082)
[pid=2932][err] [1007/212617.026:INFO:CONSOLE:934] "[vite] connecting...", source: http://localhost:5173/@vite/client (934)
[pid=2932][err] [1007/212617.056:INFO:CONSOLE:1047] "[vite] connected.", source: http://localhost:5173/@vite/client (1047)
[pid=2932][err] [1007/212617.116:INFO:CONSOLE:15805] "%cDownload the React DevTools for a better development experience: https://react.dev/link/react-devtools font-weight:bold", source: http://localhost:5173/node_modules/.vite/deps/react-dom_client.js?v=416a5cf7 (15805)
[pid=2932][err] [1007/212617.129:INFO:CONSOLE:2458] "%c[MSW] Mocking enabled. color:orangered;font-weight:bold;", source: http://localhost:5173/node_modules/.vite/deps/msw_browser.js?v=416a5cf7 (2458)
[pid=2932][err] [1007/212617.129:INFO:CONSOLE:2459] "%cDocumentation: %chttps://mswjs.io/docs font-weight:bold font-weight:normal", source: http://localhost:5173/node_modules/.vite/deps/msw_browser.js?v=416a5cf7 (2459)
[pid=2932][err] [1007/212617.130:INFO:CONSOLE:2460] "Found an issue? https://github.com/mswjs/msw/issues", source: http://localhost:5173/node_modules/.vite/deps/msw_browser.js?v=416a5cf7 (2460)
[pid=2932][err] [1007/212617.130:INFO:CONSOLE:2461] "Worker script URL: http://localhost:5173/mockServiceWorker.js", source: http://localhost:5173/node_modules/.vite/deps/msw_browser.js?v=416a5cf7 (2461)
[pid=2932][err] [1007/212617.130:INFO:CONSOLE:2462] "Worker scope: http://localhost:5173/", source: http://localhost:5173/node_modules/.vite/deps/msw_browser.js?v=416a5cf7 (2462)
[pid=2932][err] [1007/212617.130:INFO:CONSOLE:2463] "Client ID: %s (%s) c05b2f92-7fc8-4e7e-9119-e278119db1fd top-level", source: http://localhost:5173/node_modules/.vite/deps/msw_browser.js?v=416a5cf7 (2463)
[pid=2932][err] [1007/212617.130:INFO:CONSOLE:2464] "console.groupEnd", source: http://localhost:5173/node_modules/.vite/deps/msw_browser.js?v=416a5cf7 (2464)
[pid=2932][err] [1007/212620.495:ERROR:content\browser\gpu\gpu_process_host.cc:1044] GPU process exited unexpectedly: exit_code=-1073741510
[pid=2932][err] [1007/212620.495:WARNING:content\browser\gpu\gpu_process_host.cc:1503] The GPU process has crashed 1 time(s)
```