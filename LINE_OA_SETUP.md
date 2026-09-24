# LINE OA integration

The application now includes:

- A required LINE Login + OA friendship check before checkout.
- Automatic order-to-customer association using the verified LINE user ID.
- A customer Flex Message with the order and payment-page link immediately after checkout.
- `POST /api/line/webhook` for verified LINE Messaging API webhooks.
- Thai automatic replies for product, price, order, shipping, and admin keywords.
- An immediate private notification when a storefront order is created.
- `GET /api/line/daily-summary` for daily sales and inventory summaries.
- A Vercel cron schedule at 20:00 Asia/Bangkok (13:00 UTC).
- Customer order status and private slip upload at `/orders/:id?token=...`.
- An admin order queue at `/admin/orders` and payment account setup at `/admin/payment-settings`.
- A daily expiry job for unpaid reservations older than 24 hours without a submitted slip.
- Fixed shipping of 80 THB configured in `store_settings`.

## Required LINE configuration

1. In LINE Developers Console, create/open a LINE Login channel under the
   **same provider** as the Messaging API channel connected to MiniBettafarm.
   In the LINE Login channel settings, link the OA/Messaging API channel so the
   add-friend option and friendship API are available.
2. Register this exact callback URL in the LINE Login channel:
   `https://YOUR-DOMAIN/api/line/login/callback`.
3. Add `LINE_LOGIN_CHANNEL_ID`, `LINE_LOGIN_CHANNEL_SECRET`,
   `LINE_LOGIN_CALLBACK_URL`, and a random 32+ character
   `LINE_LOGIN_SESSION_SECRET` to the deployed server environment.
4. Add `LINE_CHANNEL_SECRET` and `LINE_CHANNEL_ACCESS_TOKEN` to the deployed
   application's server environment.
5. Add the receiving admin or group user ID as `LINE_SUMMARY_TO`.
6. Set `NEXT_PUBLIC_SITE_URL` to the public website URL and create a strong
   `CRON_SECRET`.
   Set `NEXT_PUBLIC_LINE_OA_ID` to your actual LINE OA ID, including `@`.
7. Deploy the application to an HTTPS public domain.
8. Set the Messaging API channel webhook URL to
   `https://YOUR-DOMAIN/api/line/webhook`, verify it, and enable webhooks.
9. Disable the LINE OA Manager greeting/automatic response if it duplicates
   the bot responses.
10. Apply `supabase/migrations/202609210001_order_workflow.sql`, followed by
   `supabase/migrations/202609240001_line_login_checkout.sql`, to the existing
   Supabase database. It initializes the supplied PromptPay and TTB details;
   verify them at `/admin/payment-settings` before taking the first order.
11. Test with one small real order: log in, accept/add the OA as a friend,
   confirm the order, verify the customer receives the Flex Message, upload a
   slip, inspect it in Admin, mark it paid,
   enter tracking, and mark it shipped. Also test cancellation of an unpaid
   order and verify that stock returns.

At checkout the server exchanges the LINE authorization code, verifies the ID
token, reads the LINE profile, and checks `friendFlag`. The checkout API checks
friendship again immediately before creating the order. The verified
`line_user_id` is saved in the same database transaction as the order, then the
OA pushes the order/payment link to that user. The store also receives the
initial order Flex Message at `LINE_SUMMARY_TO`.

The public OA link uses `@097zxssv` by default; `NEXT_PUBLIC_LINE_OA_ID` can
override it. Messaging API notifications require a channel secret, access
token, and receiving LINE user/group ID. Those are not the same as the public
OA ID and must be set as server environment variables.

Never commit the channel secret, channel access token, recipient user ID, or
cron secret to Git. Localhost cannot receive webhook requests directly from
LINE; use the deployed HTTPS URL for the final connection.
