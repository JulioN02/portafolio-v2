# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 2.x     | :white_check_mark: |
| 1.x     | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **Do NOT** create a public GitHub issue for security vulnerabilities
2. Send a private report to the maintainers
3. Include as much detail as possible:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We aim to respond within 48 hours and will work with you to:

- Confirm the vulnerability
- Assess the impact
- Determine the fix timeline
- Notify affected users if necessary

## Security Best Practices

When deploying this application:

1. **Environment Variables**: Never commit `.env` files
2. **JWT Secret**: Use a strong, random secret (minimum 32 characters)
3. **Database**: Use strong credentials and enable SSL in production
4. **CORS**: Configure allowed origins explicitly in production
5. **HTTPS**: Always use HTTPS in production
6. **Rate Limiting**: Implement rate limiting for public endpoints

## Dependencies

This project uses Dependabot to keep dependencies updated and secure.
