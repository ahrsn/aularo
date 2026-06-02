/**
 * Auth port — the identity-provider seam.
 *
 * STATUS: design scaffold (Phase 3/5 of docs/open-core.md). Type-only.
 *
 * Aularo already issues its own signed session cookie after verifying an
 * identity token (see src/lib/auth-session.ts), so that cookie layer stays put.
 * Only the identity provider varies by edition:
 *   - Firebase Auth (cloud): verifyIdToken + createSessionCookie.
 *   - Community: Lucia or Auth.js (provider choice deferred to Phase 5),
 *     issuing the SAME session-cookie shape so middleware and
 *     requireActiveWorkspace() are unchanged.
 */

/** Identity extracted from a verified sign-in token. */
export interface VerifiedIdentity {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

/** Identity carried by a verified session cookie. */
export interface SessionClaims {
  uid: string;
  email: string | null;
}

export interface AuthPort {
  /** Validate a client sign-in token and extract identity. */
  verifyIdToken(idToken: string): Promise<VerifiedIdentity>;

  /** Mint a server-side session cookie value from a sign-in token. */
  createSessionCookie(idToken: string, expiresInMs: number): Promise<string>;

  /**
   * Verify a session cookie. `checkRevoked` forces a freshness check against
   * the provider where supported.
   */
  verifySessionCookie(
    cookie: string,
    checkRevoked: boolean,
  ): Promise<SessionClaims>;
}
