# build stage
FROM node:20 AS build

WORKDIR /app

COPY package.json package-lock.json ./

# Install dependencies with proper optional dependencies handling
RUN rm -rf node_modules package-lock.json && \
    npm install --legacy-peer-deps

COPY . .

# Build the application
RUN npm run build

# production stage
FROM node:20

WORKDIR /app
RUN npm i -g serve

COPY --from=build /app/dist ./dist

EXPOSE 5173
CMD ["serve", "-s", "dist", "-l", "5173"]
