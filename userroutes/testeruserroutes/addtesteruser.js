const addTesterUser = async (testerUser, req, res) => {
    try {
        const { firstName, lastName, email, password, stepsAllowed, subjectsAllowed } = req.body;
        if (!firstName || !lastName || !email || !password || !stepsAllowed) {
            return res.status(400).json({ error: true, message: 'All fields are required' });
        }
        const allowedSteps = ['1', '2', '3', 'all'];
        if (!allowedSteps.includes(stepsAllowed)) {
            return res.status(400).json({ error: true, message:'Invalid value for stepsAllowed' });
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
        res.status(201).json({ success: true, message:'User Added Successfully', data: savedUser });;
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { addTesterUser };
