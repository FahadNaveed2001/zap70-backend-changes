const addTesterUser = async (testerUser, req, res) => {
    try {
        const { firstName, lastName, email, password, stepsAllowed, subjectsAllowed } = req.body;
        if (!firstName || !lastName || !email || !password || !stepsAllowed) {
            return res.status(400).json({ error: 'All fields are required except subjectsAllowed.' });
        }
        const allowedSteps = ['1', '2', '3', 'all'];
        if (!allowedSteps.includes(stepsAllowed)) {
            return res.status(400).json({ error: 'Invalid value for stepsAllowed. Allowed values are 1, 2, 3, all.' });
        }
        const newTesterUser = new testerUser({
            firstName,
            lastName,
            email,
            password,
            stepsAllowed,
            subjectsAllowed
        });
        const savedUser = await newTesterUser.save();
        res.status(201).json(savedUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { addTesterUser };
