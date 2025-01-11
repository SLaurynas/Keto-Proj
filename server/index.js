const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const pool = require('./db');

const app = express();

app.use(cors());
app.use(express.json());

// Endpoint to populate original products
app.post('/api/populate-products', async (req, res) => {
    try {
        // Generate 50 random products
        for (let i = 0; i < 50; i++) {
            const productCode = `A${Math.floor(100000 + Math.random() * 900000)}`;
            const price = parseFloat((Math.random() * 1000).toFixed(2));
            
            await pool.query(
                'INSERT INTO original_products (id, product_code, price) VALUES ($1, $2, $3)',
                [uuidv4(), productCode, price]
            );
        }
        
        res.json({ message: '50 products created successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Endpoint to sync products with minimum price filter
app.post('/api/sync-products', async (req, res) => {
    try {
        const { minPrice = 0 } = req.body;
        
        // First, get all products from original_products that meet the minimum price
        const { rows: originalProducts } = await pool.query(
            'SELECT * FROM original_products WHERE price >= $1',
            [minPrice]
        );
        
        // For each product, update or insert into modified_products
        for (const product of originalProducts) {
            const vatPrice = parseFloat((product.price * 1.21).toFixed(2));
            
            // Using upsert (insert or update) with ON CONFLICT
            await pool.query(
                `INSERT INTO modified_products (id, product_code, price)
                 VALUES ($1, $2, $3)
                 ON CONFLICT (product_code) 
                 DO UPDATE SET price = $3`,
                [uuidv4(), product.product_code, vatPrice]
            );
        }
        
        res.json({ message: 'Products synced successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all original products
app.get('/api/original-products', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM original_products ORDER BY product_code');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all modified products
app.get('/api/modified-products', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM modified_products ORDER BY product_code');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 