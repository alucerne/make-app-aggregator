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
        const bundles = payload.bundles || [];
        
        const userBehaviors = new Map();

        for (const bundle of bundles) {
          const resolution = bundle.resolution ?? {};
          const sha256 = getFirstSha(resolution.SHA256_PERSONAL_EMAIL);
          
          if (!sha256) continue;

          if (!userBehaviors.has(sha256)) {
            userBehaviors.set(sha256, new Set());
          }
          
          const behaviors = userBehaviors.get(sha256);
          const eventType = bundle.event_type;

          // --- New Behavior Logic Based on Your Event List ---

          // Directly map the event_type to a behavior label.
          // Using a Set automatically handles duplicates, so if a user has
          // 5 'page_view' events, they will only get the 'page_view' behavior once.
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
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
      }
    };
