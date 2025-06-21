module.exports = (req, res) => {
    console.log("behaviorLabeler function started.");

    if (req.method !== 'POST') {
        console.log("Method not allowed:", req.method);
        res.setHeader('Allow', ['POST']);
        res.status(405).send('Method Not Allowed');
        return;
    }

    const payload = req.body;
    console.log("Received payload:", JSON.stringify(payload, null, 2));

    if (!Array.isArray(payload)) {
        console.error("Payload is not an array.");
        res.status(400).json({ error: "Bad Request: Expected an array of events." });
        return;
    }

    if (payload.length === 0) {
        console.log("Received empty array, returning empty labels.");
        res.status(200).json({ behavior_labels: [] });
        return;
    }

    try {
        const eventTypes = payload.map(event => event.event_type);
        const uniqueEventTypes = [...new Set(eventTypes)];
        
        console.log("Successfully generated labels:", uniqueEventTypes);
        res.status(200).json({ behavior_labels: uniqueEventTypes });
    } catch (error) {
        console.error("An error occurred during processing:", error);
        res.status(500).json({ 
            error: "Internal Server Error",
            message: error.message,
            stack: error.stack 
        });
    }
};
