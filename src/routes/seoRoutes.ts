import express from 'express';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Route per servire il sitemap.xml
router.get('/sitemap.xml', (req, res) => {
    // Utilizza il percorso assoluto basato su process.cwd()
    const sitemapPath = path.join(process.cwd(), 'public/sitemap.xml');
    
    console.log('Tentativo di lettura del sitemap dal percorso:', sitemapPath);
    
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