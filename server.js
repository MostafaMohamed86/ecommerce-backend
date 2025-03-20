
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());

// تحميل البيانات من `db.json` مرة واحدة عند تشغيل السيرفر
const filePath = path.join(__dirname, 'db.json');
let data = {};

function loadData() {
    try {
        const jsonData = fs.readFileSync(filePath, 'utf8');
        data = JSON.parse(jsonData);
        console.log("✅ db.json loaded successfully!");
    } catch (error) {
        console.error("❌ Error reading db.json:", error);
        data = { products: [], categories: [] }; // تجنب الكراش لو فيه خطأ
    }
}

// تحميل البيانات عند بدء السيرفر
loadData();

// **🚀 API لجلب المنتجات بناءً على cat_prefix أو id**
app.get('/products', (req, res) => {
    try {
        let { cat_prefix, id } = req.query;
        let filteredProducts = data.products || [];

        // فلترة حسب `cat_prefix`
        if (cat_prefix) {
            filteredProducts = filteredProducts.filter(product => product.cat_prefix === cat_prefix);
        }

        // فلترة حسب `id`
        if (id) {
            const ids = Array.isArray(id) ? id.map(Number) : [Number(id)];
            filteredProducts = filteredProducts.filter(product => ids.includes(product.id));
        }

        res.json(filteredProducts);
    } catch (error) {
        console.error("❌ Error filtering products:", error);
        res.status(500).json({ message: "Error reading products" });
    }
});

// **🚀 API لجلب التصنيفات**
app.get('/categories', (req, res) => {
    try {
        res.json(data.categories || []);
    } catch (error) {
        console.error("❌ Error fetching categories:", error);
        res.status(500).json({ message: "Error fetching categories" });
    }
});

// تشغيل السيرفر
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);

// server.js

const express = require("express");
const fs = require("fs");
const app = express();
const cors = require("cors");
require("dotenv").config();

// Middleware
app.use(cors());
app.use(express.json()); // عشان نقدر نقرأ الـ body

// مسار ملف JSON
const dbFilePath = "./db.json";

// دالة لإضافة مستخدم للـ JSON
const addUserToJson = (user) => {
  const data = JSON.parse(fs.readFileSync(dbFilePath, "utf8"));
  data.users.push(user);
  fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2));
};

// راوت التسجيل
app.post('/register', (req, res) => {
  const { first_name, last_name, email, password } = req.body;

  // طباعة البيانات اللي جاية من الـ Frontend
  console.log("Received registration request:", req.body);

  try {
    const newUser = {
      id: Date.now(), // بنخلي الـ id يكون رقم فريد
      first_name,
      last_name,
      email,
      password,
      created_at: new Date().toISOString(),
    };

    addUserToJson(newUser);

    console.log("User added successfully:", newUser);
    res.status(201).json(newUser);
  } catch (err) {
    console.error("Error adding user:", err);
    res.status(500).json({ error: 'Error adding user' });
  }
});

// شغل السيرفر
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);

})});
