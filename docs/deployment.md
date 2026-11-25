# Deployment Notes

Deploy the Registrar frontend and backend as separate services. Use a managed PostgreSQL database or a secured PostgreSQL server. Configure environment variables in the hosting provider; do not upload `.env` files.

## Backend environment variables

- `PORT`: backend listening port (default `5001`)
- `DATABASE_URL`: PostgreSQL connection URL
- `JWT_SECRET`: long random JWT signing secret
- `JWT_EXPIRES_IN`: token lifetime (default `8h`)
- `CORS_ORIGINS`: comma-separated allowed frontend origins
- `ADMIN_USERNAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`: initial administrator account settings
- `REGISTRAR_SERVICE_KEY`: secret used by authorized module backends

## Frontend environment variables

- `VITE_API_URL`: deployed Registrar API base URL ending in `/api`

## Deployment checks

1. Provision PostgreSQL and configure `DATABASE_URL`.
2. Run `npm run db:setup` once against the production database.
3. Run `npm run admin:init` with a secure administrator password.
4. Deploy the backend and verify `/health`.
5. Set `VITE_API_URL` to the deployed HTTPS API base URL and deploy the frontend.
6. Add the exact frontend origin to `CORS_ORIGINS`.
7. Configure the Library backend with the Registrar HTTPS URL and matching service key.
8. Verify that the Library receives only the approved student projection.

Do not expose the PostgreSQL port publicly. Restrict database access to the backend service and rotate credentials if they are accidentally exposed.
