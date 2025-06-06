# Supabase Setup Guide

## 🚀 Quick Start

### 1. Configure Environment Variables
Update `.env` with your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Create Database Schema
Execute the SQL in `supabase-schema.sql` in your Supabase dashboard:
1. Go to **SQL Editor** in your Supabase dashboard
2. Copy and paste the entire content of `supabase-schema.sql`
3. Click **Run** to create all tables, policies, and functions

### 3. Test Connection
Visit `/test` in your application to verify:
- ✅ Supabase client connection
- ✅ Database connectivity 
- ✅ Authentication functionality

## 📊 Database Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles extending auth.users |
| `quizzes` | Quiz content and metadata |
| `sessions` | Live quiz sessions |
| `participants` | Students in sessions |
| `responses` | Quiz answers and scoring |

## 🔒 Security Features

- **Row Level Security (RLS)**: Enabled on all tables
- **Role-based Access**: Teachers, students, and admins
- **Real-time Subscriptions**: Live updates for sessions
- **Anonymous Auth**: Students can join without signup

## 🎯 Key Features

- **Real-time Quiz Sessions**: Live participation tracking
- **QR Code Session Joining**: Easy student access
- **Automatic Scoring**: Instant feedback
- **Session Analytics**: Detailed performance metrics
- **Apple-style UI**: Dark mode with glassmorphism

## 🛠️ Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Test Supabase connection
http://localhost:3000/test

# Build for production
npm run build
```

## 📱 User Flows

### Teacher Flow
1. Register/Login → `/login`
2. Create Quizzes → `/admin/quizzes`
3. Start Session → `/admin/sessions`
4. Monitor Live → `/teacher/session/:id`

### Student Flow
1. Join Session → `/student` (enter code)
2. Take Quiz → `/student/quiz/:sessionId`
3. View Results → Real-time feedback

## 🔧 Troubleshooting

### Connection Issues
- Verify environment variables
- Check Supabase project status
- Ensure database schema is created

### Authentication Problems
- Confirm auth providers are enabled
- Check email confirmation settings
- Verify RLS policies

### Real-time Not Working
- Enable realtime on tables in dashboard
- Check subscription filters
- Verify network connectivity
### Session Management Issues
If a teacher account cannot start or control a session because of row level security, run the SQL script `allow-all-teachers-manage-sessions.sql` in the Supabase SQL Editor.
This policy lets any user with role `teacher` manage all sessions. Remember to revert the policy before production.
