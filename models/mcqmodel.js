const mongoose = require("mongoose");

const mcqSchema = new mongoose.Schema({
  usmleStep: {
    type: Number,
    required: true,
  },
  USMLE: {
    type: String,
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  optionOne: {
    type: String,
    required: true,
  },
  optionTwo: {
    type: String,
    required: true,
  },
  optionThree: {
    type: String,
    required: true,
  },
  optionFour: {
    type: String,
    required: true,
  },
  optionFive: {
    type: String,
    required: false,
  },
  optionSix: {
    type: String,
    required: false,
  },
  correctAnswer: {
    type: String,
    required: true,
  },

  questionExplanation: {
    type: String,
    required: true,
  },
  optionOneExplanation: {
    type: String,
    required: false,
  },
  optionTwoExplanation: {
    type: String,
    required: false,
  },
  optionThreeExplanation: {
    type: String,
    required: false,
  },
  optionFourExplanation: {
    type: String,
    required: false,
  },
  optionFiveExplanation: {
    type: String,
    required: false,
  },
  optionSixExplanation: {
    type: String,
    required: false,
  },
  comments: [
    {
      commentText: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  image: {
    type: String,
  },
  imageTwo: {
    type: String,
  },
  video: {
    type: String, 
  },
});

const MCQ = mongoose.model("Q/A-MCQ", mcqSchema);

module.exports = MCQ;
