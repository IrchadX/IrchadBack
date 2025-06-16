FROM node:20-slim

# Install Python, fonts, and other dependencies
RUN apt-get update && apt-get install -y \
    python3 python3-pip python3-venv \
    fonts-liberation \
    fonts-dejavu-core \
    fontconfig \
    && python3 -m venv /opt/venv \
    && /opt/venv/bin/pip install pandas scikit-learn python-dateutil numpy \
    && ln -s /opt/venv/bin/python /usr/bin/py \
    && fc-cache -f -v \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Add virtual environment to PATH so Python packages are available
ENV PATH="/opt/venv/bin:$PATH"

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci
RUN npx prisma generate

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]