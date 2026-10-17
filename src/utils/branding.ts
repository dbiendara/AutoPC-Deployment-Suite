/**
 * Centralized branding utility for FDIM suite.
 * Manages the per-user profanity / corporate safe-for-work (SFW) configuration switch.
 *
 * When showProfanity is true:
 *   "Fuck Doing It Manually" (Edgy IT sysadmin humor)
 * When showProfanity is false:
 *   "Forget Doing It Manually" (Corporate Safe-For-Work / Client-ready)
 */

export function getFdimExpansion(showProfanity?: boolean): string {
  return showProfanity ? 'Fuck Doing It Manually' : 'Forget Doing It Manually';
}

export function getFdimShortTag(showProfanity?: boolean): string {
  return showProfanity ? 'Fuck Doing It Manually' : 'Forget Doing It Manually';
}

export function getFdimModeLabel(showProfanity?: boolean): string {
  return showProfanity ? 'Uncensored' : 'Corporate SFW';
}

export function getFdimBadgeClass(showProfanity?: boolean): string {
  return showProfanity
    ? 'text-amber-300 bg-amber-950/80 border-amber-800/80'
    : 'text-emerald-300 bg-emerald-950/80 border-emerald-800/80';
}

export function loadUserProfanityPreference(userIdOrUsername?: string, defaultVal: boolean = true): boolean {
  if (typeof window === 'undefined') return defaultVal;
  try {
    if (userIdOrUsername) {
      const userVal = localStorage.getItem(`fdim_pref_show_profanity_${userIdOrUsername}`);
      if (userVal !== null) {
        return userVal === 'true';
      }
    }
    const globalVal = localStorage.getItem('fdim_pref_show_profanity');
    if (globalVal !== null) {
      return globalVal === 'true';
    }
  } catch (err) {
    console.error('Error loading profanity preference:', err);
  }
  return defaultVal;
}

export function saveUserProfanityPreference(userIdOrUsername: string, showProfanity: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    if (userIdOrUsername) {
      localStorage.setItem(`fdim_pref_show_profanity_${userIdOrUsername}`, String(showProfanity));
    }
    localStorage.setItem('fdim_pref_show_profanity', String(showProfanity));
  } catch (err) {
    console.error('Error saving profanity preference:', err);
  }
}
