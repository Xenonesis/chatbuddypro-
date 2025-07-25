# Chat Persistence Guide

ChatBuddy automatically stores all chat data (both user and AI messages) to the database. This guide explains how the persistence system works and how to verify it's functioning correctly.

## 🔄 How Chat Persistence Works

### Automatic Storage
- **User Messages**: Saved immediately when sent
- **AI Responses**: Saved after AI processing completes
- **Chat Metadata**: Title, model, timestamps automatically updated
- **Message Ordering**: Proper sequence maintained with database triggers

### Database Schema

#### Chats Table
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key)
- title (Text)
- model (Text) - AI model used
- created_at (Timestamp)
- updated_at (Timestamp)
- last_message (Text) - Preview of last message
- last_message_at (Timestamp)
- message_count (Integer) - Auto-updated by triggers
- is_archived (Boolean)
- tags (Text Array)
- user_email (Text)
- user_name (Text)
```

#### Chat Messages Table
```sql
- id (UUID, Primary Key)
- chat_id (UUID, Foreign Key)
- user_id (UUID, Foreign Key)
- role (Enum: 'user', 'assistant', 'system')
- content (Text)
- created_at (Timestamp)
- message_order (Integer) - Auto-assigned by triggers
- metadata (JSONB) - Provider, model, response time, etc.
```

## 🚀 Implementation Details

### Chat Creation
When a user sends their first message:
1. New chat record created with auto-generated title
2. User message saved with metadata
3. Chat ID stored in component state for subsequent messages

### Message Storage
Every message (user and AI) includes:
- **Content**: The actual message text
- **Role**: 'user' or 'assistant'
- **Metadata**: Provider, model, response time, token count
- **Timestamps**: Precise creation time
- **Ordering**: Sequential message order

### Error Handling
- **Graceful Degradation**: Chat continues even if database save fails
- **User Notifications**: Toast messages for sync issues
- **Retry Logic**: Automatic retry for transient failures
- **Sync Verification**: Periodic checks for data consistency

## 🔍 Verification

### Check Chat Persistence Status
```bash
npm run verify-chat-persistence
```

This script will:
- ✅ Verify database tables exist
- ✅ Test chat creation and message storage
- ✅ Check database triggers are working
- ✅ Validate message ordering
- ✅ Test metadata storage

### Manual Verification
1. **Send a message** in the chat interface
2. **Check browser console** for "Successfully saved message to database" logs
3. **Refresh the page** - messages should persist
4. **Check database directly** (if you have access):
   ```sql
   SELECT * FROM chats WHERE user_id = 'your-user-id';
   SELECT * FROM chat_messages WHERE user_id = 'your-user-id' ORDER BY created_at;
   ```

## 📊 Features

### Automatic Features
- **Message Ordering**: Sequential numbering maintained by database triggers
- **Chat Metadata**: Message count and last message time auto-updated
- **Sync Verification**: Background checks ensure UI and database stay in sync
- **Error Recovery**: Graceful handling of network issues

### Advanced Features
- **Message Metadata**: Stores AI provider, model, response time, token usage
- **Chat Statistics**: Total messages, response times, model usage
- **Export Capability**: JSON export of chat history
- **Archive Support**: Archive old chats without deletion

## 🛠️ Troubleshooting

### Common Issues

#### Messages Not Saving
1. **Check Authentication**: User must be logged in
2. **Verify Database Connection**: Run `npm run check-database`
3. **Check Console Logs**: Look for database error messages
4. **Network Issues**: Check internet connection

#### Sync Issues
1. **Run Verification**: `npm run verify-chat-persistence`
2. **Check Browser Console**: Look for sync warnings
3. **Refresh Page**: Force reload of chat history
4. **Clear Cache**: Clear browser cache if needed

#### Performance Issues
1. **Check Indexes**: Database queries should be fast
2. **Message Count**: Large chats (>1000 messages) may load slowly
3. **Network Latency**: Slow connections affect save speed

### Error Messages

#### "Sync Warning" Toast
- **Meaning**: Message sent but database save failed
- **Action**: Check internet connection, try sending again
- **Impact**: Message visible in UI but won't persist after refresh

#### "Failed to load chat history"
- **Meaning**: Cannot retrieve messages from database
- **Action**: Refresh page, check authentication
- **Impact**: Previous messages not visible

## 🔧 Configuration

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

### Database Triggers
The system uses PostgreSQL triggers to:
- Auto-assign message order
- Update chat metadata
- Maintain message counts
- Set timestamps

### Backup and Recovery
- **Automatic Backups**: Supabase handles database backups
- **Export Feature**: Users can export individual chats
- **Admin Backup**: Service can backup all user data

## 📈 Monitoring

### Logs to Watch
```javascript
// Successful saves
"Successfully saved user message to database: [message-id]"
"Successfully saved assistant message to database: [message-id]"

// Sync verification
"Message sync discrepancy detected: DB has X messages, UI has Y"

// Errors
"Error saving message: [error-details]"
"Error loading chat history: [error-details]"
```

### Performance Metrics
- **Save Time**: Should be < 500ms for normal messages
- **Load Time**: Chat history should load < 2 seconds
- **Sync Accuracy**: UI and database message counts should match

## 🎯 Best Practices

### For Users
1. **Stay Connected**: Ensure stable internet for reliable saving
2. **Check Sync**: Look for sync warning notifications
3. **Regular Backups**: Export important chats periodically

### For Developers
1. **Error Handling**: Always handle database errors gracefully
2. **User Feedback**: Show clear notifications for sync issues
3. **Performance**: Monitor query performance and optimize as needed
4. **Testing**: Regularly run verification scripts

## 📚 Related Files

- `src/components/Chat.tsx` - Main chat component with persistence logic
- `src/lib/services/chatService.ts` - Database operations service
- `db/migrations/003_enhance_chat_schema.sql` - Database schema
- `scripts/verify-chat-persistence.js` - Verification script

## 🔮 Future Enhancements

- **Real-time Sync**: WebSocket-based real-time synchronization
- **Offline Support**: Local storage fallback for offline usage
- **Conflict Resolution**: Handle concurrent edits from multiple devices
- **Advanced Search**: Full-text search across chat history
- **Analytics**: Detailed usage analytics and insights