    exports.handler = async (event) => {
        if (!event.body) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'No event body provided' }),
            };
        }

        try {
            const payload = JSON.parse(event.body);
            const eventsInput = payload.events || [];
            let events = [];

            // This is the new, smarter logic to handle Make's stringification
            if (typeof eventsInput === 'string') {
                // If Make sent a string, we fix it by wrapping it in brackets and parsing it
                const jsonArrayString = `[${eventsInput}]`;
                events = JSON.parse(jsonArrayString);
            } else if (Array.isArray(eventsInput)) {
                // If Make sent a proper array, we use it directly
                events = eventsInput;
            }

            // The rest of the aggregation logic remains the same
            const users = new Map();
            for (const event of events) {
                const sha = event.hem_sha256;
                if (!sha) continue;

                const eventData = {
                    type: event.event_type,
                    url: event.event_data ? event.event_data.url : null
                };

                if (!users.has(sha)) {
                    const emails = event.resolution.PERSONAL_EMAILS || "";
                    const firstEmail = emails.split(',')[0].trim();
                    users.set(sha, {
                        hem_sha256: sha,
                        first_name: event.resolution.FIRST_NAME,
                        last_name: event.resolution.LAST_NAME,
                        first_email: firstEmail,
                        events: [eventData]
                    });
                } else {
                    users.get(sha).events.push(eventData);
                }
            }

            const aggregated_users = Array.from(users.values());

            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ aggregated_users }),
            };

        } catch (error) {
            // Enhanced error logging to help debug if needed
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Failed to process events', details: error.message, receivedBody: event.body }),
            };
        }
    };
