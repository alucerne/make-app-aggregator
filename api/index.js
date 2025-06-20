    // This is the full code for your serverless function
    exports.handler = async (event) => {
        // We only care about the body of the POST request from Make
        if (!event.body) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'No event body provided' }),
            };
        }

        try {
            // The body from Make will be a JSON string, so we parse it
            const payload = JSON.parse(event.body);
            const events = payload.events || [];

            // Use a Map for efficient, unique user storage
            const users = new Map();

            for (const event of events) {
                const sha = event.hem_sha256;
                if (!sha) continue; // Skip events without a sha

                const eventData = {
                    type: event.event_type,
                    url: event.event_data ? event.event_data.url : null
                };

                // If we haven't seen this user, create their main entry
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
                    // If user already exists, just add the new event to their list
                    users.get(sha).events.push(eventData);
                }
            }

            // Convert the Map of users into the final array
            const aggregated_users = Array.from(users.values());

            // Send the successful response back to Make
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ aggregated_users }),
            };

        } catch (error) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Failed to process events', details: error.message }),
            };
        }
    };
