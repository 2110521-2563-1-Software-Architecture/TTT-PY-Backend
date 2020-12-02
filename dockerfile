FROM node:alpine

COPY . /root
WORKDIR /root

RUN npm install

EXPOSE 8081

CMD npm start
