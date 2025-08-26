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

let debugLog = [];
function debug(msg, obj) {
    if (obj !== undefined) {
        debugLog.push(msg + ' ' + JSON.stringify(obj));
    } else {
        debugLog.push(msg);
    }
    console.log(msg, obj);
}

debug("[getAmelieForecast] Loading Daily_Guide_Amelie.json...");
const guide = loadJSON("Daily_Guide_Amelie.json");
debug("[getAmelieForecast] Loaded guide keys:", Object.keys(guide));

module.exports = async function (context, req) {
    debugLog = [];
    debug("[getAmelieForecast] Function triggered");
    try {
        const day = parseInt(req.query.cycleDay || "1");
        const section = req.query.section;
        debug(`[getAmelieForecast] cycleDay: ${day}, section: ${section}`);

        const dayData = guide[day] || {};
        debug("[getAmelieForecast] dayData:", dayData);
        const ctx = {
            productivity: dayData.Productivity,
            feels: dayData.Feels,
            symptoms: dayData["Physical Symptoms"],
            sleep: dayData.Sleep,
            override_note: dayData["Activity Notes"] || "(no override note)",
        };
        debug("[getAmelieForecast] ctx:", ctx);

        const prompt = `
You are an assistant helping Amélie understand what to expect today based on her cycle data.

Today is cycle day ${day}.

Use the following context:
${JSON.stringify(ctx, null, 2)}

Generate ONLY the "${section}" section.

Options:
- sleep → How well you may sleep tonight or how rested you might feel based on historical data
- feels → Emotional and physical sensations you might expect today based on hormonal changes
- productivity → Level of energy and focus to expect today
- food → Foods that might support your wellbeing today

Return JSON like:
{ "result": "Write one useful paragraph here." }
`;
        debug("[getAmelieForecast] prompt:", prompt);

        const result = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" }
        });
        debug("[getAmelieForecast] OpenAI result:", result);

        const output = JSON.parse(result.choices[0].message.content);
        debug("[getAmelieForecast] output:", output);
        context.res = { body: output };
    } catch (err) {
        debug("[getAmelieForecast] ERROR:", err);
        context.res = {
            status: 500,
            body: {
                error: err.message || "LLM error",
                stack: err.stack || null,
                details: err.response?.data || null,
                debugLog
            }
        };
    }
};
