// DO NOT EDIT. This file is generated by Fresh.
// This file SHOULD be checked into source version control.
// This file is automatically updated during development when running `dev.ts`.

import * as $_404 from "./routes/_404.tsx";
import * as $_app from "./routes/_app.tsx";
import * as $_layout from "./routes/_layout.tsx";
import * as $api_auth_callback from "./routes/api/auth/callback.ts";
import * as $api_auth_login from "./routes/api/auth/login.ts";
import * as $api_balance_userId_ from "./routes/api/balance/[userId].ts";
import * as $api_events from "./routes/api/events.ts";
import * as $api_health from "./routes/api/health.ts";
import * as $api_joke from "./routes/api/joke.ts";
import * as $api_logout from "./routes/api/logout.ts";
import * as $api_reset_db from "./routes/api/reset-db.ts";
import * as $api_stripe_checkout from "./routes/api/stripe/checkout.ts";
import * as $api_stripe_webhook from "./routes/api/stripe/webhook.ts";
import * as $api_timer_clear from "./routes/api/timer/clear.ts";
import * as $api_timer_start from "./routes/api/timer/start.ts";
import * as $api_timer_state from "./routes/api/timer/state.ts";
import * as $api_timer_stop from "./routes/api/timer/stop.ts";
import * as $api_tokens_userId_ from "./routes/api/tokens/[userId].ts";
import * as $api_tokens_balance from "./routes/api/tokens/balance.ts";
import * as $api_tokens_use from "./routes/api/tokens/use.ts";
import * as $api_tokens_watch from "./routes/api/tokens/watch.ts";
import * as $api_transactions from "./routes/api/transactions.ts";
import * as $dashboard from "./routes/dashboard.tsx";
import * as $dashboard_index from "./routes/dashboard/index.tsx";
import * as $greet_name_ from "./routes/greet/[name].tsx";
import * as $index from "./routes/index.tsx";
import * as $login from "./routes/login.tsx";
import * as $register from "./routes/register.tsx";
import * as $AnimatedHero from "./islands/AnimatedHero.tsx";
import * as $BalanceDisplay from "./islands/BalanceDisplay.tsx";
import * as $Counter from "./islands/Counter.tsx";
import * as $Dashboard from "./islands/Dashboard.tsx";
import * as $Header from "./islands/Header.tsx";
import * as $PurchaseButton from "./islands/PurchaseButton.tsx";
import * as $PurchaseModal from "./islands/PurchaseModal.tsx";
import * as $ThemeSwitcher from "./islands/ThemeSwitcher.tsx";
import * as $Timer from "./islands/Timer.tsx";
import * as $TokenBalance from "./islands/TokenBalance.tsx";
import * as $TokenDisplay from "./islands/TokenDisplay.tsx";
import type { Manifest } from "$fresh/server.ts";

const manifest = {
  routes: {
    "./routes/_404.tsx": $_404,
    "./routes/_app.tsx": $_app,
    "./routes/_layout.tsx": $_layout,
    "./routes/api/auth/callback.ts": $api_auth_callback,
    "./routes/api/auth/login.ts": $api_auth_login,
    "./routes/api/balance/[userId].ts": $api_balance_userId_,
    "./routes/api/events.ts": $api_events,
    "./routes/api/health.ts": $api_health,
    "./routes/api/joke.ts": $api_joke,
    "./routes/api/logout.ts": $api_logout,
    "./routes/api/reset-db.ts": $api_reset_db,
    "./routes/api/stripe/checkout.ts": $api_stripe_checkout,
    "./routes/api/stripe/webhook.ts": $api_stripe_webhook,
    "./routes/api/timer/clear.ts": $api_timer_clear,
    "./routes/api/timer/start.ts": $api_timer_start,
    "./routes/api/timer/state.ts": $api_timer_state,
    "./routes/api/timer/stop.ts": $api_timer_stop,
    "./routes/api/tokens/[userId].ts": $api_tokens_userId_,
    "./routes/api/tokens/balance.ts": $api_tokens_balance,
    "./routes/api/tokens/use.ts": $api_tokens_use,
    "./routes/api/tokens/watch.ts": $api_tokens_watch,
    "./routes/api/transactions.ts": $api_transactions,
    "./routes/dashboard.tsx": $dashboard,
    "./routes/dashboard/index.tsx": $dashboard_index,
    "./routes/greet/[name].tsx": $greet_name_,
    "./routes/index.tsx": $index,
    "./routes/login.tsx": $login,
    "./routes/register.tsx": $register,
  },
  islands: {
    "./islands/AnimatedHero.tsx": $AnimatedHero,
    "./islands/BalanceDisplay.tsx": $BalanceDisplay,
    "./islands/Counter.tsx": $Counter,
    "./islands/Dashboard.tsx": $Dashboard,
    "./islands/Header.tsx": $Header,
    "./islands/PurchaseButton.tsx": $PurchaseButton,
    "./islands/PurchaseModal.tsx": $PurchaseModal,
    "./islands/ThemeSwitcher.tsx": $ThemeSwitcher,
    "./islands/Timer.tsx": $Timer,
    "./islands/TokenBalance.tsx": $TokenBalance,
    "./islands/TokenDisplay.tsx": $TokenDisplay,
  },
  baseUrl: import.meta.url,
} satisfies Manifest;

export default manifest;
