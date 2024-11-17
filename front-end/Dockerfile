# Use an official lightweight Node.js runtime as the base image
FROM node:18-alpine AS build

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm config set registry https://registry.yarnpkg.com
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Build the application for production
RUN npm run build

# Use Nginx to serve the application
FROM nginx:alpine

# Copy built files from the previous stage to Nginx's default html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy a custom nginx configuration file (optional)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for Nginx
EXPOSE 80
