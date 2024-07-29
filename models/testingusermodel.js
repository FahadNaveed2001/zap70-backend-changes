const mongoose = require("mongoose");


const testerUserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    stepsAllowed: {
        type: String,
        required: true,
        enum: ['1', '2', '3', 'all'],
    },
    subjectsAllowed: {
        type: [String],
        required: true,
    },
});

const testerUser = mongoose.model("Q/A-testing-User", testerUserSchema);
module.exports = testerUser;