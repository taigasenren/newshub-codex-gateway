FROM node:22-bookworm-slim
RUN npm install -g @openai/codex@0.154.0
WORKDIR /app
COPY package.json rpc.mjs server.mjs ./
RUN mkdir -p /app/data /home/node/.codex && chown -R node:node /app /home/node/.codex
USER node
ENV NEWSHUB_BIND=0.0.0.0
ENV NEWSHUB_GATEWAY_DATA=/app/data
EXPOSE 8788
CMD ["node","server.mjs"]
