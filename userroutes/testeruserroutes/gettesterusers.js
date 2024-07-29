const getTesterUsers = async (testerUser, req, res) => {
    try {
        const users = await testerUser.find({});
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
module.exports = { getTesterUsers };