export const InternetIdentityProvider = ({ children }: any) => <>{children}</>;
export const useInternetIdentity = () => ({
  identity: null,
  login: () => console.log("Mock Login"),
  logout: () => console.log("Mock Logout"),
  isAuthenticated: false
});