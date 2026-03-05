FROM node:22-alpine

LABEL maintainer="Nightscout Contributors"

WORKDIR /opt/app
ADD . /opt/app

# Install Google Chrome for Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

RUN apt-get update && apt-get install gnupg wget -y && \
  wget --quiet --output-document=- https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /etc/apt/trusted.gpg.d/google-archive.gpg && \
  sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' && \
  apt-get update && \
  apt-get install google-chrome-stable -y --no-install-recommends && \
  rm -rf /var/lib/apt/lists/*

# TODO: We should be able to do `RUN npm install --only=production`.
# For this to work, we need to copy only package.json and things needed for `npm`'s to succeed.
# TODO: Do we need to re-add `npm audit fix`? Or should that be part of a development process/stage?
RUN npm ci --cache /tmp/empty-cache --omit=optional --force && \
  npm run postinstall && \
  npm run env && \
  rm -rf /tmp/*
  # TODO: These should be added in the future to correctly cache express-minify content to disk
  # Currently, doing this breaks the browser cache.
  # mkdir /tmp/public && \
  # chown node:node /tmp/public

USER node
EXPOSE 1337

CMD ["node", "lib/server/server.js"]
