FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# App Platform will set the PORT environment variable
# We're not hardcoding a specific port to expose
EXPOSE ${PORT:-3000}

CMD ["npm", "start"] 