# SSL Certificates

## Required Certificate

Place your DigitalOcean MySQL SSL certificate here as `ca-certificate.crt`.

The certificate content should be provided by DigitalOcean and looks like:

```
-----BEGIN CERTIFICATE-----
[Certificate content here]
-----END CERTIFICATE-----
```

## Security Note

⚠️ **IMPORTANT**: Never commit actual certificates to version control. 
Add `*.crt` and `*.pem` files to your `.gitignore`.

## Getting the Certificate

1. Download the CA certificate from your DigitalOcean database cluster dashboard
2. Save it as `ca-certificate.crt` in this directory
3. Ensure proper file permissions: `chmod 600 ca-certificate.crt` 