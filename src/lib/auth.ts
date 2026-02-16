export type AuthUser = {
  id: string;
  email: string;
  name?: string | null;
};

export async function getCurrentUser(): Promise<AuthUser | null> {
  // Placeholder for future auth integration.
  return null;
}
