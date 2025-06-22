module.exports = (req, res) => {
    console.log("extractFields function started, v3.");
    console.log("Received request body:", JSON.stringify(req.body, null, 2));

    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).send('Method Not Allowed');
    }

    // This is the new, more powerful findFields function.
    // It will search through the incoming data to find the array named "fields".
    const findFields = (data) => {
        if (!data || typeof data !== 'object') return null;
        if (Array.isArray(data.fields)) return data.fields;
        
        for (const key in data) {
            if (typeof data[key] === 'object') {
                const result = findFields(data[key]);
                if (result) return result;
            }
        }
        return null;
    };

    let fields = findFields(req.body);

    if (!Array.isArray(fields)) {
        console.error("Could not find a valid 'fields' array in the entire request object.");
        return res.status(400).json({ 
            error: 'Bad Request: A parameter named "fields" containing an array must be provided.',
            received_body: req.body
        });
    }

    console.log("Successfully located and processing fields array.");
    const result = {};

    for (const field of fields) {
        const { name, inputPath, fieldType } = field;
        if (!name || typeof inputPath === 'undefined' || !fieldType) continue;

        let extractedValue = inputPath;

        try {
            switch (fieldType) {
                case 'csv':
                    if (typeof inputPath === 'string') extractedValue = inputPath.split(',')[0].trim();
                    break;
                case 'array':
                    if (Array.isArray(inputPath) && inputPath.length > 0) {
                        const firstElement = inputPath[0] || '';
                        extractedValue = firstElement.toString().split(',')[0].trim();
                    }
                    break;
            }
        } catch (e) {
            console.error(`Parsing failed for field '${name}'. Error: ${e.message}`);
            extractedValue = inputPath;
        }
        result[name] = extractedValue;
    }

    console.log("Processing complete. Sending result:", JSON.stringify(result, null, 2));
    res.status(200).json(result);
};
