# Build Stage
FROM docker.arvancloud.ir/node:18-alpine AS build

WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies, including Vite
RUN npm install && ls -la node_modules/

# Copy the rest of the application files
COPY . .

# Build the application for production
RUN npm run build

# Development Stage
FROM docker.arvancloud.ir/node:18-alpine AS dev
WORKDIR /app
COPY --from=build /app ./
EXPOSE 5173
CMD ["npm", "run", "dev"]

# Production Stage
FROM docker.arvancloud.ir/nginx:alpine AS prod
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
