# Real-time Settings Guide

This guide explains the real-time settings functionality that keeps your settings page synchronized with the database without requiring manual refreshes.

## 🚀 Features

### Real-time Synchronization
- **Instant Updates**: Settings changes are reflected immediately across all browser tabs
- **Auto-save**: Changes are automatically saved to the database after a short delay
- **Conflict Resolution**: Handles concurrent updates gracefully
- **Visual Feedback**: Shows sync status and connection state

### Smart Caching
- **Local Storage**: Settings are cached locally for instant loading
- **Database Sync**: Automatically syncs with Supabase database
- **Offline Support**: Works offline with local storage fallback

### User Experience
- **Live Status Indicator**: Shows connection status and last sync time
- **Sync Controls**: Manual sync and force refresh options
- **Error Handling**: Clear error messages and recovery options
- **No Refresh Needed**: Updates appear instantly without page reload

## 🛠️ Setup

### 1. Run Database Setup
```bash
npm run setup-realtime
```

This will:
- Add real-time triggers to the database
- Create necessary functions for settings sync
- Enable real-time subscriptions on user_preferences table
- Set up proper permissions and security

### 2. Restart Development Server
```bash
npm run dev
```

### 3. Test Real-time Functionality
1. Open the settings page in two browser tabs
2. Change a setting in one tab
3. Watch it update instantly in the other tab

## 📁 Architecture

### Components
- **`RealtimeStatusIndicator`**: Shows connection status and sync info
- **`useRealtimeSettings`**: Hook for real-time subscriptions
- **`useSettingsSync`**: Hook for settings synchronization
- **`realtimeSettingsService`**: Service for real-time operations

### Data Flow
```
User Changes Settings
       ↓
Local State Update
       ↓
Auto-save Timer (1.5s)
       ↓
Database Update
       ↓
Real-time Broadcast
       ↓
Other Tabs Update
```

### Database Schema
```sql
-- user_preferences table with real-time support
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  preferences JSONB DEFAULT '{}'::jsonb,
  api_keys JSONB DEFAULT '{}'::jsonb,
  ai_providers JSONB DEFAULT '{}'::jsonb,
  theme VARCHAR(20) DEFAULT 'light',
  language VARCHAR(10) DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🔧 Configuration

### Auto-save Settings
```typescript
const {
  isSyncing,
  hasUnsavedChanges,
  syncSettings
} = useSettingsSync(settings, updateSettings, {
  autoSave: true,        // Enable auto-save
  autoSaveDelay: 1500    // Delay in milliseconds
});
```

### Real-time Subscription
```typescript
useRealtimeSettings({
  onSettingsUpdate: (settings) => {
    // Handle settings update
  },
  onApiKeysUpdate: (apiKeys) => {
    // Handle API keys update
  }
});
```

## 🎯 Usage Examples

### Basic Settings Page
```tsx
export default function SettingsPage() {
  const { settings, updateSettings } = useModelSettings();
  
  const {
    isSyncing,
    hasUnsavedChanges,
    syncError,
    syncSettings,
    forceSyncFromDatabase
  } = useSettingsSync(settings, updateSettings, {
    autoSave: true,
    autoSaveDelay: 1500
  });

  return (
    <div>
      <RealtimeStatusIndicator />
      
      {/* Settings form */}
      <SettingsForm 
        settings={settings}
        onChange={updateSettings}
      />
      
      {/* Sync status */}
      {isSyncing && <div>Syncing...</div>}
      {hasUnsavedChanges && <div>Unsaved changes</div>}
      {syncError && <div>Error: {syncError}</div>}
      
      {/* Manual controls */}
      <button onClick={syncSettings}>Save Now</button>
      <button onClick={forceSyncFromDatabase}>Refresh</button>
    </div>
  );
}
```

### Custom Real-time Hook
```tsx
function useCustomRealtimeSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState({});

  useEffect(() => {
    if (!user?.id) return;

    const cleanup = realtimeSettingsService.subscribeToSettingsChanges(
      user.id,
      (newSettings) => {
        setSettings(newSettings);
      }
    );

    return cleanup;
  }, [user?.id]);

  return settings;
}
```

## 🔒 Security

### Row Level Security (RLS)
- Users can only access their own settings
- API keys are encrypted before storage
- Real-time subscriptions are user-scoped

### Authentication
- All operations require valid authentication
- User ID validation on all database operations
- Secure function execution with SECURITY DEFINER

### Data Protection
- API keys are encrypted using user-specific keys
- Sensitive data is not exposed in real-time broadcasts
- Proper error handling prevents data leaks

## 🐛 Troubleshooting

### Common Issues

#### Real-time Not Working
1. Check if real-time is enabled in Supabase dashboard
2. Verify database triggers are installed
3. Check browser console for connection errors

#### Settings Not Syncing
1. Verify user authentication
2. Check database permissions
3. Look for RLS policy issues

#### Performance Issues
1. Reduce auto-save delay if needed
2. Check for memory leaks in subscriptions
3. Monitor database connection pool

### Debug Commands
```bash
# Check database setup
npm run verify-supabase

# Test database connection
npm run test-database-connection

# Check authentication
npm run check-auth
```

### Logs to Check
- Browser console for client-side errors
- Supabase logs for database issues
- Network tab for real-time connection status

## 📊 Monitoring

### Status Indicators
- **Green dot**: Connected and synced
- **Orange dot**: Unsaved changes
- **Red dot**: Connection error
- **Spinning icon**: Syncing in progress

### Performance Metrics
- Last sync time
- Connection status
- Error count
- Sync frequency

## 🚀 Advanced Features

### Conflict Resolution
The system handles concurrent updates by:
1. Using optimistic updates for UI responsiveness
2. Merging changes at the database level
3. Broadcasting resolved state to all clients

### Offline Support
- Settings cached in localStorage
- Automatic sync when connection restored
- Conflict resolution on reconnection

### Multi-tab Synchronization
- Changes in one tab appear in others instantly
- Shared state across browser tabs
- Consistent user experience

## 📝 API Reference

### Hooks

#### `useRealtimeSettings(options)`
- **Purpose**: Subscribe to real-time settings updates
- **Parameters**: `{ onSettingsUpdate, onApiKeysUpdate }`
- **Returns**: Cleanup function

#### `useSettingsSync(settings, updateSettings, options)`
- **Purpose**: Handle settings synchronization
- **Parameters**: Settings object, update function, options
- **Returns**: Sync state and control functions

### Services

#### `realtimeSettingsService`
- **`subscribeToSettingsChanges(userId, callback)`**: Subscribe to updates
- **`updateSettingsRealtime(userId, settings)`**: Update settings
- **`getLatestSettings(userId)`**: Fetch latest settings

## 🎉 Benefits

1. **Better UX**: No manual refresh needed
2. **Real-time Collaboration**: Multiple users see changes instantly
3. **Data Consistency**: Always shows latest state
4. **Offline Resilience**: Works without internet connection
5. **Performance**: Optimistic updates for responsiveness
6. **Reliability**: Automatic error recovery and retry logic

## 🔄 Migration

If upgrading from a non-real-time setup:

1. Run the setup script: `npm run setup-realtime`
2. Restart your application
3. Existing settings will be automatically migrated
4. No code changes needed in most cases

The system is backward compatible and will gracefully degrade if real-time features are unavailable.