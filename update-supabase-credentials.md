# Update Supabase Credentials

Create or update your `.env.local` file with the following credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://gphdrsfbypnckxbdjjap.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwaGRyc2ZieXBuY2t4YmRqamFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2MDAwMjIsImV4cCI6MjA1OTE3NjAyMn0.skYsz1EJGdRwo5RW6HLljpy-D2KcQmBPJHYXb7MeyJw
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwaGRyc2ZieXBuY2t4YmRqamFwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzYwMDAyMiwiZXhwIjoyMDU5MTc2MDIyfQ.7gLACC4EsPkvDI2IbwGjeftBu5KwYfzujBT5KzEL6sQ
```

After updating these credentials, run the following commands to ensure your database is properly set up:

```
npm run check-database
npm run fix-ai-providers
npm run migrate-api-keys
```

Verify the connection to Supabase:

```
node verify-supabase.js
``` 