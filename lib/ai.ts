'use server';

import { OpenAI } from 'openai';

let openai: OpenAI | null = null;

function getOpenAI() {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
        throw new Error("OPENAI_API_KEY manquant. Veuillez le configurer dans .env.local");
    }
    if (!openai) {
        openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }
    return openai;
}

export async function analyzeUserPatterns(history: unknown[]) {
    // Logic to analyze user history and return patterns
    const prompt = `Analyze the following user session history and identify productivity patterns, chronotypes, and energy levels: ${JSON.stringify(history)}`;
    console.log(prompt);
    // placeholder for AI logic
}

export async function getCoachResponse(message: string, context: unknown) {
    try {
        const client = getOpenAI();
        const response = await client.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: `Tu es le Coach LifeOS, un assistant de productivité ultra-personnalisé. 
                    Analyse le comportement de l'utilisateur et donne des conseils concrets.
                    
                    Tu peux suggérer des actions en utilisant ces marqueurs SPÉCIFIQUES en fin de réponse :
                    - [ADD_TASK: Title | subtask1, subtask2] pour suggérer une nouvelle tâche avec des sous-tâches optionnelles.
                    - [ADD_HABIT: Name] pour suggérer une nouvelle habitude.
                    - [PLAN_TASK: ID, Time] pour suggérer de planifier une tâche existante.
                    
                    Réponds toujours en Français, avec un ton motivant et coach-like. Utilise le Markdown pour la mise en forme.`
                },
                { role: 'user', content: message }
            ],
        });

        return response.choices[0].message.content;
    } catch (error: any) {
        console.error("AI Coach Error:", error.message);
        return `Désolé, je ne peux pas répondre pour le moment. Erreur : ${error.message}`;
    }
}

export async function suggestHabit(habitName: string) {
    try {
        const client = getOpenAI();
        const response = await client.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: `You are a productivity expert. Suggest the best configuration for a habit based only on its name.
                    Return ONLY a JSON object with these fields:
                    {
                      "description": "Short motivating description",
                      "type": "check" | "timer" | "counter" | "value",
                      "durationMinutes": number (optional, only if type is timer),
                      "goal": number (optional, only if type is counter or value),
                      "unit": "string" (optional, only if type is counter or value),
                      "frequency": "daily" | "weekly",
                      "moment": "morning" | "afternoon" | "evening" | "anytime",
                      "icon": "A single emoji",
                      "color": "A hex color (professional shade)"
                    }`
                },
                { role: 'user', content: `Nom de l'habitude : ${habitName}` }
            ],
            response_format: { type: "json_object" }
        });

        const content = response.choices[0].message.content;
        return content ? JSON.parse(content) : null;
    } catch (error: any) {
        console.error("AI Suggest Habit Error:", error.message);
        return null;
    }
}

export async function suggestTaskSequence(tasks: any[]) {
    // Logic for optimal task sequencing
}
