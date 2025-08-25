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


    const dayData = guide[day] || null;
    if (!dayData) {
        context.res = {
            status: 404,
            body: { error: `No data found for cycle day ${day}` }
        };
        return;
    }
    const ctx = {
        productivity: dayData.Productivity || "(no productivity data)",
        feels: dayData.Feels || "(no feels data)",
        symptoms: dayData["Physical Symptoms"] || "(no symptoms data)",
        override_note: dayData["Activity Notes"] || "(no override note)",
    };

    const prompt = `
You are a kind assistant helping a boyfriend understand how to support his girlfriend based on her cycle data.

Today is cycle day ${day}.

Use the following data:
${JSON.stringify(ctx, null, 2)}

Generate ONLY the "${section}" section.

Options:
- feeling → Summary of how she might be feeling today
- help → Suggestions for what he can do to support her
- food → Foods that may help her feel better
- avoid → Things to avoid today (e.g., food, actions, activities)

Return JSON like:
{ "result": "Write one clear paragraph here." }
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
        console.error("OpenAI or function error:", err);
        context.res = {
            status: 500,
            body: {
                error: err.message || "LLM error",
                stack: err.stack || null,
                details: err.response?.data || null
            }
        };
    }
};
