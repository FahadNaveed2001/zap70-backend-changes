

const deleteTesterUser = async (testerUser, req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: 'User ID is required to delete a user.' });
        }
        const deletedUser = await testerUser.findByIdAndDelete(id);
        if (!deletedUser) {
            return res.status(404).json({ error: 'User not found.' });
        }
        res.status(200).json({ message: 'User successfully deleted.', deletedUser });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { deleteTesterUser };
