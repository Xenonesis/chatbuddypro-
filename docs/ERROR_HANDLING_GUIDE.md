# Error Handling Guide

This guide covers the enhanced error handling system implemented in ChatBuddy to provide better user experience and debugging capabilities.

## Overview

The error handling system provides:
- **Centralized error management** with consistent categorization
- **User-friendly error messages** with actionable suggestions
- **Automatic retry mechanisms** for transient errors
- **Enhanced debugging** with detailed error information
- **Type-safe error handling** with TypeScript support

## Core Components

### 1. Error Handler Library (`src/lib/errorHandler.ts`)

The main error handling library provides:

```typescript
// Error types and interfaces
type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';
type ErrorCategory = 'network' | 'authentication' | 'authorization' | 'validation' | 'api_key' | 'database' | 'export' | 'import' | 'unknown';

// Core functions
function analyzeError(error: Error): ErrorAnalysis
function handleError(error: Error, options?: ErrorHandlerOptions): ErrorAnalysis
function withErrorHandling<T>(operation: () => Promise<T>, options?: ErrorHandlerOptions): Promise<T | null>
function withRetry<T>(operation: () => Promise<T>, options?: RetryOptions): Promise<T | null>
```

### 2. Error Handler Hook (`src/hooks/useErrorHandler.ts`)

React hook for convenient error handling in components:

```typescript
const { 
  handleError, 
  createError, 
  withErrorHandling, 
  withRetry,
  showErrorToast,
  showSuccessToast 
} = useErrorHandler({ 
  context: 'MyComponent',
  debugMode: false 
});
```

### 3. Error Handler Component (`src/components/ui-custom/ErrorHandler.tsx`)

Reusable UI component for displaying errors:

```typescript
<ErrorHandler 
  error={error}
  analysis={analysis}
  onRetry={() => retryOperation()}
  onDismiss={() => setError(null)}
  compact={false}
/>
```

## Error Categories

| Category | Description | Examples |
|----------|-------------|----------|
| `network` | Connection and network issues | Fetch failures, timeouts |
| `authentication` | User authentication problems | Invalid tokens, expired sessions |
| `authorization` | Permission and access issues | Insufficient permissions |
| `validation` | Input validation errors | Missing required fields |
| `api_key` | API key related problems | Invalid or missing API keys |
| `database` | Database operation failures | Query errors, connection issues |
| `export` | Data export failures | File generation errors |
| `import` | Data import failures | File parsing errors |
| `unknown` | Unclassified errors | Unexpected errors |

## Error Severity Levels

| Severity | Description | UI Treatment |
|----------|-------------|--------------|
| `low` | Minor issues, user can continue | Blue theme, short duration |
| `medium` | Moderate issues, may affect functionality | Yellow theme, medium duration |
| `high` | Serious issues, requires attention | Orange theme, longer duration |
| `critical` | Critical failures, blocks functionality | Red theme, persistent |

## Usage Examples

### Basic Error Handling

```typescript
import { useErrorHandler } from '@/hooks/useErrorHandler';

function MyComponent() {
  const { handleError, showSuccessToast } = useErrorHandler({
    context: 'MyComponent'
  });

  const handleAction = async () => {
    try {
      await riskyOperation();
      showSuccessToast('Operation completed successfully');
    } catch (error) {
      handleError(error as Error);
    }
  };
}
```

### With Error Wrapper

```typescript
const { withErrorHandling } = useErrorHandler();

const result = await withErrorHandling(
  async () => {
    return await apiCall();
  },
  {
    fallback: null,
    onError: (error, analysis) => {
      // Custom error handling
      console.log('Error occurred:', analysis.userMessage);
    }
  }
);
```

### With Retry Logic

```typescript
const { withRetry } = useErrorHandler();

const result = await withRetry(
  async () => {
    return await unreliableApiCall();
  },
  {
    maxRetries: 3,
    delay: 1000
  }
);
```

### Creating Enhanced Errors

```typescript
import { createEnhancedError } from '@/lib/errorHandler';

throw createEnhancedError('Invalid API key', {
  category: 'api_key',
  severity: 'high',
  userMessage: 'Please check your API key in settings',
  suggestions: [
    'Verify your API key is correct',
    'Check if the API key has expired',
    'Ensure you have sufficient quota'
  ],
  retryable: false
});
```

