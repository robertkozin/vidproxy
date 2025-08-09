FROM browserless/chrome:latest

WORKDIR /app

# Copy bun from oven/bun image
COPY --from=oven/bun /usr/local/bin/bun /usr/local/bin/bun

COPY package.json bun.lock ./
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
RUN bun install --frozen-lockfile --production

COPY . .

ENV NODE_ENV=production
EXPOSE 3000
CMD ["bun", "run", "src/index.ts"]
