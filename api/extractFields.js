module.exports = (req, res) => {
    console.log("extractFields function started.");
    console.log("Received request body:", JSON.stringify(req.body, null, 2));

    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).send('Method Not Allowed');
    }

    // This is the fix:
    // The 'fields' array might be the entire request body, 
    // or it might be a property named 'fields' within the body. 
    // This line intelligently handles both possibilities.
    let fields = Array.isArray(req.body) ? req.body : req.body.fields;

    if (!Array.isArray(fields)) {
        console.error("Could not find a valid array of fields in the request.");
        return res.status(400).json({ 
            error: 'Bad Request: The "fields" parameter must be an array.',
            received_body_type: typeof req.body
        });
    }

    console.log("Successfully identified fields array to process.");
    const result = {};

    for (const field of fields) {
        const { name, inputPath, fieldType } = field;

        if (!name || typeof inputPath === 'undefined' || !fieldType) {
            continue;
        }

        let extractedValue = inputPath;

        try {
            switch (fieldType) {
                case 'csv':
                    if (typeof inputPath === 'string' && inputPath.length > 0) {
                        extractedValue = inputPath.split(',')[0].trim();
                    }
                    break;
                
                case 'array':
                    if (Array.isArray(inputPath) && inputPath.length > 0) {
                        const firstElement = inputPath[0] || '';
                        extractedValue = firstElement.toString().split(',')[0].trim();
                    }
                    break;
            }
        } catch (e) {
            console.error(`Failed to parse field '${name}'. Error: ${e.message}`);
            extractedValue = inputPath; // Fallback to original value on error
        }

        result[name] = extractedValue;
    }

    console.log("Successfully processed all fields. Sending result.");
    res.status(200).json(result);
};
