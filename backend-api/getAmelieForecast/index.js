const fs = require("fs");
const path = require("path");
const { OpenAI } = require("openai");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

function loadJSON(filePath) {
    const raw = fs.readFileSync(path.resolve(__dirname, "..", "data", "clean", filePath), "utf-8");
    return JSON.parse(raw);
}

const guide = loadJSON("Daily_Guide_Amelie.json");

module.exports = async function (context, req) {
    const day = parseInt(req.query.cycleDay || "1");
    const section = req.query.section;

    const dayData = guide[day] || {};
    const ctx = {
        productivity: dayData.Productivity,
        feels: dayData.Feels,
        symptoms: dayData["Physical Symptoms"],
        sleep: dayData.Sleep,
        override_note: dayData["Activity Notes"] || "(no override note)",
    };

    const prompt = `
You are an assistant helping Amélie understand what to expect today based on her cycle data.

Today is cycle day ${day}.

Use the following context:
${JSON.stringify(ctx, null, 2)}

Generate ONLY the "${section}" section.

Options:
- sleep → How well she may sleep tonight or how rested she might feel
- feels → Emotional and physical sensations to expect today
- productivity → Level of energy and focus to expect today
- food → Foods that might support her wellbeing today

Return JSON like:
{ "result": "Write one useful paragraph here." }
`;

    try {
        const result = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" }
        });

        const output = JSON.parse(result.choices[0].message.content);
        context.res = { body: output };
    } catch (err) {
        context.res = {
            status: 500,
            body: { error: err.message || "LLM error" }
        };
    }
};
