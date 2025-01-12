import React, { useState } from 'react';
import './ProductManager.css';

const ProductManager = () => {
    const [originalProducts, setOriginalProducts] = useState([]);
    const [modifiedProducts, setModifiedProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const generateProducts = async () => {
        try {
            setLoading(true);
            setMessage('Generating products...');
            
            // Generate products
            await fetch('http://localhost:5000/api/populate-products', {
                method: 'POST'
            });

            // Fetch the generated products
            const response = await fetch('http://localhost:5000/api/original-products');
            const data = await response.json();
            setOriginalProducts(data);
            setMessage('Products generated successfully!');
        } catch (error) {
            setMessage('Error generating products');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const syncProducts = async () => {
        try {
            setLoading(true);
            setMessage('Syncing products...');
            
            // Sync products with VAT
            await fetch('http://localhost:5000/api/sync-products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ minPrice: 0 })
            });

            // Fetch the modified products
            const response = await fetch('http://localhost:5000/api/modified-products');
            const data = await response.json();
            setModifiedProducts(data);
            setMessage('Products synced successfully!');
        } catch (error) {
            setMessage('Error syncing products');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="product-manager">
            <h1>Product Manager</h1>
            
            <div className="buttons">
                <button 
                    onClick={generateProducts} 
                    disabled={loading}
                >
                    Generate 50 Products
                </button>
                <button 
                    onClick={syncProducts} 
                    disabled={loading}
                >
                    Sync with VAT
                </button>
            </div>

            {message && <p className="message">{message}</p>}

            <div className="products-container">
                <div className="product-list">
                    <h2>Original Products</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Product Code</th>
                                <th>Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {originalProducts.map(product => (
                                <tr key={product.id}>
                                    <td>{product.product_code}</td>
                                    <td>€{product.price}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="product-list">
                    <h2>Modified Products (with VAT)</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Product Code</th>
                                <th>Price (incl. VAT)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {modifiedProducts.map(product => (
                                <tr key={product.id}>
                                    <td>{product.product_code}</td>
                                    <td>€{product.price}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ProductManager; 