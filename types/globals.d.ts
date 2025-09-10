export type Roles = "doctor" | "patient" | "admin";

export interface UserPublicMetadata {
  role?: Roles;
  onboardingComplete?: boolean;
}

export interface CustomJwtSessionClaims {
  metadata: UserPublicMetadata;
}
