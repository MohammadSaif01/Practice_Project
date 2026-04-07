# Cloudflare DNS and SSL Production Settings

## DNS Records

1. Add A record.

- Type: A
- Name: @
- IPv4: your_vps_or_origin_ip
- Proxy status: Proxied

1. Add CNAME record.

- Type: CNAME
- Name: www
- Target: your-root-domain
- Proxy status: Proxied

## SSL/TLS

1. SSL/TLS encryption mode: Full strict.
1. Always Use HTTPS: On.
1. Automatic HTTPS Rewrites: On.
1. Minimum TLS Version: 1.2.
1. TLS 1.3: On.

## Edge Certificates

1. Enable Universal SSL.
1. Enable HTTP Strict Transport Security after validation.
1. Configure HSTS.

- Max Age: 12 months
- Include subdomains: On
- Preload: On only if fully ready

## Caching

1. Caching level: Standard.
1. Browser Cache TTL: Respect Existing Headers.
1. Create cache rule to bypass API paths.

- If URI path starts with /api/
- Cache eligibility: Bypass cache

## Security

1. Security Level: Medium.
1. Bot Fight Mode: On optional.
1. WAF managed rules: On.
1. Rate limiting rule for /api/* if needed.

## Network

1. HTTP/2: On.
1. HTTP/3 QUIC: On.
1. Brotli: On.

## Page Rules or Redirect Rules

1. Redirect www to apex or apex to www based on your preference.
1. Keep one canonical domain for SEO consistency.
