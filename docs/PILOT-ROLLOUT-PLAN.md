# Cobie pilot and master-series rollout plan

## Goal

Use Cobie Classroom Companion as the master implementation for a controlled Manchester pilot of up to 50 schools. Future Cobie books should reuse the same content, accessibility, privacy and observation patterns while keeping each book's story-specific activities separate.

## Release gates

1. **Technical staging**
   - Apply `migrations/20260929_pilot_database_baseline.sql` in a disposable DatabasePad test project first, then production after review.
   - Verify the account tables, tracker tables, observation RPC, row-level isolation, old-record display and new scale version.
   - Configure Vercel server variables, Stripe test mode and a dedicated auth email sender; run signup, confirmation email, password reset, checkout, access refresh, sign-out/in and cancellation with test accounts.
   - Set the privacy notice date to the actual deployment date.

2. **School-readiness review**
   - Confirm hosting location, subprocessors, retention, backup and deletion procedures with the school or responsible organisation.
   - Confirm the published privacy contact is monitored.
   - Test printing, sign-in recovery, keyboard access and the lesson player on school devices and networks.
   - Treat pupil codes as potentially personal data; do not enter real names or other identifiers during the pilot unless the school's approved process permits it.

3. **Small pilot**
   - Start with 5–10 Manchester schools and named teacher contacts.
   - Collect structured feedback on lesson clarity, observation workflow, accessibility, printing and support burden.
   - Review incidents and requests before adding schools.

4. **Manchester expansion**
   - Expand to 50 schools only after the small-pilot gate passes and open defects have owners and dates.
   - Keep a release log, support route and rollback plan for each production change.

5. **US adaptation**
   - After UK pilot evidence, create a US-specific review for curriculum language, privacy/contract terms, hosting, support and billing. Do not copy UK compliance or curriculum claims into the US release.

## Product rule

**Book = what happens to Cobie. App = activities inspired by what happens to Cobie.** Keep story events and app activities clearly labelled so later books can follow the same boundary.

## Current blockers

- The live DatabasePad pilot baseline migration has not been applied or verified.
- Dedicated auth email sending is not yet pilot-ready. Supabase's default sender hit the account email rate limit during signup testing; configure custom SMTP or an approved equivalent before inviting schools.
- The full disposable-account journey still needs verified testing after the pilot database baseline and dedicated sender are in place: signup, confirmation email, password reset, checkout, access refresh, sign-out/in, cancellation, cross-account database isolation and pupil-record deletion.
