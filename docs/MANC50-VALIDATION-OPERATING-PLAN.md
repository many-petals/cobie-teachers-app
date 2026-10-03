# MANC50 validation operating plan

Last updated: 3 October 2026

## Decision rule

MANC50 remains in Project 1 until the release gates in [MANC50-RELEASE-GATE.md](MANC50-RELEASE-GATE.md) have live evidence. No broad acquisition, bulk email or wider use of the 140-school cohort is permitted before then.

Once the gates pass, validate with **three to five** schools that serve children aged 3–7. Start with suitable SEND and specialist settings within practical visiting distance of M16 0JQ. This is a learning cohort, not a scale campaign.

## Why the validation is structured this way

- Use a small cohort and one defined implementation journey. The EEF implementation model separates **explore, prepare, deliver and sustain**, so the pilot should establish fit and readiness before asking schools to embed a new practice. [EEF implementation process](https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/implementation/process)
- Give each school the information its DPO and safeguarding lead need before use. DfE guidance says schools should involve their DPO early, minimise personal data, understand data flows and subprocessors, and agree retention, deletion and breach responsibilities. [DfE EdTech procurement guidance](https://www.gov.uk/guidance/data-protection-in-schools/procuring-educational-technology-edtech)
- Treat Cobie as an EdTech service that may process children’s information. The ICO says the Children’s code can apply to providers where they determine why and how children’s information is processed beyond the school’s instructions. [ICO EdTech guidance](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/the-children-s-code-and-education-technologies-edtech/)

## Phase 0 — release evidence before any invitation

Record each item in the release gate as **Pass**, **Fail** or **Blocked**. A checkbox without evidence is not a pass.

| Gate | Minimum live evidence | Pass condition |
| --- | --- | --- |
| Checkout | Confirmed user selects an approved school, reaches Stripe and a £5 session is created for the canonical URN. | Current account-bound checkout works on a normal school device/network. |
| Payment, entitlement and activation | One controlled payment creates one order, one entitlement and one fulfilment record. The confirmed lead-teacher account activates it. | Webhook replay creates no duplicate records. |
| Access | Access is allowed after activation, restored after sign-in, and denied to a second account. | All four paths are evidenced. |
| Capacity | Reservation, retry/expiry and full-cap response work without an excess charge. | Cap remains at 50 schools. |
| Analytics | Activation, first value and qualifying use appear once where expected; seven-day active-school metric is readable. | Events are attributable to the entitlement without pupil-identifying analytics. |
| Email recovery | Confirmation and password reset arrive at two school email systems. | Custom sender, sender identity and monitored mailbox are proven. |
| Privacy and security | Data-flow, DPA/subprocessor, retention/deletion/backup/incident and school-rights operations are documented. | No real pupil data is used before this evidence exists. |
| Accessibility | Keyboard, screen-reader, mobile/tablet zoom and contrast checks cover buy, auth, activation, feedback and a lesson. | No release-blocking failure remains. |
| Fulfilment | One order/pack, dispatch, delivery, issue/replacement and refund paths are tested. | Refund closes access and fulfilment consistently. |
| Feedback | First-use, week-two and end-of-pilot response paths save and can be reviewed. | The form is accessible and bound to the correct entitlement. |

If a gate fails, stop the invitation flow, record the defect, fix it, then repeat the affected test. Do not work around a failed gate with manual account edits or informal promises to a school.

## Phase 1 — three-to-five-school validation

### School decision map

For each candidate, identify one named lead teacher, a practical senior sponsor, the school’s DPO or privacy route, safeguarding route, and who will receive the physical pack. Do not collect personal contacts or start outreach until approval is explicitly given.

Prioritise in this order:

1. Specialist or SEND-fit setting from the approved nearby 140-school cohort.
2. Clear ages 3–7 fit and a teacher able to test a lesson within seven days.
3. Within practical visiting distance from M16 0JQ.
4. A distinct device/network context, so the cohort reveals different real-world conditions.

The existing 140-school nearby list is the selection source. The 993-setting Greater Manchester master list is retained for later, controlled expansion only.

### Per-school journey

| Stage | School action | MANC50 evidence to capture |
| --- | --- | --- |
| Explore | School reviews the offer, safeguarding/privacy information and suitability. | Reason for fit, decision-maker, privacy questions and decline reason if applicable. |
| Prepare | Lead teacher creates and confirms account; school completes £5 checkout; pack delivery contact is confirmed through the canonical school record. | Conversion date, checkout result, payment/entitlement/activation IDs held only in secure operations data. |
| Deliver | Teacher activates, uses the first lesson and records a short first-use response. | Activation time, first-value event, device/browser/network issue, printing and accessibility observations. |
| Sustain | Teacher uses Cobie again within seven days and gives a short week-two response. | Qualifying use, seven-day activity, support tickets, lesson clarity and SEND-fit feedback. |

## Weekly validation dashboard

Use one row per school and one weekly summary. Keep school operational data separate from pupil information.

| Metric | Definition | Decision use |
| --- | --- | --- |
| Invitation-to-conversation rate | Schools that agree to a discovery conversation divided by schools invited. | Tests message and target fit after release approval. |
| Checkout conversion | Paid, valid checkouts divided by schools that reach checkout. | Identifies purchase friction. |
| Activation rate | Activated entitlements divided by paid orders. | Tests the payment-to-first-access hand-off. |
| Time to first value | Time from payment to first-value event. | Identifies onboarding friction. |
| Seven-day active-school rate | Activated schools with qualifying use in seven days divided by activated schools eligible for the measurement window. | Tests early sustained use. |
| Support burden | Number and severity of support requests per activated school. | Determines whether onboarding and product are workable. |
| Critical incidents | Security, privacy, safeguarding, payment or access incidents. | Any unresolved critical incident stops expansion. |
| Feedback completion | Schools completing first-use and week-two feedback divided by eligible schools. | Tests whether evidence is representative. |

Record raw counts alongside rates; do not interpret a percentage from a denominator of one or two as proof of demand.

## Stop / go criteria

### Stop and fix immediately

- Failed payment, duplicate order, wrong-school entitlement, unauthorised access, cap breach or access not removed after refund.
- Missing confirmation/reset email, unmonitored privacy contact, unknown data-flow/subprocessor/retention position, or a safeguarding concern.
- A material accessibility failure preventing a teacher from buying, activating, giving feedback or using a lesson.
- Any critical incident that has no documented resolution and retest.

### Continue the validation cohort

Continue only when each active school can complete payment, activation and first use; support issues are recorded and either resolved or have a clear owner; and feedback shows a plausible fit for the intended early-years/SEND context.

### Consider controlled expansion toward 50 schools

Only consider the next small cohort after all Project 1 gates have current evidence, three to five validation schools complete the intended journey, no unresolved critical incident remains, and the weekly metrics/feedback show that activation, first value and seven-day use are working without disproportionate support.

Expansion remains cohort-by-cohort. The 50-school cap is an operational maximum, not a launch target.

## Minimum records to retain

- Release-gate evidence and repeat-test date.
- School URN, operational stage, owner, next action and consent/approval basis for contact.
- Secure operational references for checkout, entitlement, fulfilment and support issues; never put secrets, payment-card data or pupil-identifying information in a tracker.
- First-use and week-two feedback themes, including positive evidence, barriers, requested changes and follow-up outcome.
- Decision log for every stop, fix, retest and expansion decision.
