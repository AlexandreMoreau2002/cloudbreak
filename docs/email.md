# Email delivery

## Scope and decisions

This runbook covers development email delivery. Signup confirmations and other Supabase
Auth emails follow the active path through the hosted development Supabase project and
its Brevo SMTP configuration. Backend-originated transactional email is a separate,
future integration; it is not used for signup confirmations.

Brevo is the outbound provider and OVH remains the registrar and DNS host for now. The
development sending domain is `dev.cloudbreak-app.com`; production sending and inbound
support email are deliberately deferred.

The approved development identity is `Cloudbreak Dev <no-reply@dev.cloudbreak-app.com>`.
Do not publish or present `contact@dev.cloudbreak-app.com` as a supported address.

## Architecture

```text
Mobile app -> Cloudbreak backend (Dokploy) -> Brevo -> recipient inbox
Sender: no-reply@dev.cloudbreak-app.com
```

The block above describes the future path for backend-originated mail. The active signup
and authentication-email path is:

```text
Mobile app -> hosted Supabase Auth -> Brevo SMTP -> recipient inbox
```

The mobile app never receives Brevo credentials or communicates with Brevo directly.
For signup confirmations, Supabase Auth uses the SMTP credentials configured in the
hosted development Supabase project; the Dokploy backend and a Brevo API key are not
involved.

There is no local Supabase instance yet: the CLI is installed, but no local Supabase
configuration or containers exist. Do not describe local Supabase as an available
delivery path until it has actually been initialized and started.

## Dev sending

Authenticate only `dev.cloudbreak-app.com` with Brevo for this rollout. Configure the
hosted development Supabase project's SMTP settings with Brevo so that Supabase Auth can
send signup confirmations. Use the development sender above for dev-only messages, and
send verification messages only to a recipient controlled by the operator. Do not
authenticate or send from `cloudbreak-app.com` as part of the dev rollout.

**Supabase Auth template compatibility:** Cloudbreak upgrades a guest account to an email
account with `verifyOtp(..., type: 'email_change')`. The Supabase Auth **Change email
address** template must therefore display `{{ .Token }}` as the code matching the app's
configured six-digit OTP. It must not be a link-only template using
`{{ .ConfirmationURL }}` for this flow.

The hosted development Supabase project must have these guest-to-email prerequisites:

- **Allow manual linking:** ON.
- **Secure email change:** OFF.
- **Mailer OTP length:** 6.

Post-merge development environment steps:

1. Create or select the development Supabase project and configure its SMTP delivery
   with Brevo; keep those SMTP credentials in Supabase configuration only.
2. Only when backend-originated mail has been implemented, add the backend's relevant
   Brevo secrets to the Dokploy backend service.
3. Redeploy the backend after those backend secrets and its mail integration are ready.

## Dev-to-production checklist

Before creating the production Supabase project or publishing a support address, verify
these source and target settings. Production is a distinct environment: do not copy
development credentials or reuse its sender domain.

| Setting | Development source | Production target |
|---|---|---|
| Allow manual linking | ON | ON — required for Apple and manual identity linking. |
| Anonymous sign-ins | ON when the guest journey is enabled | ON if the guest journey is retained. |
| Confirm email | ON | ON. |
| Secure email change | OFF for the guest-to-email conversion | OFF only for that conversion; permanent-account email changes need a separate secure flow. |
| Mailer OTP length | 6 | 6. |
| Change email address template | `{{ .Token }}` with a six-digit-code label; not link-only `{{ .ConfirmationURL }}` | Same token-code template and six-digit label. |
| Outbound SMTP and sender | Brevo SMTP and `dev.cloudbreak-app.com` | Separate Brevo SMTP configuration and an authenticated production sender domain. |
| Support reception | No dev support inbox | Separate production email routing to the verified support inbox. |

**Security boundary:** before merge, the app code must reject
`beginEmailUpgrade`, `completeEmailUpgrade`, and `resendEmailUpgrade` outside an
anonymous session. Any future email change for a permanent account must use a separate
flow with double confirmation and reauthentication.

## DNS authentication

In Brevo, select `dev.cloudbreak-app.com` and use manual individual DNS records. Before
editing OVH, copy the exact record type, host/name, target/value, and priority displayed
by Brevo, then inspect the existing zone for conflicts. Add only the records Brevo
provides for this domain.

If an SPF TXT record already exists at the exact requested host, merge authorized
senders into that single SPF record; never create a second SPF TXT record. Do not alter
the `dev-api` or `dev-ops` A records, and do not create an OVH mailbox or MX Plan.

