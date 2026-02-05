
import { GoogleGenAI } from "@google/genai";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `You are an effective media consultant and chief editor who writes news in 10 minutes.
Your tone is direct, clear, and uses simple, human language.
Prohibitions: Do not use participles, passive voice, or empty phrases like "took part in" or "in the course of implementation."
Technical Requirement: If information is insufficient to answer "Why?" or "So what?", you must explicitly state what specific data needs to be found.

Knowledge Base:
- Lead Questions: Who? What? Where? When? How? Why? So what?
- Inverted Pyramid Structure: 1. Lead (most critical info), 2. Important Details, 3. Context, 4. Distant Context.
- News Value Criteria: Scale (how many people affected?), Impact (how significant is the effect?), Proximity (is it close to the reader?), Novelty (is it unusual?), Celebrity (does it involve well-known people?), Emotion (does it evoke feelings?).
- Example of transformation: A press release about a "meeting on the implementation of a project to build a waste incineration plant" becomes a news story titled "Authorities to build a waste incineration plant in Polonetsky district." The lead explains who, what, where, and when. The body provides context on the plant's capacity and local reactions.
`;

export async function analyzeText(userInputText: string): Promise<string | null> {
  const prompt = `
Analyze the following text as an editor. Provide a report.

Text to analyze:
---
${userInputText}
---

Your report must be in Russian and include:
1.  **Анализ "пены":** Найдите и перечислите все примеры субъективных оценок (например, "прекрасный", "важный"), канцеляризмов и жаргонизмов (например, "провел встречу" вместо "встретился").
2.  **Проверка лида:** Проверьте, отвечает ли первый абзац на 7 ключевых вопросов (Кто? Что? Где? Когда? Как? Почему? И что?). Перечислите, на какие вопросы есть ответы, а на какие нет.
3.  **Анализ глаголов:** Проверьте, используются ли в заголовке (если есть) и тексте активные глаголы. Укажите найденные пассивные конструкции.
4.  **Соотношение фактов и "пены":** Дайте примерную оценку соотношения фактов к "пене" в процентах.
5.  **Рекомендации:** Предложите конкретные шаги по сокращению текста и улучшению его ясности ("отрезать коржи").
`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION
    }
  });

  return response.text ?? null;
}

export async function findStoryIdeas(userInputText: string): Promise<string | null> {
  const prompt = `
Act as a journalist looking for story ideas. Generate 5 current, relevant news topics, in Russian. For context, the user might provide some text below, or it might be empty, in which case you should look for general interest topics using your knowledge of current events.

User context (if any):
---
${userInputText || 'Контекст не предоставлен.'}
---

Your process:
1.  Find 5 current news hooks.
2.  Frame each idea using the "Представляешь..." structure to make it engaging.
3.  Rank the 5 ideas based on the news value criteria (Масштаб, Влияние, Близость, Необычность, Заметность, Эмоции).
4.  Provide the final output as a numbered list. For each item, include the "Представляешь..." hook, and a brief justification for why it's a strong story, referencing the criteria.
`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      tools: [{ googleSearch: {} }],
    }
  });

  return response.text ?? null;
}

export async function writeNewsArticle(userInputText: string): Promise<string | null> {
  const prompt = `
Act as a journalist and write a short, clear news article in Russian based on the provided information.

Source information:
---
${userInputText}
---

Follow these steps precisely:
1.  **Очистка и упрощение:** Перепишите исходный текст, удалив всю "пену", канцеляризмы и жаргон. Переведите его на простой, "человеческий" язык.
2.  **Написание лида:** Создайте сильный первый абзац, который отвечает на максимальное количество из 7 вопросов (Кто? Что? Где? Когда? Как? Почему? И что?), поставив самую важную информацию в начало.
3.  **Структурирование тела новости:** Организуйте оставшиеся факты в соответствии со структурой "перевернутой пирамиды": "Важные детали", "Контекст", "Дальний контекст".
4.  **Обогащение фактов:** Если в источнике используются расплывчатые фразы ("недалеко", "несколько"), замените их на правдоподобные, конкретные детали (например, "в 15 км", "42 дома"). Обязательно пометьте такие сгенерированные факты как "(требует проверки)". Если для ответов на вопросы "Почему?" или "И что?" не хватает информации, четко укажите, что именно нужно найти.
5.  **Создание заголовка:** Напишите убедительный заголовок с активным глаголом, который отражает суть истории, но не дублирует лид.
6.  **Итоговый результат:** Представьте готовую новость в формате: **Заголовок** (сделайте его жирным), за которым следует основной текст.
`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION
    }
  });

  return response.text ?? null;
}
