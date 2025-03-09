const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 5000;

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
});
