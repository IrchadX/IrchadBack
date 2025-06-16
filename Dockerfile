FROM node:20-slim

# Install Python and required packages
RUN apt-get update && apt-get install -y python3 python3-pip && \
    pip3 install --break-system-packages pandas scikit-learn python-dateutil numpy && \
    ln -s /usr/bin/python3 /usr/bin/py && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci
RUN npx prisma generate

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]