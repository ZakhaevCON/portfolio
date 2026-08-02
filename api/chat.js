// Vercel serverless function: proxies chat messages to the Gemini API.
// Keeps the Gemini API key server-side (never sent to the browser).
//
// Required env var (set in Vercel Project Settings -> Environment Variables):
//   GEMINI_API_KEY   - API key from https://aistudio.google.com/apikey
// Optional:
//   GEMINI_MODEL     - defaults to "gemini-2.5-flash"
//   ALLOWED_ORIGIN   - restrict CORS to a single origin (defaults to "*")

const MAX_MESSAGE_LENGTH = 1000;
const MAX_HISTORY_MESSAGES = 12;
const MAX_CONTEXT_LENGTH = 12000;

const setCorsHeaders = (req, res) => {
    const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

const buildSystemPrompt = (context) => `You are "Connery AI", the friendly AI assistant embedded in Connery's personal portfolio website.

Answer questions about Connery's skills, projects, experience, and on-the-job training (OJT) using ONLY the information given below in <site-context>. If something isn't covered there, say you don't have that detail and suggest the visitor use the contact section instead of guessing.

Keep replies concise (a few sentences, or short bullet points for lists). You may use simple HTML formatting (<strong>, <br/>, <a href="...">) since replies are rendered as HTML — never use markdown syntax like ** or #. Be warm and professional, speaking about Connery in the third person.

<site-context>
${context.slice(0, MAX_CONTEXT_LENGTH)}
</site-context>`;

module.exports = async (req, res) => {
    setCorsHeaders(req, res);

    if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        res.status(500).json({ error: 'Server is missing GEMINI_API_KEY configuration.' });
        return;
    }

    let body = req.body;
    if (typeof body === 'string') {
        try {
            body = JSON.parse(body);
        } catch (e) {
            res.status(400).json({ error: 'Invalid JSON body.' });
            return;
        }
    }

    const message = String(body?.message || '').slice(0, MAX_MESSAGE_LENGTH).trim();
    const context = String(body?.context || '');
    const history = Array.isArray(body?.history) ? body.history.slice(-MAX_HISTORY_MESSAGES) : [];

    if (!message) {
        res.status(400).json({ error: 'Message is required.' });
        return;
    }

    const contents = [
        ...history
            .filter((m) => m && (m.sender === 'user' || m.sender === 'bot') && typeof m.text === 'string')
            .map((m) => ({
                role: m.sender === 'user' ? 'user' : 'model',
                parts: [{ text: String(m.text).replace(/<[^>]*>/g, '').slice(0, MAX_MESSAGE_LENGTH) }],
            })),
        { role: 'user', parts: [{ text: message }] },
    ];

    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    try {
        const geminiRes = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: { parts: [{ text: buildSystemPrompt(context) }] },
                contents,
                generationConfig: {
                    temperature: 0.4,
                    maxOutputTokens: 400,
                },
            }),
        });

        if (!geminiRes.ok) {
            const errText = await geminiRes.text().catch(() => '');
            console.error('Gemini API error:', geminiRes.status, errText);
            res.status(502).json({ error: 'The AI service returned an error. Please try again shortly.' });
            return;
        }

        const data = await geminiRes.json();
        const reply = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('').trim();

        if (!reply) {
            const blockReason = data?.promptFeedback?.blockReason;
            res.status(200).json({
                reply: blockReason
                    ? "I can't help with that request. Try asking about Connery's skills, projects, or experience instead."
                    : "I didn't quite catch that — could you rephrase your question?",
            });
            return;
        }

        res.status(200).json({ reply });
    } catch (err) {
        console.error('Chat proxy error:', err);
        res.status(500).json({ error: 'Something went wrong reaching the AI service.' });
    }
};
