# Cobie rollout fixes — 20 September 2026

## Correction pass status

The approved correction pass is implemented in this working copy and has passed TypeScript, observation-scale tests, diff checks and the Expo web export. The source preserves the existing lesson/resource data, internal tracker table names and working flows.

The privacy-policy date is set to 29 September 2026 for the current production deployment.

The pilot database baseline is prepared at `migrations/20260929_pilot_database_baseline.sql`. It includes the account/profile tables, tracker tables, row-level policies and observation RPC needed for the current app. It has not been applied to the live DatabasePad service in this environment. Do not invite pilot schools until the baseline has been applied and verified with disposable teacher accounts.

## Implemented

- Lesson cards and direct player URLs use the same `lesson.access` rule. Lesson 1 is the free player; all eight outlines can be expanded.
- Upgrade and pricing lesson counts come from `LESSONS.length`.
- All teacher purchase links lead to one signed-in upgrade flow.
- `/api/billing` verifies the teacher token with the existing auth service. Browser-provided prices, customer IDs, entitlement flags and success query strings do not grant access.
- A Stripe customer is bound to the teacher through server-managed auth `app_metadata`, with separate test/live mappings. Customer ownership is checked again before status, checkout or portal requests.
- Stripe is queried directly for the current subscription; only this app's configured price in `active` or `trialing` state grants access. No webhook-maintained entitlement table is used. Access refreshes at sign-in, on return from billing, window focus and every five minutes while visible. Provider errors close paid access and offer retry.
- Checkout reuses an open session and uses Stripe idempotency keys. Existing live/delinquent subscriptions are sent to billing management. Previous subscribers do not receive a second trial.
- The two existing pilot emails are recognised only after server authentication and email confirmation.
- Privacy wording now distinguishes pupil codes from anonymity, removes unverified infrastructure/compliance assurances, describes Stripe billing data, and distinguishes app-record deletion from auth-account deletion and cancellation.

## Activation required before deployment

On 29 September 2026, the Vercel project showed the required production environment variable names for server billing/API access. No credential values were revealed, copied, or added during this check.

Keep these **server-only** variables configured in Vercel. Never prefix a secret with `EXPO_PUBLIC_`, commit it, or paste it into chat:

| Variable | Value/source |
| --- | --- |
| `APP_URL` | `https://cobie-teachers-app.vercel.app` for production; the exact preview origin in an isolated test deployment |
| `SUPABASE_URL` | The existing app's DatabasePad auth/database base URL; must match the client configuration |
| `SUPABASE_ANON_KEY` | Existing app's public auth API key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server credential for that same service, authorised to update auth app metadata |
| `STRIPE_SECRET_KEY` | Stripe secret/restricted server key with customers read/write, subscriptions read, Checkout Sessions read/write and billing portal sessions write permissions |
| `STRIPE_PRICE_ID` | The approved recurring Teacher plan price from the same Stripe account and mode; check that it matches the advertised £2.99/month |

Confirm that DatabasePad supports the standard authenticated `/auth/v1/user` endpoint and admin `PUT /auth/v1/admin/users/:id` with app-metadata updates. Its hosting/administrative capabilities have not been assumed verified. If it does not support them, use its supported server-side storage/API for the customer mapping before activation.

Configure the Stripe customer portal to allow billing updates and cancellation. Test in a separate non-production environment first. Existing customers who bought through the old payment link need a verified one-time customer mapping and subscription metadata migration; do not match a customer from an unverified browser email or create a second subscription for them.

No real checkout, payment, cancellation, auth-account mutation or pupil-record mutation was performed in this review.


## Live public checks on 29 September 2026

Checked on `https://teachers.manypetals.co.uk/` after production deployment `f75e0b0`:

- Printables now shows `5 resource types` and five printable-type filters: Worksheets, Posters, Cards, Checklists and Scripts.
- Lessons shows `8 core lessons` and lists eight lesson cards.
- The Cobie card is marked live and shows `Buy Cobie book`.
- The Parents navigation item is visible and opens the parent communication area with four teacher templates.

Account-only checks are still blocked until the live database baseline is applied and verified and a dedicated auth email sender is configured.

## Verification

- `node --test tests/billing.test.mjs`: offline request-level billing tests covering auth, account ownership, paid/trial/unpaid/cancelled states, duplicate subscriptions, trial eligibility, provider failures and portal ownership.
- `npx tsc --noEmit`: TypeScript check.
- `npm run build`: Expo production web export.
- Browser: free Lesson 1 player, locked Lesson 5 direct URL, expandable Lesson 5 outline, eight-lesson upgrade copy, and sign-in gate before checkout.

Still required: apply `migrations/20260929_pilot_database_baseline.sql`, run `migrations/20260929_pilot_database_verify.sql` until every row returns `ok`, configure dedicated auth email sending for the pilot, then run a real test-mode signup → confirmation email → password recovery → checkout → access → sign-out/in → cancellation journey, cross-account database isolation tests using disposable records, printing on school devices, and verified deletion/retention/backup procedures. An automated build does not establish any of these.

The locked dependency installation reported 41 npm audit findings (1 low, 19 moderate, 19 high, 2 critical). These are untriaged dependency findings, not confirmed production exploits. Review dependency paths and deployment exposure separately; no blanket breaking upgrade was applied.

## School data approval

Before real pupil data: confirm hosting location, supplier/subprocessor agreements, database policies, backups, deletion of authentication accounts, retention and any required school impact assessment. Confirm that the published privacy contact addresses are monitored. The revised notice is not a compliance certification.

Sources: [DfE EdTech procurement](https://www.gov.uk/guidance/data-protection-in-schools/procuring-educational-technology-edtech), [ICO pseudonymisation](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/data-sharing/anonymisation/pseudonymisation/), [Stripe Checkout](https://docs.stripe.com/api/checkout/sessions/create), [Stripe subscriptions](https://docs.stripe.com/api/subscriptions/list), [Supabase admin metadata](https://supabase.com/docs/reference/javascript/auth-admin-updateuserbyid).
