# LINE OA integration

The application now includes:

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

1. In LINE Developers Console, open the Messaging API channel connected to
   MiniBettafarm.
2. Add `LINE_CHANNEL_SECRET` and `LINE_CHANNEL_ACCESS_TOKEN` to the deployed
   application's server environment.
3. Add the receiving admin or group user ID as `LINE_SUMMARY_TO`.
4. Set `NEXT_PUBLIC_SITE_URL` to the public website URL and create a strong
   `CRON_SECRET`.
   Set `NEXT_PUBLIC_LINE_OA_ID` to your actual LINE OA ID, including `@`.
5. Deploy the application to an HTTPS public domain.
6. Set the channel webhook URL to
   `https://YOUR-DOMAIN/api/line/webhook`, verify it, and enable webhooks.
7. Disable the LINE OA Manager greeting/automatic response if it duplicates
   the bot responses.
8. Apply `supabase/migrations/202609210001_order_workflow.sql` to the existing
   Supabase database. It initializes the supplied PromptPay and TTB details;
   verify them at `/admin/payment-settings` before taking the first order.
9. Test with one small real order: create it, open its private status link, send
   the prepared LINE message, upload a slip, inspect it in Admin, mark it paid,
   enter tracking, and mark it shipped. Also test cancellation of an unpaid
   order and verify that stock returns.

The LINE button pre-fills an order message. The customer must actually send it
to the OA before the webhook can associate their LINE account with the order.
Customer push updates are sent only after this association succeeds. The store
receives the initial order Flex Message at `LINE_SUMMARY_TO`.

The public OA link uses `@097zxssv` by default; `NEXT_PUBLIC_LINE_OA_ID` can
override it. Messaging API notifications require a channel secret, access
token, and receiving LINE user/group ID. Those are not the same as the public
OA ID and must be set as server environment variables.

Never commit the channel secret, channel access token, recipient user ID, or
cron secret to Git. Localhost cannot receive webhook requests directly from
LINE; use the deployed HTTPS URL for the final connection.