Return to Brevo to verify the domain after propagation. Record a pending verification
state without changing record values if propagation is not complete.

## Dokploy configuration

This section applies only after backend-originated mail is implemented. Do not add a
Brevo API key to Dokploy merely to enable Supabase signup confirmations. When the backend
needs to send its own messages, store its Brevo API key exclusively in the Dokploy
development backend service. It must not appear in Git, the mobile application, docs,
logs, or any other Dokploy service.

Before enabling delivery, inspect the backend's runtime configuration and use its
supported environment-variable names. If the backend has not yet integrated email,
record the variables as pending integration rather than treating secret configuration as
an activation of delivery. Redeploy only the backend after its configuration is confirmed.

## Inbound support email (production)

Brevo does not host `contact@cloudbreak-app.com`. Cloudflare Email Routing is the planned
free forwarding layer for that address, forwarding to a verified existing inbox.

This production route is separate from the development sending rollout. Do not configure
inbound email or publish a support address until the production requirements have been
completed.

## Email locale architecture

The Auth email locale contract is deliberately small and server-consumable:

- `user_metadata.locale` may only be `'fr'` or `'en'`.
- Missing, malformed, or any other locale value falls back to French. French is both the
  default and the safety fallback.
- Before an outbound Auth email is requested, the mobile app prepares this metadata with a
  best-effort synchronization. A failed or rejected metadata write is ignored for delivery;
  it must never prevent the Auth email from being sent.
- Hosted Supabase templates read the value as `.Data.locale`. The six-digit
  `{{ .Token }}` stays outside the translated conditional so the existing OTP flow remains
  unchanged.

The canonical body structure for the hosted **Change email address** template is:

```html
{{ if eq .Data.locale "en" }}
<h2>Confirm your email address</h2>
<p>Enter this 6-digit code in Cloudbreak:</p>
{{ else }}
<h2>Confirme ton adresse e-mail</h2>
<p>Entre ce code à 6 chiffres dans Cloudbreak :</p>
{{ end }}
<p><strong>{{ .Token }}</strong></p>
{{ if eq .Data.locale "en" }}
<p>If you did not request this confirmation, ignore this email.</p>
{{ else }}
<p>Si tu n’as pas demandé cette confirmation, ignore cet e-mail.</p>
{{ end }}
```

The same locale-preparation helper must be used by future Auth email flows (including
password reset, reauthentication, and permanent e-mail change) before requesting delivery.
The actual template source of truth is the Supabase Dashboard under **Authentication > Email
Templates**. This repository records the canonical content, contract, and verification
procedure; it does not contain credentials or claim Dashboard configuration that has not
been verified.

### Reset Password template (story 2.7)

The password-recovery flow is fully in-app and does not use a magic link:

```text
Mobile /reset
  -> Supabase Auth resetPasswordForEmail(email)
  -> Brevo SMTP sends the Reset Password template
  -> Mobile /reset-confirm
  -> verifyOtp(email, token, type: recovery)
  -> updateUser(password)
  -> idempotent Cloudbreak profile provisioning
```

In the hosted Supabase project, **Authentication > Email Templates > Reset Password** must
render `{{ .Token }}` as a six-digit code. A link-only template using
`{{ .ConfirmationURL }}` is incompatible with the mobile screen. Its FR/EN conditional must
follow the same `.Data.locale` contract as the Change email address template, with the
`else` branch in French so missing, invalid, or unsupported locale metadata never blocks
delivery and always produces readable copy.

Supabase applies a 60-second password-recovery request window by default. Cloudbreak's
mobile resend countdown is 30 seconds, including immediately after the first send. For
each environment, configure **Authentication > Rate Limits > Password reset request** to
30 seconds (or at most 30 seconds); otherwise the UI will allow a retry that Supabase still
rejects. Reproduce this setting explicitly when the production project is created.

Before diagnosing the app, check the project-wide Supabase Auth mail rate limit (typically
only a few messages per hour). Recent signup tests can exhaust it and make a recovery request
appear successful without a new delivery. Test with a **confirmed** recipient account, then use
**Authentication > Logs** and filter the recovery event / recipient to distinguish a dashboard
configuration or limit from a mobile failure. The OTP-only flow does not need `redirectTo`:
it requires `{{ .Token }}` in the Reset Password template; a link-only `{{ .ConfirmationURL }}`
template cannot supply the six-digit code expected by the app.

