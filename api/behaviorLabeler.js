    // api/behaviorLabeler.js

    const getFirstSha = (shaInput) => {
      if (typeof shaInput !== 'string' || shaInput.length === 0) {
        return null;
      }
      return shaInput.split(',')[0].trim();
    };

    exports.handler = async (event) => {
      if (!event.body) {
        return { statusCode: 400, body: JSON.stringify({ error: 'No event body' }) };
      }

      try {
        const payload = JSON.parse(event.body);
        // The Make module sends the data inside a "bundles" property
        const bundles = payload.bundles || []; 
        
        const userBehaviors = new Map();

        for (const bundle of bundles) {
          // Add a check to ensure the bundle is a valid object
          if (typeof bundle !== 'object' || bundle === null) continue;

          const resolution = bundle.resolution ?? {};
          const sha256 = getFirstSha(resolution.SHA256_PERSONAL_EMAIL);
          
          if (!sha256) continue;

          if (!userBehaviors.has(sha256)) {
            userBehaviors.set(sha256, new Set());
          }
          
          const behaviors = userBehaviors.get(sha256);
          const eventType = bundle.event_type;

          if (eventType) {
            behaviors.add(eventType);
          }
        }

        const result = Array.from(userBehaviors.entries()).map(([sha, behaviorsSet]) => ({
          sha256: sha,
          behaviors: Array.from(behaviorsSet),
        }));

        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ labeled_users: result }),
        };

      } catch (error) {
        // This is the new, enhanced error handling.
        // It will log the error in Vercel and send a detailed response back to Make.
        console.error("Function failed with error:", error);
        return { 
          statusCode: 500, 
          body: JSON.stringify({ 
            error: "An internal server error occurred in the Vercel function.",
            errorMessage: error.message, 
            errorStack: error.stack, // This tells us exactly where the code broke
            receivedBody: event.body
          }) 
        };
      }
    };
