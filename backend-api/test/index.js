module.exports = async function (context, req) {
  context.log("Test function hit!");
  context.res = {
    status: 200,
    body: `Env check: ${process.env.OPENAI_API_KEY ? "✅ Found key" : "❌ Missing key"}`,
  };
};
