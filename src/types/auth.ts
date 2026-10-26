export type AuthUser = {
  id: string;
  email?: string;
  name?: string;
};

export type AuthSession = {
  accessToken: string;
  refreshToken?: string;
  user?: AuthUser;
};
