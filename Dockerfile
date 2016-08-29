FROM node:6.4

ARG TAG

RUN mkdir -p /app
WORKDIR /app

ADD ["discord-gw2-sync-1.0.0.tgz", "/app"]
RUN mv package/* ./
RUN rmdir package
RUN mkdir /app/data
RUN npm --loglevel=warn install

ENTRYPOINT node /app