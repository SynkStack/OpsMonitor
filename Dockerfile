# Node 22 is required for the built-in node:sqlite
FROM node:22-alpine
WORKDIR /app

# Copy package files first so Docker caches the install layer
COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src
COPY fake-target ./fake-target

# Folder for the SQLite file, owned by the non-root user
RUN mkdir /data && chown node:node /data

ENV PORT=3000
EXPOSE 3000
USER node
CMD ["node", "src/server.js"]