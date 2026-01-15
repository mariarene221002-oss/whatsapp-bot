FROM node:18-slim

# Instalar Chrome y dependencias para WhatsApp
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Configurar Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Directorio de trabajo
WORKDIR /usr/src/app

# Copiar archivos e instalar
COPY package*.json ./
RUN npm install

COPY . .

# Arrancar
CMD [ "node", "index.js" ]