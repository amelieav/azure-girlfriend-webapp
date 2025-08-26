module.exports = async function (context, req) {
    const { cycleDay, section } = req.query;

    // Dummy data per section
    const dummyData = {
        sleep: `Cycle Day ${cycleDay}: Slept pretty well, about 7 hours.`,
        feels: `Cycle Day ${cycleDay}: Feeling a bit tired but positive.`,
        productivity: `Cycle Day ${cycleDay}: Medium productivity, focus better in the morning.`,
        food: `Cycle Day ${cycleDay}: Craving pasta and something sweet.`
    };

    context.res = {
        status: 200,
        body: { result: dummyData[section] || `No data for ${section}` }
    };
};
