module.exports = (req, res) => {
    console.log("behaviorLabeler function started.");

    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        res.status(405).send('Method Not Allowed');
        return;
    }

    let payload = req.body;
    console.log("Received raw payload. Type:", typeof payload);
    console.log("Payload content:", JSON.stringify(payload, null, 2));

    // If the payload from Make is a string, we need to parse it into an array
    if (typeof payload === 'string') {
        try {
            payload = JSON.parse(payload);
            console.log("Successfully parsed string payload into an array.");
        } catch (e) {
            console.error("Failed to parse payload string:", e);
            res.status(400).json({ error: "Bad Request: Malformed JSON string in body." });
            return;
        }
    }

    if (!Array.isArray(payload)) {
        console.error("After potential parsing, payload is still not an array.");
        res.status(400).json({ error: "Bad Request: Expected an array of events." });
        return;
    }

    if (payload.length === 0) {
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
