#!/bin/bash
# Generate self-signed SSL certificate for local / intranet FDIM Docker deployment
set -e

SSL_DIR="./docker/nginx/ssl"
mkdir -p "$SSL_DIR"

if [ -f "$SSL_DIR/cert.pem" ] && [ -f "$SSL_DIR/key.pem" ]; then
    echo "[FDIM] SSL certificates already exist in $SSL_DIR"
    exit 0
fi

echo "[FDIM] Generating 2048-bit RSA self-signed SSL certificate for FDIM deployment..."

openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \
    -keyout "$SSL_DIR/key.pem" \
    -out "$SSL_DIR/cert.pem" \
    -subj "/C=DE/ST=State/L=City/O=FDIM Workstation Suite/CN=fdim.local" \
    -addext "subjectAltName=DNS:fdim.local,DNS:localhost,IP:127.0.0.1"

echo "[FDIM] SSL Certificate and Key generated successfully in $SSL_DIR"
echo "  Certificate: $SSL_DIR/cert.pem"
echo "  Private Key: $SSL_DIR/key.pem"
