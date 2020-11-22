FROM node:lts as dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --production

FROM node:lts-alpine
EXPOSE 80
COPY --from=dependencies /app ./
COPY ./src ./src
CMD ["npm", "start"]
