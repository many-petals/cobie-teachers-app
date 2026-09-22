# Cobie pilot and master-series rollout plan

## Goal

Use Cobie Classroom Companion as the master implementation for a controlled Manchester pilot of up to 50 schools. Future Cobie books should reuse the same content, accessibility, privacy and observation patterns while keeping each book's story-specific activities separate.

## Release gates

1. **Technical staging**
   - Install and apply `migrations/20260916_observation_scale.sql` in a disposable DatabasePad test project.
   - Verify the observation RPC, row-level isolation, old-record display and new scale version.
   - Configure Vercel server variables and Stripe test mode; run signup, checkout, access refresh, sign-out/in and cancellation with test accounts.
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

- The live DatabasePad migration has not been applied or verified.
- Vercel server environment variables and Stripe test-mode settings have not been configured.
- No real checkout, cancellation, auth-account mutation or pupil-record mutation has been performed in this review.
