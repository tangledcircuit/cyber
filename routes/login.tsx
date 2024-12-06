import { Handlers } from "$fresh/server.ts";
import { createOAuthSession, generatePKCE, getAuthorizationUrl } from "../utils/kinde.ts";

export const handler: Handlers = {
  async GET(_req) {
    // Create OAuth session
    const oauthSession = await createOAuthSession();
    const { challenge } = await generatePKCE();
    
    // Get authorization URL
    const authUrl = getAuthorizationUrl(oauthSession.state, challenge);
    
    // Redirect to Kinde login
    return new Response(null, {
      status: 302,
      headers: { Location: authUrl },
    });
  },
}; 