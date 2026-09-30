# MANC50 Project 1 release gate

Last audited: 30 September 2026

Broad acquisition is **not approved** until every required gate below is proven in the live system and the small-school validation is complete.

| Gate | Current evidence | Status | Required proof before rollout |
| --- | --- | --- | --- |
| £5 payment | Live Stripe checkout and paid test records exist. The safer account-bound checkout is committed in `7146b7c`. | In progress | Deploy backend functions and app; complete a fresh end-to-end payment test or a controlled equivalent without creating an unfulfilled charge. |
| Entitlement creation | Five live entitlements exist; webhook signature verification and idempotency are implemented. | In progress | Prove one new reserved checkout converts exactly once, including webhook replay. |
| Account-bound activation | Live database account-binding migration and release-controls migration applied. Release controls passed 9/9 checks. | In progress | Deploy the updated activation function; activate with the confirmed lead-teacher account; verify account binding in SQL. |
| Access enforcement | Billing API grants pilot access only to the matching signed-in user and an unexpired activated entitlement. Offline tests pass. | In progress | Verify allowed access, refresh, sign-out denial, second-account denial and sign-in restoration in production. |
| 50-school cap | Database now reserves capacity before payment under an advisory lock and counts paid plus active reservations. Live database checks show 5 paid, 0 reservations, no cap breach. | In progress | Deploy checkout/webhook functions; exercise reservation, expiry/retry and friendly full-cap response without charging a 51st school. |
| Eligibility and SEND priority | The checkout UI and server migration require a UK setting postcode, an allowed setting type and explicit confirmation that the setting serves ages 3-7. Special-school and SEND-provision declarations are retained for support and evaluation prioritisation. | In progress | Apply and verify `20260930_manc50_eligibility.sql`; deploy checkout; prove ineligible/malformed requests are rejected server-side and one eligible SEND-first test purchase retains the expected fields. |
| Analytics and active use | `activated`, one-time `first_value` and per-lesson/day `qualifying_use` events are implemented; service-only metrics include seven-day active schools. | In progress | Deploy, complete a lesson, verify one first-value event, a qualifying-use event, idempotency and live metrics. |
| Security | RLS and account ownership checks are active. Reservation data is inaccessible to browser roles; release-control functions are service-role only. | In progress | Re-run the full security verification after all migrations/functions deploy; test cross-account denial and malformed/unsigned webhook requests. |
| Privacy | Notice distinguishes pseudonymisation, school approval and provider uncertainty. Contact is aligned to the published `info@manypetals.co.uk`. | In progress | Confirm the mailbox is monitored; document hosting location, subprocessors, DPA, retention, backup/restore and account-deletion operations before real pupil data. |
| Accessibility | MANC50 inputs, buttons, rating controls and feedback form have explicit accessible labels/roles in the pending build. | In progress | Run keyboard-only and screen-reader checks on buy, auth, activation, feedback and one lesson; test mobile/tablet zoom and contrast. |
| Fulfilment and recovery | New purchases are tied to the verified account; sign-in recovers paid access without relying on a browser-stored raw token. Legacy tokens remain supported. | In progress | Prove success redirect, delayed/replayed webhook, same-account recovery, legacy-token recovery and a documented support fallback. |
| Feedback | Structured first-use, week-two and end-of-pilot feedback is implemented locally and bound to the entitlement. | In progress | Apply feedback migration, deploy function/page, submit/read a live test response, then collect responses from 3–5 pilot schools. |
| Email recovery | Password-reset UI exists. Live Supabase audit shows custom SMTP is disabled. | Blocked for rollout | Configure a dedicated sender, then prove signup confirmation and password reset delivery across at least two school email systems. |
| Real-school validation | Priority workbook contains 140 targets within 10 miles of M16 0JQ, with all 993 eligible Greater Manchester settings retained. | Not started | Validate with 3–5 real schools; log device/network, printing, SEND fit, lesson clarity, support burden, incidents and fixes. |

## Automated evidence

- `npm test`: 42/42 passing after release-control, eligibility, analytics, feedback, privacy-contact and accessibility changes.
- `npx tsc --noEmit`: passing after the same changes.
- `npm run build`: 72 static routes exported successfully, including `/manc50-feedback`.
- Live release-controls SQL verification: 9 checks, 9 pass, 0 fail.

Automated checks support the gate but do not replace live payment, email, assistive-technology, school-device or real-school evidence.
