FROM docker.io/node:lts-alpine

ENV HOST=0.0.0.0
ENV PORT=3000

WORKDIR /app

RUN addgroup --system api-gateway && \
  adduser --system -G api-gateway api-gateway

COPY dist/apps/api-gateway api-gateway/

# verification step
RUN ls -la api-gateway/ && \
  [ -f api-gateway/main.js ] || (echo "main.js missing!" && exit 1)

RUN chown -R api-gateway:api-gateway .

CMD [ "node", "api-gateway/main.js" ]
