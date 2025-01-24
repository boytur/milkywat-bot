# Stage 1: Build the React app
FROM node:18 as build

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all source files to the working directory
COPY . .

# Build the app for production
RUN npm run build

# Stage 2: Serve the app with Nginx
FROM nginx:stable-alpine

# Copy the built app from the previous stage to Nginx's web directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY .nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]