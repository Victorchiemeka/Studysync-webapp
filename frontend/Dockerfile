# ./frontend/Dockerfile (for the frontend)

# Stage 1: Build the React application
FROM node:18 AS build
WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve the app with Nginx
FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html
# If you have a custom nginx config, you would copy it here
# COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]