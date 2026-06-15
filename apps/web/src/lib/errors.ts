import { ApiRequestError, getApiErrorMessage } from "./api";

export function getFirebaseAuthErrorMessage(error: unknown): string {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as any).code)
      : "";

  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
    case "auth/invalid-email":
      return "Email or password is incorrect. Please try again.";
    case "auth/user-disabled":
      return "This account has been disabled. Contact support.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    case "auth/email-already-in-use":
      return "An account with this email already exists. Try signing in.";
    case "auth/weak-password":
      return "Please choose a stronger password (at least 6 characters).";
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return ""; // user cancelled; show nothing
  }

  return "Something went wrong. Please try again.";
}

export function getUserFacingErrorMessage(error: unknown): string {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as any).code)
      : "";

  if (code.startsWith("auth/")) {
    return getFirebaseAuthErrorMessage(error);
  }

  if (error instanceof ApiRequestError) {
    return getApiErrorMessage(error);
  }

  return "Something went wrong. Please try again.";
}

export { getApiErrorMessage };
