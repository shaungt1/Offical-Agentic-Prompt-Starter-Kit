# QA Code Review — Frontend Testing Instructions

| Field | Value |
|---|---|
| Document | Frontend QA Code Review Instructions |
| Version | 1.0.0 |
| Parent | `qa-code-review.skill.md` |
| Scope | Browser UI, client applications, frontend integrations, realtime browser behavior |
| Status | Active |

## Purpose

This document tells the reviewer what to inspect and test when the main QA analysis identifies frontend behavior. It is not a requirement to use Playwright for every frontend change. The correct test depends on what the backtrace proves is changing: a pure formatter may need deterministic unit tests; a component may need DOM/component testing; routing or authentication may require a real browser; a WebSocket defect may require frame and reconnection inspection; and a visual implementation may require direct comparison with the design or screenshot the user supplied.

A frontend review has to prove two things at the same time:

1. the code behaves correctly as software; and
2. the user-visible product behaves the way the specification and user expect.

Testing implementation internals while ignoring the actual user experience is not sufficient.

The primary references for this instruction are [Playwright](https://playwright.dev/docs/intro), [Testing Library](https://testing-library.com/docs/), [OWASP](https://owasp.org/), and browser/platform standards where the behavior depends on the web platform.

## 1. Start From the Backtrace, Not the Browser

Before opening a browser, use the main QA code analysis to identify the complete frontend flow.

Determine:

- which pages, components, hooks, stores, routes, and styles changed;
- which user actions reach those changes;
- which client state is read or written;
- which callbacks or events fire;
- which HTTP APIs, WebSockets, SSE streams, workers, or browser APIs are used;
- which routes the application navigates to;
- which feature flags and configuration alter behavior;
- which loading, empty, error, offline, and unauthorized states exist;
- which CSS/layout/design-system rules control visible output;
- which accessibility semantics should be present;
- which backend contracts the frontend assumes.

Write the flow before designing the test.

Example:

```text
User clicks "Analyze"
      |
      v
onClick handler
      |
      v
local pending=true
      |
      v
POST /api/documents/{id}/analyze
      |
      +---- 202 -> subscribe to processing status
      |
      +---- 4xx -> render validation/authorization error
      |
      +---- 5xx -> render recoverable error
      |
      v
WebSocket status=completed
      |
      v
invalidate/reload document query
      |
      v
render extracted result
```

This backtrace immediately shows why “the button clicks” is not enough. The review needs evidence for duplicate submission, request shape, pending state, failure states, socket lifecycle, invalidation, and final rendering.

### Completion condition

The reviewer can narrate the frontend behavior from user action through client logic and external dependencies to the final visible state.

## 2. Select Evidence Based on the Changed Behavior

The table below is a test-selection guide. It exists to prevent the reviewer from choosing a tool by habit. Use only the rows that match the changed behavior.

| Change type | Minimum useful evidence | Typical tool or method |
|---|---|---|
| Pure utility, reducer, selector | deterministic valid/invalid/boundary tests | existing unit framework |
| Component rendering/state | DOM/component behavior using user-visible queries/events | Testing Library or framework utilities |
| API-integrated component | success/error/slow responses and resulting state | component harness, Playwright, MSW |
| Navigation/authentication flow | real browser navigation/session assertions | Playwright or equivalent |
| WebSocket/SSE/realtime | connection, frames/events, disconnect, reconnect, cleanup | browser/network harness, Playwright |
| Visual implementation | rendered product compared with supplied specification/baseline | visual inspection, screenshot comparison |
| Responsive behavior | key flows across required viewport/device matrix | Playwright projects/emulation plus real target where needed |
| Accessibility | semantic queries, automated scan, keyboard/manual validation | Testing Library, axe-core, browser tooling |
| Performance-sensitive change | measured runtime behavior against project budget | Lighthouse, DevTools, RUM/staging metrics |

Testing Library's guiding principle is that tests should resemble the way software is used. Its recommended query priority favors semantic roles and labels over implementation-specific selectors. References:
- https://testing-library.com/docs/guiding-principles/
- https://testing-library.com/docs/queries/about/

### Completion condition

The reviewer has selected the smallest set of frontend test methods that can actually prove the stated frontend claims.

## 3. Verify Build, Type, and Static Correctness

Before complex browser testing, run the project's existing frontend verification commands.

Check for:

- compile/build failures;
- TypeScript or other type errors;
- lint findings that represent correctness/security problems;
- broken imports;
- unresolved dependencies;
- invalid route/module configuration;
- dead or unreachable code introduced by the change;
- missing environment variables;
- framework configuration errors;
- dependency version conflicts.

Do not invent a formatting or style gate that the project does not have. A valid implementation does not become defective because the reviewer prefers another formatting rule.

A successful build removes one class of defect. It does not prove browser or user behavior.

## 4. Review Component and State Logic

Backtrace every changed state value.

For each state variable, hook, store, query cache, signal, context value, or state machine determine:

- initial state;
- who initializes it;
- who mutates it;
- what events cause changes;
- whether async operations can complete out of order;
- whether stale state can be read;
- whether cleanup occurs during unmount or route changes;
- whether multiple components can mutate the same state;
- whether state should persist across navigation or refresh;
- how failed operations affect state;
- how optimistic state is rolled back;
- whether cached state is invalidated.

### State defects the reviewer should actively look for

This list is not merely a checklist; each item represents a common class of user-visible or timing-dependent bug that can be found only by tracing state transitions.

- pending/loading flag never resets after failure;
- older request overwrites newer data;
- stale closure captures an old value;
- callback or listener is registered more than once;
- component unmount leaves a timer, socket, observer, or subscription active;
- optimistic update is never rolled back;
- query cache is not invalidated after a mutation;
- async callback updates state after the component is no longer valid;
- form state resets unexpectedly;
- state is initialized from props but never follows later prop changes;
- route state and local state diverge;
- selector equality or memoization returns stale data;
- client cache exposes prior-user state after logout or account switch.

When the defect depends on timing, lifecycle, or browser behavior, a component or browser test is usually stronger evidence than a purely static argument.

## 5. Test Asynchronous Loading and Race Conditions

Modern frontend behavior is asynchronous. The reviewer must deliberately test more than the fast happy path.

Where applicable, test:

- immediate success;
- slow success;
- error response;
- timeout or aborted request;
- two rapid submissions;
- request A followed by request B where B completes first;
- route change while a request is pending;
- component unmount during async work;
- cancellation;
- retry;
- background revalidation;
- reconnect after network loss.

Avoid hard-coded sleeps as the primary synchronization mechanism. Playwright provides auto-waiting and auto-retrying web assertions; tests should wait on the product's observable state instead of assuming a fixed delay.

References:
- https://playwright.dev/docs/actionability
- https://playwright.dev/docs/test-assertions

Example:

```ts
await page.getByRole('button', { name: 'Analyze' }).click();
await expect(page.getByRole('status')).toHaveText(/processing/i);
await expect(page.getByRole('heading', { name: 'Results' })).toBeVisible();
```

The example is useful because the assertions synchronize with actual user-visible behavior instead of “sleeping” until the reviewer hopes the system is ready.

## 6. Verify Event and Callback Handling

Trace every changed event registration and callback.

Common sources include:

- click;
- submit;
- change or input;
- keydown and shortcuts;
- focus/blur;
- pointer/touch;
- resize/scroll;
- visibility;
- message/postMessage;
- custom event buses;
- MutationObserver/IntersectionObserver/ResizeObserver;
- timers and intervals;
- WebSocket events.

For each event path, determine:

- when it is registered;
- whether it is registered exactly once when required;
- what data it closes over;
- whether it can execute after the associated component or state is obsolete;
- when and how it is removed;
- whether rejected promises are handled;
- whether it can trigger a duplicate side effect;
- whether disabled or unauthorized state truly prevents the action.

A common regression is duplicate callback registration after a rerender or reconnect. Test the count or the actual downstream effect. Do not accept “something happened” as proof that it happened exactly once.

## 7. Verify API Interaction

Backtrace every changed frontend request against the backend contract.

Verify:

- HTTP method;
- URL;
- path parameters;
- query parameters;
- request body;
- content type;
- auth/session headers;
- status handling;
- response schema;
- error schema;
- cancellation;
- retry;
- duplicate submission;
- idempotency assumptions;
- timeout behavior.

Playwright can monitor, intercept, mock, and modify network traffic:
- https://playwright.dev/docs/network
- https://playwright.dev/docs/mock

Use mocking when the purpose is to deterministically force a frontend state. Use the real service when the purpose is to prove the frontend/backend contract. One does not replace the other.

### API response matrix

The matrix below describes the kinds of response paths that should be tested when they are reachable in the changed feature.

| Backend condition | Frontend behavior to prove |
|---|---|
| 200/201 success | correct data renders and pending state ends |
| 202 accepted | UI enters correct asynchronous state and follows status flow |
| 400/422 validation | user receives actionable validation and UI does not falsely succeed |
| 401/403 | auth/permission behavior is correct and protected information is not exposed |
| 404 | missing/not-found state is correct |
| 409 | conflict or duplicate behavior is safe and understandable |
| 429 | rate-limit/retry messaging and behavior are correct |
| 500/503 | error/fallback/retry state appears; UI does not remain in a permanent spinner |

## 8. Verify WebSockets, SSE, and Realtime Behavior

Realtime behavior needs dedicated testing because ordinary request/response tests do not exercise the connection lifecycle.

For WebSockets, trace and test:

- URL and protocol;
- authentication;
- connection open;
- subscription request;
- expected incoming frame;
- outgoing frame when applicable;
- malformed or unknown message;
- duplicate message;
- out-of-order message;
- server close;
- network loss;
- reconnect;
- resubscription;
- old socket cleanup;
- old listener cleanup;
- duplicate subscription;
- UI state after reconnect;
- route change and unmount cleanup.

Playwright exposes WebSocket objects and frame events:
- https://playwright.dev/docs/api/class-websocket
- https://playwright.dev/docs/network
- https://playwright.dev/docs/mock

Example diagnostic pattern:

```ts
page.on('websocket', ws => {
  console.log(`socket: ${ws.url()}`);
  ws.on('framesent', event => console.log('sent', event.payload));
  ws.on('framereceived', event => console.log('received', event.payload));
  ws.on('close', () => console.log('closed'));
});
```

Use diagnostics as evidence during investigation; do not leave noisy logs in permanent test code unless they serve an intentional reporting purpose.

For SSE or streamed fetch responses, test partial chunks, completion, interruption, retry/reconnect behavior, malformed data, and the UI state when the stream terminates unexpectedly.

## 9. Verify Forms and Validation

For each changed form, backtrace the value from user input to the outgoing request.

Test the relevant combinations of:

- required fields;
- optional fields;
- invalid formats;
- boundary lengths;
- min/max values;
- pasted values;
- leading/trailing whitespace;
- Unicode;
- emoji when relevant;
- empty strings;
- invalid server response;
- server-side field errors;
- duplicate submit;
- keyboard submit;
- disabled state;
- accessible labels and descriptions;
- state preservation after failed submit;
- reset after successful submit.

Client-side validation is user experience, not a security boundary. The backend must still validate untrusted input.

Use label and role queries where possible because they exercise both user interaction and accessible semantics.

## 10. Verify Authentication and Authorization UX

Trace how authentication state enters the frontend and how it changes.

Test, when applicable:

- anonymous user;
- authenticated user;
- expired session;
- token/session refresh;
- unauthorized route;
- insufficient role/permission;
- role or account change;
- sign-out;
- browser refresh;
- direct deep link;
- multiple tabs when relevant;
- loading state while auth is resolving;
- sensitive state cleanup after logout.

Hiding a button is not authorization. Backend tests must prove the actual permission boundary. Frontend tests prove the expected UX and that protected information/actions are not improperly surfaced.

## 11. Verify Routing and Navigation

Backtrace changed routes and navigation logic.

Test:

- direct URL/deep link;
- browser back and forward;
- query parameters;
- path parameters;
- redirects;
- invalid identifier;
- missing identifier;
- unsaved-change behavior;
- refresh;
- auth guards;
- 404/not-found;
- nested layout;
- state persistence across route transitions.

If route state and component state both represent the same concept, explicitly test that they stay synchronized.

## 12. Verify Loading, Empty, Error, and Offline States

A data-driven page is not complete because its loaded-with-data screenshot looks correct.

For every meaningful flow, determine which of the following states are valid:

```text
initial
loading
loaded with data
loaded with empty data
stale/revalidating
recoverable error
non-recoverable error
unauthorized
not found
offline/disconnected
```

Drive the UI into the applicable states and verify the user can understand what happened and, when appropriate, recover.

## 13. Verify Visual Conformance to the User's Specification

When a user supplies a design, Figma reference, screenshot, design-system component, existing page, or written visual requirement, the reviewer must compare the implementation against that reference.

Inspect:

- hierarchy;
- spacing;
- alignment;
- sizing;
- typography;
- color/tokens;
- component variants;
- hover/focus/active/disabled states;
- overflow and clipping;
- long content;
- empty content;
- images and aspect ratios;
- icons;
- responsive reflow;
- dark/light theme when supported.

Visual snapshot testing is useful for regression detection, but rendering can vary by OS, browser, fonts, hardware, and environment. Playwright documents the need for a stable environment when using screenshots:
https://playwright.dev/docs/test-snapshots

Do not approve a visual requirement solely because DOM assertions pass.

## 14. Verify Responsiveness and Supported Browsers

Determine the actual support matrix from project instructions or user requirements.

Do not invent “mobile/tablet/desktop” as a complete matrix when the product targets specific devices or resolutions.

At minimum, consider:

- narrow/mobile viewport;
- primary desktop viewport;
- required tablet/kiosk/device dimensions;
- landscape/portrait when relevant;
- content expansion;
- long strings/localization;
- zoom/text scaling;
- touch versus pointer behavior;
- browser-specific APIs.

Playwright Test supports projects and device emulation. Emulation is useful but not always equivalent to real hardware. Use real-device validation when the requirement depends on device-specific behavior.

## 15. Verify Accessibility

Accessibility is part of functional correctness for supported users.

Use multiple layers:

1. semantic markup and accessible names;
2. keyboard navigation;
3. focus order and visible focus;
4. form labels and error association;
5. dialog/modal focus management;
6. screen-reader semantics when material;
7. automated scanning;
8. targeted manual checks.

Playwright documents using `@axe-core/playwright` and explicitly notes that automated scans cannot find every accessibility issue:
https://playwright.dev/docs/accessibility-testing

Testing Library's role and label queries help align tests with the accessibility tree:
https://testing-library.com/docs/queries/about/

Do not claim “accessible” solely because an automated scanner returns zero violations.

## 16. Verify Client-Side Security-Relevant Behavior

Frontend review does not replace backend security, but browser code can introduce security problems.

Review changed paths for:

- unsafe HTML injection and XSS;
- unsafe URL construction;
- open redirects;
- secrets embedded in bundles;
- sensitive information stored in localStorage/sessionStorage;
- unsafe `postMessage` origin checks;
- CSRF assumptions;
- role/permission UI leakage;
- exposed debug/admin functions;
- unsafe dependency changes;
- third-party scripts;
- sensitive logs.

Use the [OWASP Code Review Guide](https://owasp.org/www-project-code-review-guide/) when the backtrace reaches a security-sensitive path.

## 17. Verify Performance When the Change Can Affect It

Do not run performance tooling by reflex. Run it when the changed code can affect startup, rendering, network volume, media processing, large lists, animation, or interaction responsiveness.

Depending on the product, examine:

- bundle/chunk size;
- render count;
- long tasks;
- duplicate network requests;
- refetch loops;
- duplicate realtime traffic;
- large images/assets;
- layout shift;
- interaction latency;
- Core Web Vitals;
- project-specific frontend budgets.

Use established project budgets when they exist. Do not invent universal thresholds and present them as company requirements.

## 18. Test Data and Mocking Rules

Mocks are tools for controlled conditions. They are not proof that a real integration works.

Use mocks to:

- force an error;
- force slow response;
- force rare state;
- isolate component behavior;
- remove an unstable external dependency from a deterministic test.

Use real integration environments to prove:

- request/response compatibility;
- real authentication/session behavior;
- WebSocket protocol behavior;
- backend error schema;
- environment-specific network configuration.

If a review uses only mocks for an integration-sensitive change, state that limitation in the final report.

## 19. Flakiness and Retry Rules

Do not hide a broken or timing-dependent test by enabling retries and declaring success.

Playwright classifies a test that fails initially but passes on retry as flaky:
https://playwright.dev/docs/test-retries

If a test is flaky, investigate:

- asynchronous synchronization;
- shared state;
- data collisions;
- environment instability;
- selector brittleness;
- race conditions in the product;
- network/realtime lifecycle.

A flaky test is evidence of instability until its cause is understood.

## 20. Frontend Finding Classification

### Critical frontend examples

A frontend finding is Critical when evidence shows that the changed implementation makes a required user flow unsafe, incorrect, or unusable.

Examples include:

- primary workflow cannot complete;
- frontend sends incorrect data that creates a breaking backend effect;
- protected or sensitive data becomes visible to the wrong user;
- duplicate event/callback causes a duplicate destructive operation;
- realtime reconnect permanently corrupts the UI or performs duplicate actions;
- supported-device layout makes a required workflow unusable;
- auth state incorrectly permits a protected action to be initiated;
- a release requirement explicitly includes accessibility and the changed flow becomes inaccessible.

### Corrective frontend examples

Examples include:

- recoverable error state is incomplete;
- meaningful race condition lacks regression coverage but current runtime path remains usable;
- unnecessary duplicate request creates reliability risk but no current breaking effect;
- stale cache can show outdated information temporarily;
- focus behavior is weak but does not block the stated release requirement.

### Optimization frontend examples

Examples include:

- unnecessary rerenders;
- bundle reduction;
- improved cache strategy;
- refactor that improves clarity;
- optional visual-regression expansion;
- reduced network chatter.

## 21. Required Evidence in the Final Frontend Review

The final QA report should state, when applicable:

- browsers and viewport/device sizes tested;
- real versus mocked dependencies;
- test account/role used without exposing secrets;
- screenshots, traces, video, or DOM evidence;
- API request/response results;
- WebSocket/SSE evidence;
- accessibility automated and manual checks;
- async and race-condition checks;
- visual comparison reference;
- performance result;
- blocked tests and limitations.

## Worked Example — Realtime Dashboard Review

Suppose the changed files are:

```text
Dashboard.tsx
useRealtimeMetrics.ts
metrics-api.ts
```

The first frontend backtrace should produce something like:

```text
page load
 -> REST initial snapshot
 -> WebSocket subscription
 -> message parsing
 -> state merge
 -> chart render
```

A robust review then proves:

1. initial snapshot renders;
2. socket connects to the expected endpoint;
3. a valid frame updates the correct metric;
4. duplicate frame does not duplicate data when the protocol requires idempotency;
5. malformed frame does not crash the page;
6. disconnect produces the expected state;
7. reconnect resubscribes exactly once;
8. old socket/listener is cleaned up;
9. navigation away stops updates;
10. chart remains usable at supported viewport sizes.

That is a frontend QA review. “Playwright passed” is only a tool result; the engineering evidence is the behavior that was actually proven.

## Sources

The sources below are maintained outside this QA framework and should be consulted when the review reaches the corresponding behavior.

- Playwright Locators: https://playwright.dev/docs/locators
- Playwright Assertions: https://playwright.dev/docs/test-assertions
- Playwright Auto-Waiting/Actionability: https://playwright.dev/docs/actionability
- Playwright Network: https://playwright.dev/docs/network
- Playwright API and WebSocket Mocking: https://playwright.dev/docs/mock
- Playwright WebSocket API: https://playwright.dev/docs/api/class-websocket
- Playwright Accessibility Testing: https://playwright.dev/docs/accessibility-testing
- Playwright Visual Comparisons: https://playwright.dev/docs/test-snapshots
- Playwright Retries and Flakiness: https://playwright.dev/docs/test-retries
- Testing Library Guiding Principles: https://testing-library.com/docs/guiding-principles/
- Testing Library Query Priority: https://testing-library.com/docs/queries/about/
- OWASP Code Review Guide: https://owasp.org/www-project-code-review-guide/
