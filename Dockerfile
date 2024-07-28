FROM node:18.18.2

# Set working directory inside the container
WORKDIR /backend

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev --no-fund --no-audit

# Copy the rest of the application code
COPY . .

# Set environment variables
ENV DB_HOST=${DB_HOST}
ENV DB_NAME=${DB_NAME}
ENV DB_USER=${DB_USER}
ENV DB_USER_PASSWORD=${DB_USER_PASSWORD}
ENV DB_PORT=${DB_PORT}
ENV JWT_SECRET=${JWT_SECRET}
ENV API_PORT=${API_PORT}

# Expose the port the app runs on
EXPOSE 3001

CMD [ "npm", "start" ]