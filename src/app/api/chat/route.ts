import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
    try {
        const { message, financialContext } = await req.json();

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json(
                { error: 'Gemini API key not configured. Add GEMINI_API_KEY to your .env.local file.' },
                { status: 500 }
            );
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const systemPrompt = `You are a helpful, friendly AI financial assistant embedded in a personal finance dashboard. Your job is to answer questions about the user's finances based on the data provided below.

IMPORTANT RULES:
- Be concise and direct. Use short paragraphs and bullet points.
- Always reference actual numbers from the data when answering.
- Format currency values with the £ symbol (GBP).
- If asked something not related to finances, politely redirect or give a brief answer.
- If the data doesn't contain enough info to answer, say so honestly.
- Never make up financial data. Only use what's provided.
- Be encouraging and positive about good financial habits.
- Give actionable suggestions when relevant.

USER'S FINANCIAL DATA:
${financialContext}

Respond naturally and helpfully to the user's question.`;

        const chat = model.startChat({
            history: [
                {
                    role: 'user',
                    parts: [{ text: systemPrompt }],
                },
                {
                    role: 'model',
                    parts: [{ text: 'Understood! I have access to your financial data and I\'m ready to help you with any questions about your finances. What would you like to know?' }],
                },
            ],
        });

        const result = await chat.sendMessage(message);
        const response = result.response.text();

        return NextResponse.json({ response });
    } catch (error: any) {
        console.error('Chat API error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate response' },
            { status: 500 }
        );
    }
}