For recovery, Supabase renders the metadata of the recipient account. The app performs the
locale synchronization as best effort, but a signed-out/guest session cannot overwrite the
target account's metadata. Consequently, the stored account locale is used when available;
French remains the guaranteed fallback. Changing the current app language alone does not
guarantee that an older account's recovery email changes language. A future transactional
email service would be required if the recovery message must always follow the current
pre-auth app locale.

### Current validation status

The app-side contract is implemented. As of 2026-09-07, the hosted Supabase **Change email
address** template is configured with the documented FR/EN body conditional and dynamic
subject. Operator-controlled live delivery proof is still pending: French, English, and
missing/invalid-locale sends must each be observed in delivery logs, with the
missing/invalid cases confirmed as French. Subject localization must also be recorded
according to the hosted Dashboard behavior: retain a conditional subject only if it renders,
otherwise use the neutral fallback
`Confirm your email / Confirme ton e-mail, Cloudbreak Mer de nuage`. Do not mark the i18n
architecture complete until those three delivery cases pass.

### Anonymous-session and locale regression

The Supabase Dashboard **Authentication > Users** view can visually obscure anonymous
rows. The diagnostic read-only query of `auth.users` is therefore authoritative for this
check and confirms that anonymous users are stored with `is_anonymous = true`.

The session invariant is: each new guest flow creates exactly one new `auth.users` row
with `is_anonymous = true`. Check that authentication row separately from the single
business-profile row provisioned by the backend; neither check substitutes for the other.
A logout followed by a fresh guest flow must create one new authentication row and one
new backend profile row, while the logged-out session must not be reused or upgraded
accidentally. Repeat the flow after app restart and compare the read-only `auth.users`
results and backend profile records independently to catch duplicate or reused sessions.

On bootstrap, the mobile client validates a persisted session with Supabase before trusting it.
Only an explicit terminal identity error clears the local session; network failures, rate limits,
and server errors preserve it and surface the service-unavailable state. This prevents a deleted
Supabase account from being reused while preventing an ambiguous temporary failure from logging a
real user out.

For the email regression, run the guest-to-email upgrade once with locale `fr`, once with
`en`, and once with a missing or invalid locale. Confirm the six-digit token is delivered
and the body renders French, English, and the French fallback respectively. The local
app-side locale preparation and the session checks are validated in code. The canonical
template is configured in the hosted Dashboard as of 2026-09-07, but its live FR/EN/fallback
delivery tests remain pending; record delivery evidence for all three locale cases before
release.

## Localization roadmap

Before release, provide localized copy and automated/manual coverage for email confirmation,
password reset, and email change in every supported language. Keep the development sender as a
single technical sender; support-address and production mailbox decisions remain part of the
deferred production rollout.

## Security rules

- Never commit, document, log, or expose a Brevo API key, SMTP password, DNS credential,
  or personal destination address.
- Do not give Brevo credentials to Expo or any mobile client. Store SMTP credentials for
  signup email in the hosted Supabase project's SMTP configuration, not in the app.
- Before external DNS or Dokploy changes, record the provider-displayed values and check
  for conflicting records.
- Restrict the outbound credential to the named backend service and use a recipient
  controlled by the operator for tests.
- Do not repurpose the guest-to-email upgrade for a permanent-account email change;
  require a separate double-confirmation and reauthentication flow.

## Manual verification

1. Confirm in Brevo that `dev.cloudbreak-app.com` is authenticated.
2. Confirm that the hosted development Supabase project uses Brevo SMTP and send one
   signup confirmation to an operator-controlled recipient.
3. Confirm that Allow manual linking is ON, Secure email change is OFF, and Mailer OTP
   length is 6 in the hosted development Supabase project.
4. Create a development account, receive the Change email address code email, enter its
   six-digit OTP in the app, and confirm that the guest-to-email upgrade completes.
5. Confirm receipt and a successful delivery event in Brevo Logs.
6. If backend-originated mail has been implemented, confirm its secrets are set only on
   the Dokploy development backend service, then redeploy that backend and test it with
   an operator-controlled recipient.
7. Confirm that no production sending domain, inbound mailbox, or
   `contact@dev.cloudbreak-app.com` support address was configured.
8. Configure **Reset Password** with `{{ .Token }}`, then request a reset for controlled FR
   and EN accounts. Confirm receipt of a six-digit code, complete
   `verifyOtp(..., type: 'recovery')` in the app, set a new password, and verify that the old
   password is rejected while the new password signs in successfully. Also verify that an
   account with missing/invalid locale metadata receives the French fallback.
9. Confirm the Supabase password-reset request limit is configured to 30 seconds, then
   verify that the first resend is blocked in-app until the countdown expires and accepted
   by Supabase as soon as it reaches zero.
