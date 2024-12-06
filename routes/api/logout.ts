import { Handlers } from "$fresh/server.ts";
import { kindeClient } from "../../utils/kinde.ts";

export const handler: Handlers = {
  async GET(_req) {
    const logoutUrl = await kindeClient.getLogoutURL();
    return new Response(null, {
      status: 302,
      headers: { Location: logoutUrl.toString() },
    });
  },
}; 