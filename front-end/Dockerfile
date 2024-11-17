# Use an official lightweight Node.js runtime as the base image
FROM node:18-alpine

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

ENV VITE_API="http://0.0.0.0:8000"

# Serve the application using serve
RUN npm i -g serve

# Expose port 3000 to the outside world
EXPOSE 3000

# Start the application
CMD ["serve", "-s", "dist"]
