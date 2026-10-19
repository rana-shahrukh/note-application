# Stage 1: Install production dependencies
FROM node:22-alpine AS dependencies

WORKDIR /app

COPY package.json ./

RUN npm install --omit=dev


# Stage 2: Create the runtime image
FROM node:22-alpine AS runtime

ENV NODE_ENV=production

WORKDIR /app

# Copy dependencies from the first stage
COPY --from=dependencies --chown=node:node /app/node_modules ./node_modules

# Copy application files
COPY --chown=node:node package.json ./

COPY --chown=node:node app.js ./

# Run as a non-root user
USER node

EXPOSE 3000

CMD ["npm", "start"]
