FROM node:22 AS backend

WORKDIR /app

# Copy package.json และ package-lock.json
COPY ./report-server/package.json ./report-server/package-lock.json ./

# ติดตั้ง dependencies
RUN npm install

# Copy ไฟล์ทั้งหมดในโฟลเดอร์ report-server
COPY . .

# Build โปรเจกต์ TypeScript
RUN npm run build

# รันแอปพลิเคชัน
CMD ["node", "./dist/index.js"]
