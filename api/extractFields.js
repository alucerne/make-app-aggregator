module.exports = (req, res) => {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).send('Method Not Allowed');
    }

    // This code correctly finds the 'fields' array in the request.
    const fields = req.body.fields;

    if (!Array.isArray(fields)) {
        return res.status(400).json({ 
            error: 'Bad Request: A "fields" parameter containing an array must be provided.',
            received_body: req.body
        });
    }

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
            extractedValue = inputPath;
        }
        result[name] = extractedValue;
    }
    
    res.status(200).json(result);
};
