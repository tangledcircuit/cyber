// DO NOT EDIT. This file is generated by Fresh.
// This file SHOULD be checked into source version control.
// This file is automatically updated during development when running `dev.ts`.

import * as $_404 from "./routes/_404.tsx";
import * as $_app from "./routes/_app.tsx";
import * as $_middleware from "./routes/_middleware.ts";
import * as $api_auth_callback from "./routes/api/auth/callback.ts";
import * as $api_auth_login from "./routes/api/auth/login.ts";
import * as $api_joke from "./routes/api/joke.ts";
import * as $api_logout from "./routes/api/logout.ts";
import * as $dashboard from "./routes/dashboard.tsx";
import * as $greet_name_ from "./routes/greet/[name].tsx";
import * as $index from "./routes/index.tsx";
import * as $login from "./routes/login.tsx";
import * as $register from "./routes/register.tsx";
import * as $Counter from "./islands/Counter.tsx";
import * as $LoginButton from "./islands/LoginButton.tsx";
import * as $LoginForm from "./islands/LoginForm.tsx";
import * as $RegisterButton from "./islands/RegisterButton.tsx";
import type { Manifest } from "$fresh/server.ts";

const manifest = {
  routes: {
    "./routes/_404.tsx": $_404,
    "./routes/_app.tsx": $_app,
    "./routes/_middleware.ts": $_middleware,
    "./routes/api/auth/callback.ts": $api_auth_callback,
    "./routes/api/auth/login.ts": $api_auth_login,
    "./routes/api/joke.ts": $api_joke,
    "./routes/api/logout.ts": $api_logout,
    "./routes/dashboard.tsx": $dashboard,
    "./routes/greet/[name].tsx": $greet_name_,
    "./routes/index.tsx": $index,
    "./routes/login.tsx": $login,
    "./routes/register.tsx": $register,
  },
  islands: {
    "./islands/Counter.tsx": $Counter,
    "./islands/LoginButton.tsx": $LoginButton,
    "./islands/LoginForm.tsx": $LoginForm,
    "./islands/RegisterButton.tsx": $RegisterButton,
  },
  baseUrl: import.meta.url,
} satisfies Manifest;

export default manifest;
