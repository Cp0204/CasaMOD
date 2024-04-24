FROM alpine

ADD /app /app

RUN apk add --no-cache bash \
    && mkdir -p /var/lib/casaos/www \
    && mkdir -p /DATA/AppData/casamod

WORKDIR /app

ENTRYPOINT ["/app/run.sh", "start"]