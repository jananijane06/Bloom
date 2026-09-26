/**
 * Helper to map Supabase authentication and network errors into
 * warm, friendly Bloom sanctuary messages.
 */
export function getFriendlyAuthErrorMessage(error: unknown): string {
  if (!error) return '';
  const message = typeof error === 'string' ? error : (error as { message?: string })?.message || '';
  const lower = message.toLowerCase();

  if (
    lower.includes('invalid login credentials') ||
    lower.includes('invalid_grant') ||
    lower.includes('wrong password')
  ) {
    return 'Incorrect email or password. Please double-check your credentials and try again ♡';
  }

  if (
    lower.includes('user already registered') ||
    lower.includes('already registered') ||
    lower.includes('already exists')
  ) {
    return 'An account with this email already exists. You can log in instead ♡';
  }

  if (
    lower.includes('email not confirmed') ||
    lower.includes('unconfirmed')
  ) {
    return 'Your email address has not been confirmed yet. Please check your inbox for the confirmation link ♡';
  }

  if (
    lower.includes('password should be at least') ||
    lower.includes('weak password') ||
    lower.includes('password is too short')
  ) {
    return 'Please choose a password with at least 6 characters for your sanctuary ♡';
  }

  if (lower.includes('passwords do not match')) {
    return 'Passwords do not match. Please ensure both fields are identical ♡';
  }

  if (
    lower.includes('invalid email') ||
    lower.includes('unable to validate email address')
  ) {
    return 'Please enter a valid email address ♡';
  }

  if (
    lower.includes('otp_expired') ||
    lower.includes('token has expired') ||
    lower.includes('token is invalid') ||
    lower.includes('expired') ||
    lower.includes('callback_failed') ||
    lower.includes('auth session missing') ||
    lower.includes('auth_callback_failed')
  ) {
    return 'This reset link has expired or has already been used. Please request a new password reset link ♡';
  }

  if (
    lower.includes('rate limit') ||
    lower.includes('too many requests')
  ) {
    return 'Too many attempts were made in a short time. Please wait a few moments before trying again ♡';
  }

  if (
    lower.includes('failed to fetch') ||
    lower.includes('network') ||
    lower.includes('timeout')
  ) {
    return 'Unable to reach the Bloom Sanctuary server. Please check your internet connection and try again ♡';
  }

  return message || 'Something gentle went wrong. Please try again in a moment ♡';
}
