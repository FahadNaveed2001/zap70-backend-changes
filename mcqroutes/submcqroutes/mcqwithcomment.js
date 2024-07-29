const MCQ = require("../../models/mcqmodel");
const Question = require("../../models/testquestions"); 

const getMCQsWithComments = async (req, res) => {
  try {
    const mcqsWithComments = await MCQ.find({
      comments: { $exists: true, $not: { $size: 0 } },
    });
    const questionsWithComments = await Question.find({
      comments: { $exists: true, $not: { $size: 0 } },
    });

    if (mcqsWithComments.length === 0 && questionsWithComments.length === 0) {
      return res.status(404).json({ error: true, message: "No MCQ or Question With Comments" });
    }
    res.status(201).json({
      status: "success",
      success: true,
      message: "Now showing MCQs and Questions which have comments",
      data: mcqsWithComments,
      testQuestionWithComments :questionsWithComments,
    });

    // console.log("Now showing MCQs and Questions which have comments");
    // console.log(mcqsWithComments);
    // console.log(questionsWithComments);
  } catch (error) {
    res.status(500).json({
      error: true,
      message: "Error loading comments",
      errorMessage: error.message,
    });
    console.log("Error loading comments");
    console.error(error);
  }
};

module.exports = {
  getMCQsWithComments,
};
