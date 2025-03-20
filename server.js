// server.js

const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// ✅ تحميل البيانات من db.json مرة واحدة
const filePath = path.join(__dirname, "db.json");
let data = {};

function loadData() {
  try {
    const jsonData = fs.readFileSync(filePath, "utf8");
    data = JSON.parse(jsonData);
    console.log("✅ db.json loaded successfully!");
  } catch (error) {
    console.error("❌ Error reading db.json:", error);
    data = { products: [], categories: [], users: [] };
  }
}

// تحميل البيانات عند بدء السيرفر
loadData();

// 📝 API لجلب المنتجات
app.get("/products", (req, res) => {
  try {
    let { cat_prefix, id } = req.query;
    let filteredProducts = data.products || [];

    if (cat_prefix) {
      filteredProducts = filteredProducts.filter(
        (product) => product.cat_prefix === cat_prefix
      );
    }

    if (id) {
      const ids = Array.isArray(id) ? id.map(Number) : [Number(id)];
      filteredProducts = filteredProducts.filter((product) =>
        ids.includes(product.id)
      );
    }

    res.json(filteredProducts);
  } catch (error) {
    console.error("❌ Error filtering products:", error);
    res.status(500).json({ message: "Error reading products" });
  }
});

// 📝 API لجلب التصنيفات
app.get("/categories", (req, res) => {
  try {
    res.json(data.categories || []);
  } catch (error) {
    console.error("❌ Error fetching categories:", error);
    res.status(500).json({ message: "Error fetching categories" });
  }
});

// 📝 API لجلب المستخدمين
app.get("/users", (req, res) => {
  try {
    res.json(data.users || []);
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
});

// 📝 API لتسجيل مستخدم جديد
app.post("/register", (req, res) => {
  const { first_name, last_name, email, password } = req.body;

  console.log("Received registration request:", req.body);

  try {
    const newUser = {
      id: Date.now(),
      first_name,
      last_name,
      email,
      password,
      created_at: new Date().toISOString(),
    };

    data.users.push(newUser);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    console.log("User added successfully:", newUser);
    res.status(201).json(newUser);
  } catch (err) {
    console.error("❌ Error adding user:", err);
    res.status(500).json({ error: "Error adding user" });
  }
});

// 🚀 تشغيل السيرفر
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});
