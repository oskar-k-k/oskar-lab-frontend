FROM node:22-bookworm-slim AS build
WORKDIR /workspace
COPY . .
ARG PUBLIC_URL
ENV NEXT_TELEMETRY_DISABLED=1 AUTH_URL=${PUBLIC_URL} AUTH_PLATFORM_URL=${PUBLIC_URL}
ENV NEXT_PUBLIC_API_URL=http://backend:8080
ENV APP_CHESS_URL=http://chess:3000 APP_CLOTH_LAB_URL=http://cloth-lab:3000 APP_NEON_VAULT_URL=http://neon-vault:3000 APP_PORTFOLIO_URL=http://portfolio:3000 APP_CORE_DESIGN_URL=http://core-design:3000 APP_WORKOUT_URL=http://workout:3000
RUN test -n "$PUBLIC_URL" && npm ci && npm run check

FROM node:22-bookworm-slim
WORKDIR /app
# Core & Design reads shared TypeScript sources at runtime, including the parser.
COPY --from=build --chown=node:node /workspace /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 NODE_OPTIONS=--max-old-space-size=192
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=10s --start-period=45s --retries=5 CMD node -e 'fetch("http://127.0.0.1:3000" + (process.env.APP_NAME === "oskar-lab" ? "/" : "/apps/" + process.env.APP_NAME)).then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))'
CMD ["sh", "-c", "cd /app/apps/$APP_NAME && exec node ../../node_modules/next/dist/bin/next start --hostname 0.0.0.0 --port 3000"]
