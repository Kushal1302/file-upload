import express from 'express';
import multer from 'multer';
import cors from 'cors';
import mongoose from 'mongoose';
import fs from 'fs'
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

mongoose.connect('mongodb+srv://Kushal1302:Kushal2310@cluster0.gr53qjk.mongodb.net/fileUploadDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const fileSchema = new mongoose.Schema({
    filename: String,
    path: String
});

const File = mongoose.model('File', fileSchema);

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage }).single("photos");

app.post('/file', (req, res) => {
    upload(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(500).json(err);
        } else if (err) {
            return res.status(500).json(err);
        }
        
        const newFile = new File({
            filename: req.file.filename,
            path: req.file.path
        });
        
        try {
            await newFile.save();
            console.log("File saved to database:", newFile);
            return res.status(200).send(newFile);
        } catch (error) {
            console.error("Error saving file to database:", error);
            return res.status(500).send(error);
        }
    });
});

app.get('/files', async (req, res) => {
    try {
        const files = await File.find();
        return res.json(files);
    } catch (error) {
        console.error("Error fetching files from database:", error);
        return res.status(500).send(error);
    }
});
app.delete('/delete', async (req, res) => {
    try {
        const filename = req.query.id;
        const data = await File.findOneAndDelete({ filename });
        if (!data) {
            return res.status(404).json({ error: "File not found" });
        }
        const filepath = path.join(__dirname , 'uploads' , filename)
        fs.unlink(filepath, (err) => {
            if (err) {
                console.error("Error deleting file from /uploads directory:", err);
                return res.status(500).json({ error: "Error deleting file" });
            }
            return res.json({ message: "File deleted successfully" });
        });
    } catch (error) {
        console.error("Error deleting file:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

app.listen(9000, () => console.log("Server is running on port 9000"));
