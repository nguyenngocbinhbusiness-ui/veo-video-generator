# Simple production Dockerfile - serves pre-built Vite assets
# Run `npm run build` locally first, then build this Dockerfile

FROM nginx:1.25-alpine

# Copy nginx config
COPY docker/nginx.conf /etc/nginx/nginx.conf

# Copy pre-built static files from local dist/renderer
COPY dist/renderer /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]