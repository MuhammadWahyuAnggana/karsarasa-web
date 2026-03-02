import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import multer from "multer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database("karsarasa.db");

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    image TEXT,
    price TEXT,
    category TEXT
  );

  CREATE TABLE IF NOT EXISTS team (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT,
    image TEXT
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

// Seed initial data if empty
const productCount = db.prepare("SELECT count(*) as count FROM products").get() as { count: number };
if (productCount.count === 0) {
  const insertProduct = db.prepare("INSERT INTO products (name, description, image, price, category) VALUES (?, ?, ?, ?, ?)");
  insertProduct.run('Kripik Tempe Artisanal', 'Dibuat dengan ragi pilihan dan bumbu rahasia warisan keluarga.', 'https://picsum.photos/seed/tempeh/800/1000', 'Rp 25.000', 'Gurih');
  insertProduct.run('Sambal Matah Jar', 'Kesegaran cabai dan bawang pilihan dalam satu kemasan praktis.', 'https://picsum.photos/seed/sambal/800/1000', 'Rp 35.000', 'Pedas');
  insertProduct.run('Kue Lumpur Modern', 'Tekstur lembut dengan sentuhan topping kekinian yang memanjakan lidah.', 'https://picsum.photos/seed/cake/800/1000', 'Rp 15.000', 'Manis');
  insertProduct.run('Es Kopi Karsa', 'Perpaduan biji kopi lokal dengan gula aren organik.', 'https://picsum.photos/seed/coffee/800/1000', 'Rp 20.000', 'Minuman');
}

const teamCount = db.prepare("SELECT count(*) as count FROM team").get() as { count: number };
if (teamCount.count === 0) {
  const insertTeam = db.prepare("INSERT INTO team (name, role, image) VALUES (?, ?, ?)");
  insertTeam.run('Andi', 'Head of Taste', 'https://picsum.photos/seed/andi/400/400');
  insertTeam.run('Budi', 'Operations Lead', 'https://picsum.photos/seed/budi/400/400');
  insertTeam.run('Citra', 'Creative Director', 'https://picsum.photos/seed/citra/400/400');
}

const settingsCount = db.prepare("SELECT count(*) as count FROM settings").get() as { count: number };
if (settingsCount.count === 0) {
  const insertSetting = db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)");
  insertSetting.run('site_name', 'KARSA RASA');
  insertSetting.run('hero_title', 'Cita Rasa Persahabatan');
  insertSetting.run('hero_subtitle', 'Menghadirkan kehangatan dalam setiap gigitan. Dibuat dengan cinta oleh tangan-tangan yang menghargai tradisi.');
  insertSetting.run('hero_image', 'https://picsum.photos/seed/food-hero/1920/1080');
  insertSetting.run('about_title', 'Berawal dari Dapur Kecil dan Mimpi Besar.');
  insertSetting.run('about_text_1', 'Karsa Rasa lahir dari perkumpulan teman masa kecil yang memiliki kegemaran yang sama: makan. Kami percaya bahwa makanan bukan sekadar pengisi perut, melainkan jembatan emosi.');
  insertSetting.run('about_text_2', 'Setiap resep yang kami sajikan telah melalui ratusan kali percobaan di dapur kami sendiri. Kami hanya menggunakan bahan lokal terbaik untuk mendukung petani di sekitar kami.');
  insertSetting.run('about_image', 'https://picsum.photos/seed/cooking/800/1000');
  insertSetting.run('contact_address', 'Jl. Rasa No. 123, Jakarta Selatan, Indonesia');
  insertSetting.run('contact_phone', '+62 812 3456 7890');
  insertSetting.run('contact_email', 'halo@karsarasa.com');
  insertSetting.run('whatsapp_number', '6281234567890');
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Routes - Products
  app.get("/api/products", (req, res) => {
    const products = db.prepare("SELECT * FROM products").all();
    res.json(products);
  });

  app.post("/api/products", (req, res) => {
    const { name, description, image, price, category } = req.body;
    const info = db.prepare("INSERT INTO products (name, description, image, price, category) VALUES (?, ?, ?, ?, ?)").run(name, description, image, price, category);
    res.json({ id: info.lastInsertRowid });
  });

  app.put("/api/products/:id", (req, res) => {
    const { name, description, image, price, category } = req.body;
    db.prepare("UPDATE products SET name = ?, description = ?, image = ?, price = ?, category = ? WHERE id = ?").run(name, description, image, price, category, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/products/:id", (req, res) => {
    db.prepare("DELETE FROM products WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // API Routes - Team
  app.get("/api/team", (req, res) => {
    const team = db.prepare("SELECT * FROM team").all();
    res.json(team);
  });

  app.post("/api/team", (req, res) => {
    const { name, role, image } = req.body;
    const info = db.prepare("INSERT INTO team (name, role, image) VALUES (?, ?, ?)").run(name, role, image);
    res.json({ id: info.lastInsertRowid });
  });

  app.put("/api/team/:id", (req, res) => {
    const { name, role, image } = req.body;
    db.prepare("UPDATE team SET name = ?, role = ?, image = ? WHERE id = ?").run(name, role, image, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/team/:id", (req, res) => {
    db.prepare("DELETE FROM team WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // API Routes - Settings
  app.get("/api/settings", (req, res) => {
    const settings = db.prepare("SELECT * FROM settings").all();
    const settingsObj = settings.reduce((acc: any, curr: any) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
    res.json(settingsObj);
  });

  app.post("/api/settings", (req, res) => {
    const updates = req.body;
    const stmt = db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)");
    const transaction = db.transaction((data) => {
      for (const [key, value] of Object.entries(data)) {
        stmt.run(key, value);
      }
    });
    transaction(updates);
    res.json({ success: true });
  });

  // API Route - Image Upload
  app.post("/api/upload", upload.single("image"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ success: true, imageUrl });
  });

  // Serve uploaded files
  app.use("/uploads", express.static(uploadDir));

  // Simple Admin Login (In real app, use proper auth)
  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    if (username === "Semangat" && password === "PemudaHebat*2026") {
      res.json({ success: true, token: "fake-jwt-token" });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  const PORT = process.env.PORT || 3000;
  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
