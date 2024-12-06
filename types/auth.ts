export interface BackendAuth {
  domain: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  postLogoutRedirectUri: string;
  audience: string;
}

export interface FrontendAuth {
  domain: string;
  clientId: string;
  redirectUri: string;
  postLogoutRedirectUri: string;
} 