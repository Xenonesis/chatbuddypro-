# Chat Auto-Redirect Fix

## Issue
Users were experiencing unexpected redirects to the dashboard while actively using the chat page. This happened during automatic session token refreshes.

## Root Cause
The `AuthContext.tsx` component had a `SIGNED_IN` event listener that **automatically redirected all users to `/dashboard`** whenever the event fired. This included:
- Actual user sign-ins ✅ (expected)
- OAuth callback completions ✅ (expected)  
- Session restorations on page load ❌ (unexpected)
- Token refresh events in some edge cases ❌ (unexpected)

### Problematic Code (Before)
```typescript
if (event === 'SIGNED_IN') {
  toast({
    title: 'Signed in',
    description: `Welcome back, ${currentSession?.user?.email}`,
  });
  
  // Force redirect to dashboard on sign in
  setTimeout(() => {
    window.location.href = '/dashboard';
  }, 100);
  
  // ... profile creation code
}
```

## Solution
Removed the automatic redirect from `AuthContext` and instead:

1. **Login Page** - Already had explicit redirect handling after `signIn()` success
2. **Signup Page** - Already had explicit redirect handling after `signUp()` success  
3. **OAuth Callback** - Already had explicit redirect handling after session exchange

### Fixed Code (After)
```typescript
if (event === 'SIGNED_IN') {
  // Only show toast for user-initiated sign-ins, not session restorations
  if (isInitialSignInRef.current) {
    toast({
      title: 'Signed in',
      description: `Welcome back, ${currentSession?.user?.email}`,
    });
    
    // Reset the flag
    isInitialSignInRef.current = false;
  }
  
  // Ensure user profile exists for OAuth users (async but non-blocking)
  if (currentSession?.user?.id) {
    ensureUserProfileExists(currentSession.user.id, currentSession.user).catch(error => {
      console.error('Error ensuring user profile exists:', error);
    });
  }
}
```

### Additional Changes
- Added `isInitialSignInRef` to track user-initiated sign-ins vs automatic session restorations
- Set the flag to `true` in the `signIn()` function before authentication
- Reset the flag on error or after toast is shown
- Updated callback page to respect `redirectTo` parameter for flexible navigation

## Files Modified
1. `src/contexts/AuthContext.tsx` - Removed automatic redirect, added flag tracking
2. `src/app/auth/callback/page.tsx` - Use redirectTo parameter instead of hardcoded /dashboard

## Testing Recommendations
1. ✅ Sign in with email/password - should redirect to dashboard
2. ✅ Sign in with OAuth (Google/GitHub) - should redirect to dashboard  
3. ✅ Navigate to chat page while signed in - should stay on chat page
4. ✅ Refresh the page while on chat - should stay on chat page
5. ✅ Wait for token refresh (60 min) while on chat - should NOT redirect
6. ✅ Open chat in new tab - should work without redirect

## Impact
- **Fixed**: Users can now use the chat page without unexpected redirects
- **Maintained**: Login flow still redirects to dashboard as expected
- **Maintained**: OAuth flow still works correctly
- **Improved**: Session restoration is now silent and non-intrusive
