module.exports = (req, res) => {
    // 1. Basic validation
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).send('Method Not Allowed');
    }

    const { fields } = req.body;

    if (!Array.isArray(fields)) {
        return res.status(400).json({ error: 'Bad Request: The "fields" parameter must be an array.' });
    }

    // 2. Main processing logic
    const result = {};

    for (const field of fields) {
        const { name, inputPath, fieldType } = field;

        // Skip any incomplete field definitions
        if (!name || typeof inputPath === 'undefined' || !fieldType) {
            continue;
        }

        let extractedValue = inputPath; // Default to normal value

        try {
            switch (fieldType) {
                case 'csv':
                    // Handles "value1, value2, value3" -> "value1"
                    if (typeof inputPath === 'string' && inputPath.length > 0) {
                        extractedValue = inputPath.split(',')[0].trim();
                    }
                    break;
                
                case 'array':
                    // Handles ["Job A, Job B", "Job C"] -> "Job A"
                    if (Array.isArray(inputPath) && inputPath.length > 0) {
                        const firstElement = inputPath[0] || '';
                        extractedValue = firstElement.toString().split(',')[0].trim();
                    }
                    break;
            }
        } catch (e) {
            // If any parsing fails, just use the original value as a fallback
            extractedValue = inputPath;
        }

        result[name] = extractedValue;
    }

    // 3. Send the final, clean object as the response
    res.status(200).json(result);
};
