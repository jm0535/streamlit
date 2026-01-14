# Deployment Guide for Streamlit Audio Processing

## Overview
This guide covers deploying the Streamlit Audio Processing application to Vercel with Supabase authentication.

## Prerequisites

### Required Accounts
- GitHub account with repository access
- Vercel account (connected to GitHub)
- Supabase account (for authentication)

### Required Tools
- Node.js 20+
- npm or yarn
- Git

## Environment Setup

### 1. Clone and Install
```bash
git clone <repository-url>
cd streamlit
npm install
```

### 2. Environment Variables
Copy the environment template and configure:
```bash
cp env-template.txt .env.local
```

Configure the following variables:
```env
# App Configuration
NEXT_PUBLIC_APP_URL=https://streamlit.in4metrix.dev
NEXT_PUBLIC_APP_NAME=Streamlit Audio Processing

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Supabase Setup

### 1. Create Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note the project URL and anon key

### 2. Configure Authentication
1. In Supabase Dashboard → Authentication → Settings
2. Configure site URL: `https://streamlit.in4metrix.dev`
3. Add redirect URLs:
   - `https://streamlit.in4metrix.dev/auth/callback`
   - `http://localhost:3000/auth/callback` (for development)

### 3. Create Profiles Table
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  website TEXT,
  bio TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);
```

## Vercel Setup

### 1. Connect Repository
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New..." → "Project"
3. Import your GitHub repository

### 2. Configure Environment Variables
In Vercel project settings → Environment Variables:
```
NEXT_PUBLIC_APP_URL=https://streamlit.in4metrix.dev
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Configure Domain
1. In project settings → Domains
2. Add custom domain: `streamlit.in4metrix.dev`
3. Follow DNS configuration steps

### 4. Deploy
1. Trigger deployment (automatic on push to main)
2. Monitor build logs for any errors
3. Test the deployed application

## GitHub Actions Setup

### 1. Configure Secrets
In GitHub repository → Settings → Secrets and variables → Actions:
```
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id
VERCEL_TOKEN=your_vercel_token
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
LHCI_GITHUB_APP_TOKEN=your_lhci_token (optional)
```

### 2. Enable Actions
- The `.github/workflows/deploy.yml` will automatically run on pushes
- Includes linting, type checking, security scans, and deployment

## Local Development

### 1. Environment Setup
```bash
cp env-template.txt .env.local
# Configure your local environment variables
```

### 2. Run Development Server
```bash
npm run dev
```
The application will be available at `http://localhost:3000`

### 3. Local Storage Testing
- Local storage uses IndexedDB in your browser
- Data persists between sessions on the same device
- Clear browser data to reset local storage

## Security Considerations

### 1. Data Privacy
- All audio data is stored locally using IndexedDB
- Only authentication data is stored in Supabase
- No audio content ever leaves the user's device

### 2. Security Headers
The application includes security headers:
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: origin-when-cross-origin
- Permissions-Policy: camera=(), microphone=(), geolocation=()

### 3. HTTPS Only
- Production deployment uses HTTPS exclusively
- All authentication communications are encrypted
- No mixed content warnings

## Monitoring and Maintenance

### 1. Vercel Analytics
- Monitor performance and usage
- Track error rates and response times
- Set up alerts for issues

### 2. Supabase Monitoring
- Monitor authentication events
- Track user signups and logins
- Set up security alerts

### 3. GitHub Actions
- Automated testing on each push
- Security scanning
- Performance testing with Lighthouse

## Troubleshooting

### Common Issues

#### Build Failures
- Check environment variables in Vercel
- Verify Node.js version compatibility
- Review build logs for specific errors

#### Authentication Issues
- Verify Supabase configuration
- Check redirect URLs in Supabase settings
- Ensure environment variables are correctly set

#### Local Storage Issues
- Clear browser cache and IndexedDB
- Check browser console for errors
- Verify IndexedDB permissions

#### Performance Issues
- Monitor Vercel function execution time
- Check bundle size with Next.js analyzer
- Optimize images and assets

### Getting Help
- Check GitHub Issues for known problems
- Review Vercel and Supabase documentation
- Contact support for platform-specific issues

## Post-Deployment Checklist

- [ ] Application loads correctly at custom domain
- [ ] Authentication works (signup, login, logout)
- [ ] Local storage functions properly
- [ ] All audio features work in production
- [ ] Security headers are present
- [ ] HTTPS is enforced
- [ ] Performance metrics are acceptable
- [ ] Error monitoring is configured
- [ ] Backup procedures are documented
- [ ] Privacy policy is accessible

## Scaling Considerations

### Vercel Scaling
- Automatic scaling included
- Monitor function execution time
- Consider edge functions for global users

### Supabase Scaling
- Monitor user growth
- Consider connection pooling
- Implement rate limiting if needed

### Local Storage Optimization
- Implement data cleanup routines
- Monitor IndexedDB quota usage
- Provide export/import functionality

## Updates and Maintenance

### Regular Tasks
- Update dependencies monthly
- Review security advisories
- Monitor performance metrics
- Update documentation

### Deployment Process
1. Test changes in development
2. Create pull request for review
3. Automated tests run on PR
4. Merge to main triggers deployment
5. Monitor deployment and rollback if needed
