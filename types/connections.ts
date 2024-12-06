export enum AuthConnection {
  GOOGLE = "google",
  FACEBOOK = "facebook",
  APPLE = "apple",
  X = "twitter",
  EMAIL_CODE = "email_code",
  USERNAME_CODE = "username_code",
}

export interface ConnectionConfig {
  id: string;
  name: string;
  type: AuthConnection;
  icon: string;
}

export const AUTH_CONNECTIONS: Record<AuthConnection, ConnectionConfig> = {
  [AuthConnection.GOOGLE]: {
    id: "con_2b9c6d1b0e1e4f1b",
    name: "Google",
    type: AuthConnection.GOOGLE,
    icon: "Chrome",
  },
  [AuthConnection.FACEBOOK]: {
    id: "con_3a8d7c2b1f2e5g2c",
    name: "Facebook",
    type: AuthConnection.FACEBOOK,
    icon: "Facebook",
  },
  [AuthConnection.APPLE]: {
    id: "con_4b9e8d3c2g3f6h3d",
    name: "Apple",
    type: AuthConnection.APPLE,
    icon: "Apple",
  },
  [AuthConnection.X]: {
    id: "con_5c0f9e4d3h4g7i4e",
    name: "X",
    type: AuthConnection.X,
    icon: "Twitter",
  },
  [AuthConnection.EMAIL_CODE]: {
    id: "con_6d1g0f5e4i5h8j5f",
    name: "Email Code",
    type: AuthConnection.EMAIL_CODE,
    icon: "Mail",
  },
  [AuthConnection.USERNAME_CODE]: {
    id: "con_7e2h1g6f5j6i9k6g",
    name: "Username Code",
    type: AuthConnection.USERNAME_CODE,
    icon: "User",
  },
}; 