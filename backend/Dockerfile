# backend/Dockerfile

# Use a specific Node.js version for stability
FROM node:20-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
# This means npm install won't run again if only source code changes
COPY package*.json ./

# Install dependencies
RUN npm install --production
# If you have dev dependencies for build steps or testing, use:
# RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 5000

# Set environment variables for production
ENV NODE_ENV=production
# These can be overridden at runtime or in docker-compose.yml
# ENV DB_HOST=db
# ENV DB_USER=root
# ENV DB_PASSWORD=password
# ENV DB_NAME=afaq_portfolio
# ENV JWT_SECRET=your_production_secret
# ENV FRONTEND_URL=https://your-portfolio.com

# Command to run the application
CMD ["node", "src/server.js"]