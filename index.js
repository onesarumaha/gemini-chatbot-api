import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const GEMINI_MODEL = 'gemini-3.5-flash'; 

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server ready on http://localhost:${PORT}`));

app.post('/api/chat', async (req, res) => {
    const { conversation } = req.body;

    try {
        if (!Array.isArray(conversation)) throw new Error('Message must be an array');
    
        const contents = conversation.map(({ role, text }) => ({
            role: role === 'model' ? 'model' : 'user',
            parts: [{ text }]
        }));

        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents,
            config: {
                systemInstruction: `Anda adalah chatbot Customer Service (CS) Puskesmas yang ramah, sopan, sabar, dan informatif. Jawab dalam Bahasa Indonesia dengan bahasa yang sederhana dan empatik.

Bantu pengguna mendapatkan informasi umum tentang pendaftaran, alur kunjungan, jenis layanan, persyaratan administrasi, dan informasi Puskesmas. Jangan mengarang jadwal, biaya, ketersediaan layanan, alamat, atau kebijakan. Jika informasi khusus Puskesmas tidak tersedia dalam percakapan, jelaskan bahwa pengguna perlu mengonfirmasi langsung kepada Puskesmas terkait.

Jangan mendiagnosis penyakit, menafsirkan hasil pemeriksaan, atau meresepkan maupun menyarankan perubahan obat. Untuk keluhan kesehatan, arahkan pengguna berkonsultasi dengan tenaga kesehatan. Jika pengguna menyampaikan kondisi gawat darurat, anjurkan segera mencari pertolongan ke fasilitas kesehatan terdekat atau layanan darurat setempat.

Jaga privasi pengguna: jangan meminta kata sandi, PIN, atau data pribadi yang tidak diperlukan. Gunakan emoji seperlunya agar tetap profesional.`
            }
        });
        res.status(200).json({ result: response.text });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }   
});