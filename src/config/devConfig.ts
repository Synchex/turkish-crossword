/**
 * Developer Mode configuration.
 *
 * Toggle via environment variable:
 *   EXPO_PUBLIC_DEV_MODE=true   →  unlimited coins, dev panel access
 *   EXPO_PUBLIC_DEV_MODE=false  →  normal production behaviour
 *
 * In .env or .env.local:
 *   EXPO_PUBLIC_DEV_MODE=true
 */

export const IS_DEV =
    process.env.EXPO_PUBLIC_DEV_MODE === 'true' || __DEV__;

/** Unlimited coin balance shown in DEV mode */
export const DEV_COIN_BALANCE = 999_999;
