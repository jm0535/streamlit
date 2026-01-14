# Privacy Policy and Data Handling

## Overview

Streamlit Audio Processing is designed with privacy as a core principle. This document outlines how we handle your data and ensure your privacy.

## Data Storage and Privacy

### Local Data Storage

- **All audio files and project data are stored locally** on your device using IndexedDB
- No audio files, recordings, or project data are ever uploaded to our servers
- Your data never leaves your browser unless explicitly exported by you

### Authentication Data Only

- Only user credentials (email, password, profile information) are stored in Supabase PostgreSQL
- Authentication is handled exclusively by Supabase, a secure HIPAA-compliant service
- No audio content, metadata, or processing results are stored in Supabase

### Data That Never Leaves Your Device

- Audio files (WAV, MP3, FLAC, etc.)
- Recording data
- Analysis results
- Project settings and configurations
- Processing history
- User preferences and settings

### Data That Is Stored in Supabase (Authentication Only)

- Email address
- Encrypted password
- Profile name and avatar (if provided)
- Account creation and last login timestamps

## Security Measures

### Local Storage Security

- IndexedDB is sandboxed per domain and browser
- Data is encrypted at the browser level
- No cross-site data access is possible

### Authentication Security

- Passwords are hashed and salted using industry-standard methods
- All authentication communications use HTTPS/TLS
- Session tokens are short-lived and automatically refreshed
- Multi-factor authentication is available

### Network Security

- All communications use HTTPS/TLS 1.3
- Content Security Policy headers prevent XSS attacks
- No third-party analytics or tracking scripts

## Data Deletion and Retention

### Local Data

- Users can delete all local data at any time through the app interface
- Clearing browser data will remove all stored audio files and projects
- Data persists until explicitly deleted by the user

### Authentication Data

- Users can delete their account at any time
- Account deletion immediately removes all authentication data from Supabase
- No data is retained after account deletion

## Third-Party Services

### Supabase (Authentication Only)

- Purpose: User authentication and account management
- Data stored: Email, encrypted password, profile information
- Privacy policy: <https://supabase.com/privacy>
- No audio or processing data is stored in Supabase

### Vercel (Hosting)

- Purpose: Application hosting and deployment
- Data stored: Deployment logs, performance metrics (no user content)
- Privacy policy: <https://vercel.com/legal/privacy-policy>
- No user data is processed or stored by Vercel

## Compliance

### GDPR Compliance

- Right to access: Users can export all their data locally
- Right to rectification: Users can modify their profile information
- Right to erasure: Users can delete their account and all associated data
- Right to portability: Users can export their projects and audio files
- Right to object: Users can opt-out of any data processing

### Data Protection

- All data processing is transparent and documented
- No data is sold or shared with third parties
- No behavioral tracking or profiling
- Minimal data collection principle strictly followed

## Technical Implementation

### IndexedDB Schema

```text
streamlit_audio_db/
├── audioFiles/     # Local audio file storage
├── projects/       # Local project data
├── settings/       # Local user preferences
└── cache/          # Temporary processing cache
```

### Supabase Schema (Authentication Only)

```text
auth.users/         # User authentication data
auth.sessions/      # Active sessions
profiles/          # User profile information
```

## Best Practices for Users

1. **Regular Backups**: Export important projects regularly
2. **Browser Security**: Keep your browser updated and use strong passwords
3. **Device Security**: Secure your device with encryption and strong authentication
4. **Network Security**: Use secure networks when accessing the application

## Contact and Support

For privacy-related questions or concerns:

- Email: privacy@streamlit.in4metrix.dev
- GitHub Issues: <https://github.com/your-repo/issues>

## Changes to This Policy

We may update this privacy policy occasionally. Users will be notified of significant changes through the application interface.

Last updated: January 2024
