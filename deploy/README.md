# First-beta deployment runbook

This runbook covers the manually controlled first deployment of KinetiQ on an
Oracle Cloud VPS. Build from a reviewed Git SHA; do not build from an arbitrary
working tree.

## VPS and HTTPS

Install security updates, Docker Engine/Compose, Nginx, and Certbot. Restrict
SSH to approved operator addresses and expose only SSH, 80, and 443. Copy
`deploy/nginx/kinetiq.conf` to the host, create `/var/www/certbot`, then issue
the certificate with:

```sh
sudo certbot certonly --webroot -w /var/www/certbot -d kinetiq.reyslash.com
sudo nginx -t
sudo systemctl reload nginx
sudo certbot renew --dry-run
```

The application ports bind to loopback only. Nginx is the sole public entry
point and supplies the request ID and forwarded headers.

## Build and start

```sh
git clone <repository-url> kinetiq
cd kinetiq
git checkout <reviewed-sha>
cp deploy/production.env.example deploy/production.env
# Edit production.env outside Git and set COMMIT_SHA to the reviewed SHA.
docker compose --env-file deploy/production.env -f compose.prod.yml config
docker compose --env-file deploy/production.env -f compose.prod.yml build --pull
docker compose --env-file deploy/production.env -f compose.prod.yml up -d
docker compose --env-file deploy/production.env -f compose.prod.yml ps
curl --fail http://127.0.0.1:3000/api/health/live
curl --fail http://127.0.0.1:3000/api/health/ready
curl --fail http://127.0.0.1:3001/health
```

The API and web images are separate, use Node 24, run as the unprivileged
`node` user, and contain no production `.env` file. Verify the image IDs and
the commit metadata before exposing the site.

## Database and email

Use a dedicated Neon production database with TLS and a least-privileged role.
Enable and verify Neon automated backups/PITR. Apply schema changes with:

```sh
docker compose --env-file deploy/production.env -f compose.prod.yml exec api \
  pnpm --filter api prisma:migrate:deploy
```

Reference data may be initialized only with a reviewed, idempotent seed
procedure. Never run `prisma migrate dev`, reset commands, or destructive seed
commands in production. Verify the Resend sender domain and email verification
through the HTTPS origin before inviting testers.

## Rollback

Keep the previous reviewed SHA and its Compose build available. Stop the
current application, check out the previous SHA, set `COMMIT_SHA`, rebuild and
restart both services, then verify all three health endpoints. Database changes
must be backward-compatible during the rollback window; use a forward database
fix instead of a destructive migration rollback.

## Scope after the first beta

External encrypted logical backups, monitoring and email alert infrastructure,
restore rehearsal, detailed RPO/RTO measurement, exhaustive incident
runbooks, automated deployment orchestration, and advanced operational
dashboards are intentionally deferred. Neon PITR, health checks, bounded logs,
and the application rollback procedure are first-beta requirements.

Branch protection and required checks remain operator actions: require the CI
workflow on `dev` and `main`, require review before merging to `main`, disable
force pushes, and allow production release only from a reviewed `main` commit.
