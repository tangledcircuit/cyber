import { Handlers } from "$fresh/server.ts";
import { setCookie } from "$std/http/cookie.ts";
import { 
  getOAuthSession, 
  exchangeCodeForTokens, 
  createUserSession,
  getUserProfile 
} from "../utils/kinde.ts";

export const handler: Handlers = {
  async GET(req) {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");
    const errorDescription = url.searchParams.get("error_description");

    // Handle OAuth error response
    if (error) {
      console.error("OAuth error:", error, errorDescription);
      return new Response(
        JSON.stringify({ error, description: errorDescription }), 
        { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Validate required parameters
    if (!code || !state) {
      console.error("Missing required parameters:", { code: !!code, state: !!state });
      return new Response(
        JSON.stringify({ error: "invalid_request", description: "Missing required parameters" }), 
        { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    try {
      // Get the stored OAuth session
      const oauthSession = await getOAuthSession(state);
      if (!oauthSession) {
        console.error("Invalid state - no matching OAuth session found");
        throw new Error("invalid_state");
      }

      // Exchange code for tokens
      const tokens = await exchangeCodeForTokens(code, oauthSession.codeVerifier);
      
      // Get user profile
      const userProfile = await getUserProfile(tokens.access_token);
      
      // Create user session
      const _session = await createUserSession(userProfile.id, {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        idToken: tokens.id_token,
        expiresIn: tokens.expires_in,
      });

      const headers = new Headers({ 
        "Location": "/dashboard",
        "Content-Type": "application/json",
      });

      // Set session cookie
      setCookie(headers, {
        name: "session_id",
        value: userProfile.id,
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "Lax",
        maxAge: tokens.expires_in, // Set cookie expiry to match token expiry
      });

      return new Response(
        JSON.stringify({ success: true, redirect: "/dashboard" }),
        {
          status: 302,
          headers,
        }
      );
    } catch (error) {
      console.error("Callback error:", error);
      
      // Determine error type and return appropriate response
      const isKnownError = error instanceof Error && 
        ["invalid_state", "invalid_grant"].includes(error.message);
      
      const statusCode = isKnownError ? 400 : 500;
      const errorMessage = isKnownError ? error.message : "authentication_failed";
      
      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          description: isKnownError ? error.message : "An unexpected error occurred"
        }),
        { 
          status: statusCode,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
  },
}; 