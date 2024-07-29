const editTesterUser = async (testerUser, req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        if (!id) {
            return res.status(400).json({ error: true, message: "User Note Found" });
    };
        
        const allowedSteps = ['1', '2', '3', 'all'];
        if (updates.stepsAllowed && !allowedSteps.includes(updates.stepsAllowed)) {
            return res.status(400).json({ error: true, message: 'Invalid value for stepsAllowed. Allowed values are 1, 2, 3, all.' });
        }
        const updatedUser = await testerUser.findByIdAndUpdate(id, updates, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ error: true, message: 'User not found.' });
        }
        res.status(200).json({ success: true, message: 'User successfully updated.', updatedUser });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { editTesterUser };
