FROM node:20-slim

# Install system dependencies including fonts and Python
RUN apt-get update && apt-get install -y \
    python3 python3-pip python3-venv \
    fonts-liberation \
    fonts-dejavu-core \
    fonts-noto \
    fonts-noto-core \
    fonts-roboto \
    fontconfig \
    libfontconfig1 \
    ghostscript \
    && python3 -m venv /opt/venv \
    && /opt/venv/bin/pip install pandas scikit-learn python-dateutil numpy \
    && ln -s /opt/venv/bin/python /usr/bin/py \
    && fc-cache -fv \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Add virtual environment to PATH
ENV PATH="/opt/venv/bin:$PATH"

# Set font and locale environment variables
ENV FONTCONFIG_PATH=/etc/fonts
ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8

WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Create non-root user for security
RUN groupadd -r appgroup && useradd -r -g appgroup appuser
RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 3000

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["npm", "run", "start:prod"]