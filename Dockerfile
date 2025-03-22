# استخدم نسخة حديثة من Node.js
FROM node:18

# حدد مجلد العمل داخل الحاوية
WORKDIR /app

# انسخ ملفات الـ package.json و package-lock.json
COPY package*.json ./

# ثبّت التبعيات (dependencies)
RUN npm install

# انسخ باقي ملفات المشروع
COPY . .

# حدد البورت اللي هيشتغل عليه السيرفر
EXPOSE 8080

# شغّل السيرفر
CMD ["npm", "start"]
