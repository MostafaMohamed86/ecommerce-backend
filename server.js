const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(cors());

// تحميل البيانات من db.json
const filePath = path.join(__dirname, "db.json");
let data = {};

function loadData() {
  console.log("📂 Loaded Data:", data);
  try {
    const jsonData = fs.readFileSync(filePath, "utf8");
    data = JSON.parse(jsonData);

    // تأكد إن كل الحقول موجودة، ولو مش موجودة حط قيم افتراضية
    if (!data.products) data.products = [];
    if (!data.categories) data.categories = [];
    if (!data.users) data.users = [];

    console.log("✅ db.json loaded successfully!");
  } catch (error) {
    console.error("❌ Error reading db.json:", error);
    data = { products: [], categories: [], users: [] };
  }
}

loadData();

// ✅ فحص جاهزية السيرفر
app.get("/", (req, res) => {
  res.send("🚀 Server is running!");
});

// ✅ API لجلب المنتجات
app.get("/products", (req, res) => {
  try {
    const { cat_prefix, id } = req.query;
    let filteredProducts = data.products || [];

    // فلترة حسب cat_prefix
    if (cat_prefix) {
      filteredProducts = filteredProducts.filter(
        (product) => product.cat_prefix === cat_prefix
      );
    }

    // فلترة حسب id
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

// ✅ API لجلب التصنيفات
app.get("/categories", (req, res) => {
  try {
    res.json(data.categories || []);
  } catch (error) {
    console.error("❌ Error fetching categories:", error);
    res.status(500).json({ message: "Error fetching categories" });
  }
});

// ✅ API لجلب المستخدمين
app.get("/users", (req, res) => {
  try {
    const { email, id } = req.query;
    let filteredUsers = data.users || [];

    // فلترة حسب email
    if (email) {
      filteredUsers = filteredUsers.filter((user) => user.email === email);
    }

    // فلترة حسب id
    if (id) {
      const ids = Array.isArray(id) ? id.map(Number) : [Number(id)];
      filteredUsers = filteredUsers.filter((user) => ids.includes(user.id));
    }

    res.json(filteredUsers);
  } catch (error) {
    console.error("❌ Error filtering users:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
});

// ✅ API للتسجيل
app.post("/register", (req, res) => {
  console.log("Received Body:", req.body); // ✅ اطبع البيانات قبل أي حاجة

  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({
      error: "Missing required fields (firstName, lastName, email, password)",
    });
  }

  const newUser = {
    id: Date.now(),
    firstName,
    lastName,
    email,
    password,
    created_at: new Date().toISOString(),
  };

  data.users.push(newUser);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

  res.status(201).json(newUser);
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: "Missing email or password",
    });
  }

  console.log("🔑 Received login request:", req.body);

  try {
    loadData(); // تأكد أن هذه الدالة تعمل بشكل صحيح

    const user = data.users.find(
      (user) => user.email === email && user.password === password
    );

    if (!user) {
      console.log("❌ User not found or incorrect password");
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const accessToken = `fake-jwt-token-${user.id}`;

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      accessToken,
    });

    console.log("✅ User logged in successfully:", user.email);
  } catch (err) {
    console.error("❌ Error during login:", err);
    res.status(500).json({ error: "Error during login" });
  }
});

// ✅ Self-ping كل 5 دقائق
setInterval(() => {
  axios
    .get(`http://localhost:${PORT}`)
    .then(() => console.log("🔁 Pinging server to keep it alive..."))
    .catch((err) => console.error("❌ Error pinging server:", err));
}, 5 * 60 * 1000);

// ✅ بدء السيرفر
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
