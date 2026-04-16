'server-only';

/**
 * ⚠️  DEV ONLY — REMOVE BEFORE PRODUCTION ⚠️
 *
 * Returns true when DEV_BYPASS_AUTH=true is set in the environment AND
 * NODE_ENV is not 'production'. The production guard is a hard stop so this
 * can never accidentally ship open.
 *
 * Usage: set DEV_BYPASS_AUTH=true in .env to skip session checks on API
 * routes while testing with curl or HTTP clients.
 */
export function isAuthBypassed(): boolean {
  if (process.env.NODE_ENV === 'production') return false;
  return process.env.DEV_BYPASS_AUTH === 'true';
}
