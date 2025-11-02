# Security Policy

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of Degens Against Decency seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### Please Do NOT:
- Open a public GitHub issue for security vulnerabilities
- Disclose the vulnerability publicly before it has been addressed
- Exploit the vulnerability beyond what is necessary to demonstrate it

### Please DO:
1. **Report via GitHub Security Advisory**: Use the "Security" tab in the repository to privately report the vulnerability
2. **Provide detailed information**: Include steps to reproduce, impact assessment, and any suggested fixes
3. **Give us reasonable time**: Allow us time to investigate and patch before any public disclosure

### What to Include in Your Report:
- Type of vulnerability (e.g., XSS, CSRF, injection, etc.)
- Full paths of affected source files
- Location of the affected source code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the vulnerability, including how an attacker might exploit it

## What to Expect:
- **Acknowledgment**: We'll acknowledge receipt of your vulnerability report within 48 hours
- **Communication**: We'll keep you informed about the progress of fixing the vulnerability
- **Credit**: With your permission, we'll credit you in the security advisory and release notes
- **Timeline**: We aim to patch critical vulnerabilities within 7 days, and other vulnerabilities within 30 days

## Security Best Practices for Deployment

### Environment Variables
- Always use strong, randomly generated `SESSION_SECRET` in production
- Never commit `.env` files or expose environment variables
- Rotate secrets regularly, especially after team member changes

### Discord OAuth
- Keep `DISCORD_CLIENT_SECRET` confidential
- Use HTTPS for all OAuth callbacks in production
- Set `cookie.secure: true` in production environments

### API Keys
- Protect your `OPENAI_API_KEY` and implement rate limiting
- Don't share API keys in issues, pull requests, or public forums
- Use environment variables, never hardcode keys

### WebSocket Security
- Validate all client messages before processing
- Implement rate limiting on WebSocket events
- Authenticate users before allowing game actions

### Session Management
- Use secure session storage (Redis) in production, not in-memory storage
- Set appropriate session timeouts
- Implement CSRF protection for state-changing operations

### Dependencies
- Regularly update dependencies with `npm audit` and `npm update`
- Review security advisories for critical packages
- Consider using automated tools like Dependabot

## Known Security Considerations

### 1. Deprecated Package
The `passport-discord` package is deprecated but still functional. We're monitoring for maintained alternatives and will migrate when a suitable replacement is stable.

### 2. In-Memory Sessions
Default configuration uses in-memory sessions, which is not suitable for production at scale. Use Redis or another persistent session store for production deployments.

### 3. WebSocket Rate Limiting
Currently, WebSocket rate limiting is not implemented. In production with many users, consider implementing rate limits to prevent abuse.

### 4. AI Content Moderation
AI-generated content is not filtered or moderated. For public deployments, consider implementing content filtering.

## Security Updates

Security updates will be released as patch versions (e.g., 1.0.1, 1.0.2) and announced via:
- GitHub Security Advisories
- GitHub Releases
- README.md updates

## Scope

The following are **in scope** for security reports:
- Server-side vulnerabilities (authentication, authorization, injection, etc.)
- Client-side vulnerabilities (XSS, CSRF, etc.)
- WebSocket security issues
- Session management vulnerabilities
- Dependency vulnerabilities with active exploits

The following are **out of scope**:
- Social engineering attacks
- Physical attacks against servers
- Denial of service attacks (we recommend rate limiting at infrastructure level)
- Vulnerabilities in third-party services (Discord, OpenAI, etc.)
- Issues already listed in "Known Security Considerations" above

## Recognition

We appreciate security researchers who help keep our community safe. With your permission, we will:
- Credit you in the security advisory
- Mention you in release notes
- Add you to a security contributors list in the README

Thank you for helping keep Degens Against Decency and its users safe!
