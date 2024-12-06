import { Handlers } from "$fresh/server.ts";
import { authenticate, createAuthToken } from "../../utils/auth.ts";
import { setCookie } from "$std/http/cookie.ts";

export const handler: Handlers = {
  async POST(req) {
    try {
      const { email, password } = await req.json();
      
      const user = await authenticate(email, password);
      if (!user) {
        return new Response(
          JSON.stringify({ message: "Invalid credentials" }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
      }

      const token = createAuthToken(user);
      const headers = new Headers({ 
        "Content-Type": "application/json",
        "Location": "/dashboard"
      });
      
      // Set auth cookie
      setCookie(headers, {
        name: "authToken",
        value: token,
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
      });

      return new Response(
        JSON.stringify({ success: true, redirect: "/dashboard" }), 
        { headers }
      );
    } catch (_error) {
      return new Response(
        JSON.stringify({ message: "Internal server error" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  },
}; 