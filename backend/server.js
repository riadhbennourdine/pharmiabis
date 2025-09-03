
const express = require('express');
const cors = require('cors');
const { connectDB, getDB } = require('./db');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Set a limit to prevent large payloads

// API Routes
app.get('/api/data', async (req, res) => {
    try {
        const db = getDB();
        const themes = await db.collection('themes').find({}).sort({ Nom: 1 }).toArray();
        const systemesOrganes = await db.collection('systemesOrganes').find({}).sort({ Nom: 1 }).toArray();
        const memofiches = await db.collection('memofiches').find({}).sort({ createdAt: -1 }).toArray();
        res.status(200).json({ themes, systemesOrganes, memofiches });
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ message: 'Error fetching data', error: error.toString() });
    }
});

app.post('/api/memofiches', async (req, res) => {
    try {
        const db = getDB();
        const newFiche = req.body;

        // Basic validation
        if (!newFiche || !newFiche.id || !newFiche.title) {
            return res.status(400).json({ message: 'Invalid memo fiche data provided.' });
        }

        const { theme, systeme_organe } = newFiche;

        // Upsert theme
        if (theme && theme.id && theme.Nom) {
            await db.collection('themes').updateOne(
                { id: theme.id },
                { $set: { Nom: theme.Nom, description: theme.description || '' } },
                { upsert: true }
            );
        }

        // Upsert systeme_organe
        if (systeme_organe && systeme_organe.id && systeme_organe.Nom) {
            await db.collection('systemesOrganes').updateOne(
                { id: systeme_organe.id },
                { $set: { Nom: systeme_organe.Nom, description: systeme_organe.description || '' } },
                { upsert: true }
            );
        }

        // Insert memofiche
        await db.collection('memofiches').insertOne(newFiche);
        
        res.status(201).json(newFiche);
    } catch (error) {
        console.error("Error creating memofiche:", error);
        res.status(500).json({ message: 'Error creating memofiche', error: error.toString() });
    }
});

app.delete('/api/memofiches/:id', async (req, res) => {
    try {
        const db = getDB();
        const { id } = req.params;
        const result = await db.collection('memofiches').deleteOne({ id: id });

        if (result.deletedCount === 1) {
            res.status(200).json({ message: 'MemoFiche deleted successfully' });
        } else {
            res.status(404).json({ message: 'MemoFiche not found' });
        }
    } catch (error) {
        console.error("Error deleting memofiche:", error);
        res.status(500).json({ message: 'Error deleting data', error: error.toString() });
    }
});

// Serve static files from the project root
app.use(express.static(path.join(__dirname, '..', 'dist')));

// The "catchall" handler: for any request that doesn't match an API route,
// send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});


// Start server after DB connection
connectDB().then(() => {
    app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });
}).catch(err => {
    console.error("Failed to start server:", err);
});