## Implementation in UserMenu Export

The UserMenu export functionality has been enhanced with:

1. **Proper error categorization** - Network, authentication, and export errors are properly classified
2. **User-friendly messages** - Clear, actionable error messages for users
3. **Debug mode integration** - Detailed technical information when debug mode is enabled
4. **Automatic suggestions** - Context-aware suggestions for resolving issues
5. **Retry capabilities** - Automatic retry for transient errors

### Before vs After

**Before:**
```typescript
try {
  await exportData();
  toast({ title: 'Success' });
} catch (error) {
  console.error('Export error:', error);
  toast({ 
    title: 'Error', 
    description: 'Failed to export data',
    variant: 'destructive' 
  });
}
```

**After:**
```typescript
const result = await withErrorHandling(
  async () => {
    return await exportData();
  },
  {
    context: 'UserMenu.handleExportData',
    onError: (error, analysis) => {
      // Enhanced error handling with suggestions
      showDetailedError(error, analysis);
    }
  }
);

if (result) {
  showSuccessToast('Data exported successfully');
}
```

## Best Practices

### 1. Always Provide Context
```typescript
const { handleError } = useErrorHandler({ 
  context: 'ComponentName.functionName' 
});
```

### 2. Use Appropriate Error Categories
```typescript
// For API key issues
throw createEnhancedError('Invalid API key', { category: 'api_key' });

// For network issues
throw createEnhancedError('Connection failed', { category: 'network' });
```

### 3. Provide Actionable Suggestions
```typescript
throw createEnhancedError('Database connection failed', {
  category: 'database',
  suggestions: [
    'Check your internet connection',
    'Try refreshing the page',
    'Contact support if the issue persists'
  ]
});
```

### 4. Use Retry for Transient Errors
```typescript
// Good for network requests, database operations
const result = await withRetry(operation, { maxRetries: 3 });
```

### 5. Don't Retry for Permanent Errors
```typescript
// Don't retry validation errors, authentication failures
throw createEnhancedError('Invalid input', { 
  category: 'validation',
  retryable: false 
});
```

## Testing Error Handling

### Manual Testing
1. **Network errors**: Disconnect internet and try operations
2. **API key errors**: Use invalid API keys
3. **Validation errors**: Submit forms with invalid data
4. **Database errors**: Test with database connectivity issues

### Debug Mode
Enable debug mode in components to see:
- Detailed error information
- Stack traces
- Error categorization
- Suggested solutions

## Future Enhancements

1. **Error Reporting Service**: Integration with services like Sentry
2. **Error Analytics**: Track error patterns and frequencies
3. **User Feedback**: Allow users to report errors
4. **Error Recovery**: Automatic recovery mechanisms
5. **Offline Support**: Handle offline scenarios gracefully

## Migration Guide

To migrate existing error handling:

1. **Replace try-catch blocks** with `withErrorHandling`
2. **Use error categories** instead of generic error messages
3. **Add context information** for better debugging
4. **Implement retry logic** for appropriate operations
5. **Use the ErrorHandler component** for consistent UI

## Troubleshooting

### Common Issues

**Error: "Cannot read property of undefined"**
- Ensure all imports are correct
- Check TypeScript compilation
- Verify error handler initialization

**Toast notifications not showing**
- Ensure `useToast` hook is properly configured
- Check if toast provider is wrapped around the component
- Verify error severity levels

**Retry not working**
- Check if error is marked as `retryable: true`
- Verify retry configuration
- Ensure operation is idempotent

## Contributing

When adding new error handling:

1. **Follow the established patterns**
2. **Add appropriate tests**
3. **Update documentation**
4. **Consider user experience**
5. **Test in different scenarios**

---

For more information, see the implementation files:
- `src/lib/errorHandler.ts` - Core error handling logic
- `src/hooks/useErrorHandler.ts` - React hook for components
- `src/components/ui-custom/ErrorHandler.tsx` - UI component
- `src/components/ui-custom/UserMenu.tsx` - Example implementation