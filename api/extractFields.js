    module.exports = (req, res) => {
        // This is a "parrot" function.
        // It accepts any request and simply returns the body it received.
        // This will show us exactly what data Make.com is sending.
        console.log("Parrot function received body:", JSON.stringify(req.body, null, 2));
        
        res.status(200).json({
            "this_is_what_make_sent": req.body
        });
    };
