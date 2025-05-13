import express from 'express';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Route per servire il sitemap.xml
router.get('/sitemap.xml', (req, res) => {
    const sitemapPath = path.join(__dirname, '../../public/sitemap.xml');
    
    fs.readFile(sitemapPath, (err, data) => {
        if (err) {
            console.error('Errore nella lettura del sitemap.xml:', err);
            return res.status(500).send('Errore nel caricamento del sitemap');
        }
        
        res.header('Content-Type', 'application/xml');
        res.send(data);
    });
});

export default router;