type AuthMode = "signin" | "signup" | "reset";

/**
 * Map a Firebase Auth error (or any thrown value) to a friendly, human message.
 * Never returns raw "Firebase:" strings.
 */
export function humanAuthError(e: unknown, mode: AuthMode = "signin"): string {
  const code =
    typeof e === "object" && e !== null && "code" in e
      ? String((e as { code: unknown }).code)
      : "";

  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Incorrect email or password.";
    case "auth/invalid-email":
      return "That email doesn’t look right.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    case "auth/too-many-requests":
      return "Too many attempts. Try again in a few minutes.";
    case "auth/network-request-failed":
      return "Network error. Check your connection.";
    case "auth/email-already-in-use":
      return "That email already has an account. Try signing in.";
    case "auth/weak-password":
      return "Password is too weak — use at least 8 characters.";
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "Sign-in was cancelled.";
    case "auth/popup-blocked":
      return "Popup was blocked. Allow popups and try again.";
    case "auth/account-exists-with-different-credential":
      return "An account with this email exists with a different sign-in method.";
    case "auth/missing-password":
      return "Enter a password to continue.";
    default:
      if (mode === "signup") return "Couldn’t create your account.";
      if (mode === "reset") return "Couldn’t send the reset email.";
      return "Couldn’t sign you in.";
  }
}
