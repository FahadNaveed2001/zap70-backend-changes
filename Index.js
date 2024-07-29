//dep imports
require("dotenv").config();
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const fs = require("fs");
// const excelToJson = require("convert-excel-to-json");
const xlsx = require("xlsx");
const ExcelJS = require("exceljs");

//files imports
const connectDB = require("./config/mongoconnection");
const User = require("./models/usermodel");
const MCQ = require("./models/mcqmodel");
const Test = require("./models/test");

const predefinedAdmin = require("./models/adminmodel");
const { body, validationResult } = require("express-validator");
const { addMCQ } = require("./mcqroutes/addmcq");
const { getMCQs } = require("./mcqroutes/getmcqs");
const { getMCQById } = require("./mcqroutes/submcqroutes/singlemcq");
const { addCommentToMCQ } = require("./mcqroutes/commentroutes/addcomment");
const {
  getMCQsWithComments,
} = require("./mcqroutes/submcqroutes/mcqwithcomment");
const { verifyEmail } = require("./userroutes/emailverification");
const { deleteMCQ } = require("./mcqroutes/deletemcq");
const { deleteQuiz } = require("./userroutes/quizroutes/deletequiz");
const { saveQuizzes } = require("./userroutes/quizroutes/addquiz");
const { getUserQuizzes } = require("./userroutes/quizroutes/userquiz");
const { getLatestQuiz } = require("./userroutes/quizroutes/latestquiz");
const { userSignup } = require("./userroutes/usersignup");
const { userLogin } = require("./userroutes/userlogin");
const { getUsers } = require("./userroutes/getusers");
const { forgotPassword } = require("./userroutes/forgotpassword");
const {
  verifyToken,
  routesWithoutToken,
} = require("./middlewares/authmiddleware");
const storage = require("./config/storageconfig");
const { addFeedback } = require("./userroutes/feedbackroutes/addfeedback");
const {
  deleteFeedback,
} = require("./userroutes/feedbackroutes/deletefeedback");
const { getFeedbacks } = require("./userroutes/feedbackroutes/getfeedbacks");
const { editFeedback } = require("./userroutes/feedbackroutes/editfeedback");
const {
  getFeedbackById,
} = require("./userroutes/feedbackroutes/getsinglefeedback");
const {
  getUserFeedbacks,
} = require("./userroutes/feedbackroutes/usersfeedback");
const {
  getAllFeedbacks,
} = require("./userroutes/feedbackroutes/adminfeedbacks");
const USERMCQ = require("./models/questionsbyusers");
const ABOUTUS = require("./models/aboutus");
const addAboutUs = require("./aboutusroutes/addaboutus");
const editAboutUs = require("./aboutusroutes/editaboutus");
const getAboutUs = require("./aboutusroutes/getaboutus");
const NOTIFICATION = require("./models/notificationmodel");
const addNotification = require("./notifications/addnotification");
const getNotifications = require("./notifications/getnotification");
const getUserNotifications = require("./notifications/getusernotification");
const deleteUserNotification = require("./notifications/deleteusernotification");
const deleteNotification = require("./notifications/deletenotification");
const updateUserNotifications = require("./notifications/updatenotification");
const Question = require("./models/testquestions");
const testerUser = require("./models/testingusermodel");
const { addTesterUser } = require("./userroutes/testeruserroutes/addtesteruser");
const { deleteTesterUser } = require("./userroutes/testeruserroutes/deletetesteruser");
const { getTesterUsers } = require("./userroutes/testeruserroutes/gettesterusers");
const { editTesterUser } = require("./userroutes/testeruserroutes/edittesterusers");
// const { deleteMCQImage } = require("./mcqroutes/deletemcqimage");

//app and port
const app = express();
const PORT = process.env.PORT || 8000;

//db connection
connectDB();

//cors
// const corsOptions = {
//   origin: [
//     "*",
//     "https://zap70.com",
//     "http://localhost:3000",
//     "http://165.232.134.133:3000",
//   ],
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   allowedHeaders: ["Content-Type", "Authorization"],
//   credentials: true,
// };
// app.use(cors(corsOptions));

app.use(
  cors({
    // origin: ["https://zap70.com", "http://localhost:3000"],
    origin: [
      "*",
      "https://zap70.com",
      "http://localhost:3000",
      "http://167.71.95.212:3000",
      "http://165.232.134.133:3000",
      "https://zap70.netlify.app",
    ],
    credentials: true,
  })
);
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(
  "/uploads/images",
  express.static(path.join(__dirname, "uploads", "images"))
);
app.use(
  "/uploads/videos",
  express.static(path.join(__dirname, "uploads", "videos"))
);
app.use(
  "/uploads/testimages",
  express.static(path.join(__dirname, "uploads", "testimages"))
);
// app.use(
//   "/uploads/testvideos",
//   express.static(path.join(__dirname, "uploads", "testvideos"))
// );

//Jwt Secret
const JWT_SECRET = process.env.JWT_SECRET_KEY;

//middlewares
// app.use((req, res, next) => {
//   if (routesWithoutToken.includes(req.path)) {
//     next();
//   } else {
//     verifyToken(req, res, next);
//   }
// });


app.use((req, res, next) => {
  if (routesWithoutToken.includes(req.path) || req.path.startsWith('/uploads')) {
    next();
  } else {
    verifyToken(req, res, next);
  }
});

//root route
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    success: true,
    message: "ZAP-70 is running!",
  });
  console.log("Root route accessed");
});

//multer storage
const upload = multer({
  storage: storage,
  // limits: { fileSize: 524288000 },
});

//mcq routes
app.post(
  "/add-mcqs",
  upload.fields([
    { name: "imageTwo", maxCount: 1 },
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  addMCQ
);
app.get("/mcqs", getMCQs);
app.get("/mcq/:mcqId", getMCQById);
app.post("/add-comment/:mcqId", addCommentToMCQ);
app.get("/mcqs-with-comments", getMCQsWithComments);
app.delete("/delete-mcq/:mcqId", deleteMCQ);

app.put(
  "/edit-mcqs/:mcqId",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "imageTwo", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  async (req, res) => {
    const { mcqId } = req.params;
    const {
      usmleStep,
      USMLE,
      question,
      optionOne,
      optionTwo,
      optionThree,
      optionFour,
      optionFive,
      optionSix,
      correctAnswer,
      questionExplanation,
      optionOneExplanation,
      optionTwoExplanation,
      optionThreeExplanation,
      optionFourExplanation,
      optionFiveExplanation,
      optionSixExplanation,
    } = req.body;

    if (!usmleStep || !USMLE || !question || !correctAnswer) {
      return res
        .status(400)
        .json({ error: true, message: "Missing required fields." });
    }
    try {
      const mcqToUpdate = await MCQ.findById(mcqId);
      if (!mcqToUpdate) {
        return res.status(404).json({ error: true, message: "MCQ not found." });
      }
      const fieldsToUpdate = {
        usmleStep,
        USMLE,
        question,
        optionOne,
        optionTwo,
        optionThree,
        optionFour,
        optionFive,
        optionSix,
        correctAnswer,
        questionExplanation,
        optionOneExplanation,
        optionTwoExplanation,
        optionThreeExplanation,
        optionFourExplanation,
        optionFiveExplanation,
        optionSixExplanation,
      };
      Object.keys(fieldsToUpdate).forEach((field) => {
        if (fieldsToUpdate[field] !== undefined) {
          mcqToUpdate[field] = fieldsToUpdate[field];
        }
      });
      if (req.files["image"]) {
        mcqToUpdate.image = req.files["image"][0].filename;
      }
      if (req.files["imageTwo"]) {
        const imagesDirectory = path.join(__dirname, "uploads/images");
        const newImageTwo = req.files["imageTwo"][0].filename;
        if (mcqToUpdate.imageTwo) {
          const oldImagePath = path.join(imagesDirectory, mcqToUpdate.imageTwo);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
          const newImagePath = path.join(imagesDirectory, mcqToUpdate.imageTwo);
          fs.renameSync(req.files["imageTwo"][0].path, newImagePath);
        } else {
          const newImagePath = path.join(imagesDirectory, newImageTwo);
          fs.renameSync(req.files["imageTwo"][0].path, newImagePath);
          mcqToUpdate.imageTwo = newImageTwo;
        }
      }
      if (req.files["video"]) {
        mcqToUpdate.video = req.files["video"][0].filename;
      }
      const updatedMCQ = await mcqToUpdate.save();
      res.status(200).json({
        status: "success",
        success: true,
        message: "MCQ updated successfully",
        data: updatedMCQ,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: true,
        message: "Error Updating MCQ",
        errorMessage: error.message,
      });
    }
  }
);

app.delete("/mcq/:id/image", async (req, res) => {
  try {
    const mcqId = req.params.id;
    const mcq = await MCQ.findById(mcqId);
    if (!mcq) {
      return res.status(404).json({ error: true, message: "MCQ not found." });
    }
    if (!mcq.image) {
      return res
        .status(400)
        .json({ error: true, message: "MCQ does not have an image." });
    }
    deleteImage(mcq.image);
    mcq.image = null;
    await mcq.save();
    res.status(200).json({
      status: "success",
      success: true,
      message: "Image deleted successfully from MCQ.",
      data: mcq,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: true,
      message: "Internal server error while deleting image from MCQ.",
      errorMessage: error.message,
    });
  }
});
const deleteImage = (filename) => {
  const imagePath = path.join(__dirname, "uploads", filename);
  fs.unlink(imagePath, (err) => {
    if (err) {
      console.error("Error deleting image:", err);
    } else {
      console.log("Image deleted successfully.");
    }
  });
};
app.delete("/mcq/:id/video", async (req, res) => {
  try {
    const mcqId = req.params.id;
    const mcq = await MCQ.findById(mcqId);
    if (!mcq) {
      return res.status(404).json({ error: true, message: "MCQ not found." });
    }
    if (!mcq.video) {
      return res
        .status(400)
        .json({ error: true, message: "MCQ does not have a video." });
    }
    deleteVideo(mcq.video);
    mcq.video = null;
    await mcq.save();
    res.status(200).json({
      status: "success",
      success: true,
      message: "Video deleted successfully from MCQ.",
      data: mcq,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: true,
      message: "Internal server error while deleting video from MCQ.",
      errorMessage: error.message,
    });
  }
});
const deleteVideo = (filename) => {
  const videoPath = path.join(__dirname, "uploads", "videos", filename);

  fs.unlink(videoPath, (err) => {
    if (err) {
      console.error("Error deleting video:", err);
    } else {
      console.log("Video deleted successfully.");
    }
  });
};

app.delete("/mcq/:id/imageTwo", async (req, res) => {
  try {
    const mcqId = req.params.id;
    const mcq = await MCQ.findById(mcqId);
    if (!mcq) {
      return res.status(404).json({ error: true, message: "MCQ not found." });
    }
    if (!mcq.imageTwo) {
      return res
        .status(400)
        .json({ error: true, message: "MCQ does not have a second image." });
    }
    deleteImage(mcq.imageTwo);
    mcq.imageTwo = null;
    await mcq.save();
    res.status(200).json({
      status: "success",
      success: true,
      message: "Second image deleted successfully from MCQ.",
      data: mcq,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: true,
      message: "Internal server error while deleting second image from MCQ.",
      errorMessage: error.message,
    });
  }
});

app.delete("/delete-multiple-mcqs", async (req, res) => {
  try {
    const { mcqIds } = req.body;

    if (!Array.isArray(mcqIds)) {
      return res.status(400).json({
        error: true,
        message: "Invalid input, expected an array of MCQ IDs.",
      });
    }

    const result = await MCQ.deleteMany({ _id: { $in: mcqIds } });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        error: true,
        message: "No MCQs found with the provided IDs.",
      });
    }

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} MCQs deleted successfully.`,
    });
    console.log(`${result.deletedCount} MCQs deleted successfully`);
  } catch (error) {
    res.status(500).json({ error: true, message: "Error Deleting MCQs" });
    console.log("Error Deleting MCQs");
    console.error(error);
  }
});

//quiz routes
app.delete("/delete-quiz/:userId/:quizId", (req, res) => {
  deleteQuiz(User, req, res);
});
app.post("/save-quizzes", async (req, res) => {
  saveQuizzes(User, req, res);
});
app.get("/user-quizzes/:userId", async (req, res) => {
  getUserQuizzes(User, req, res);
});
app.get("/latest-quiz/:userId", async (req, res) => {
  getLatestQuiz(User, req, res);
});
app.get("/user-quiz/:userId/:quizId", async (req, res) => {
  try {
    const { userId, quizId } = req.params;
    const user = await User.findById(userId).populate({
      path: "attemptedQuizzes.questions.questionId",
      model: "Q/A-MCQ",
    });

    if (!user) {
      return res.status(404).json({ error: true, message: "User not found." });
    }
    const quiz = user.attemptedQuizzes.find(
      (quiz) => quiz._id.toString() === quizId
    );
    if (!quiz) {
      return res
        .status(404)
        .json({ error: true, message: "Quiz not found for the user." });
    }
    res.status(200).json({
      status: "success",
      success: true,
      message: "Quiz retrieved successfully",
      data: quiz,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: true,
      message: "Error retrieving quiz",
      errorMessage: error.message,
    });
  }
});

app.get("/user-attempted-questions/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId).populate({
      path: "attemptedQuizzes.questions.questionId",
      model: "Q/A-MCQ",
    });
    if (!user) {
      return res.status(404).json({ error: true, message: "User not found." });
    }
    const attemptedQuestions = user.attemptedQuizzes.reduce(
      (allQuestions, quiz) => {
        return allQuestions.concat(
          quiz.questions
            .map((question) => {
              if (
                question &&
                question.questionId &&
                !question.questionId.deleted
              ) {
                const selectedOption = question.selectedOption;
                const correctAnswer = question.questionId.correctAnswer;
                const isCorrect = selectedOption === correctAnswer;
                return {
                  question: question.questionId,
                  selectedOption: selectedOption,
                  isCorrect: isCorrect,
                };
              } else {
                return null;
              }
            })
            .filter((question) => question !== null)
        );
      },
      []
    );

    res.status(200).json({
      status: "success",
      success: true,
      message: "User Attempted Questions",
      data: attemptedQuestions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: true,
      message: "Error retrieving attempted questions",
      errorMessage: error.message,
    });
  }
});

// app.get("/unattempted-questions/:userId", async (req, res) => {
//   try {
//     const userId = req.params.userId;
//     const user = await User.findById(userId).populate({
//       path: "attemptedQuizzes.questions.questionId",
//       model: "Q/A-MCQ",
//     });
//     if (!user) {
//       return res.status(404).json({ error: true, message: "User not found." });
//     }

//     const allMCQs = await MCQ.find(); // Get all MCQs from the database

//     const attemptedQuestionIds = user.attemptedQuizzes.reduce(
//       (allQuestions, quiz) => {
//         return allQuestions.concat(
//           quiz.questions.map((question) => question.questionId)
//         );
//       },
//       []
//     );

//     // Filter out the unattempted questions
//     const unattemptedQuestions = allMCQs.filter((mcq) => {
//       return !attemptedQuestionIds.includes(mcq._id);
//     });

//     res.status(200).json({
//       status: "success",
//       success: true,
//       message: "Unattempted questions by the user",
//       data: unattemptedQuestions,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       error: true,
//       message: "Error retrieving unattempted questions",
//       errorMessage: error.message,
//     });
//   }
// });

//user routes
app.post(
  "/user-signup",
  [
    body("firstName").notEmpty().withMessage("First name is required"),
    body("lastName").notEmpty().withMessage("Last name is required"),
    body("email").isEmail().withMessage("Invalid email format"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    userSignup(User, req, res);
  }
);
app.get("/verify-email", async (req, res) => {
  verifyEmail(User, req, res);
});
app.post("/user-login", async (req, res) => {
  userLogin(User, testerUser, predefinedAdmin, req, res);
});
app.get("/users", async (req, res) => {
  getUsers(User, req, res);
});
app.post("/forgot-password", async (req, res) => {
  forgotPassword(User, jwt, nodemailer, req, res);
});
app.post("/reset-password/:id/:token", async (req, res) => {
  const { id, token } = req.params;
  const { password, repeatPassword } = req.body;

  try {
    if (password !== repeatPassword) {
      return res
        .status(404)
        .json({ error: true, message: "Password Is Not Matching" });
    }
    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res
          .status(400)
          .json({ error: true, message: "Token Is Not Valid" });
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.findByIdAndUpdate(id, {
          password: hashedPassword,
        });
        return res.status(200).json({
          status: "success",
          success: true,
          message: "Password Reseted successfully",
        });
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: true,
      message: "Error During Reset Process MCQ",
      errorMessage: error.message,
    });
  }
});
app.delete("/delete-user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({
        error: true,
        message: "User not found.",
      });
    }
    res.status(200).json({
      status: "success",
      success: true,
      message: "User deleted successfully.",
    });
    console.log(`User with ID ${userId} deleted successfully`);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: true,
      message: "Error deleting user.",
      errorMessage: error.message,
    });
  }
});

//feedback routes
app.post("/add-feedback/:userId", async (req, res) => {
  addFeedback(User, req, res);
});
app.get("/feedbacks", async (req, res) => {
  getFeedbacks(User, req, res);
});
app.delete("/feedback/:feedbackId", async (req, res) => {
  deleteFeedback(User, req, res);
});
app.put("/edit-feedback/:feedbackId", async (req, res) => {
  editFeedback(User, req, res);
});
app.get("/feedback/:feedbackId", async (req, res) => {
  getFeedbackById(User, req, res);
});
app.get("/user-feedbacks/:userId", async (req, res) => {
  getUserFeedbacks(User, req, res);
});
app.get("/all-feedbacks", async (req, res) => {
  getAllFeedbacks(User, req, res);
});
app.get("/others-feedbacks/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const usersExceptCurrent = await User.find({ _id: { $ne: userId } });
    const allFeedbacksExceptCurrent = [];
    for (const user of usersExceptCurrent) {
      for (const feedback of user.feedbacks) {
        const feedbackData = {
          userId: user._id,
          email: user.email,
          feedbackId: feedback._id,
          name: feedback.name,
          text: feedback.text,
          school: feedback.school,
          rating: feedback.rating,
          feedbackCreatedAt: feedback.feedbackCreatedAt,
        };
        allFeedbacksExceptCurrent.push(feedbackData);
      }
    }
    res.status(200).json({
      status: "success",
      success: true,
      message: "All other feedbacks retrieved successfully",
      data: allFeedbacksExceptCurrent,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: true,
      message: "Internal server error while retrieving feedbacks",
      errorMessage: error.message,
    });
  }
});

app.get("/attempted-questions-analysis", async (req, res) => {
  try {
    const users = await User.find();
    const analysisResults = {};

    for (const user of users) {
      for (const quiz of user.attemptedQuizzes) {
        for (const question of quiz.questions) {
          const questionId = question.questionId.toString();
          let questionAnalysis = analysisResults[questionId];
          if (!questionAnalysis) {
            const optionSelections = {};
            const questionDetails = await MCQ.findById(questionId)
              .select("-__v")
              .lean();
            if (questionDetails && questionDetails.options) {
              for (const optionKey in questionDetails.options) {
                optionSelections[questionDetails.options[optionKey]] = 0;
              }
            }
            if (
              question.selectedOption !== null &&
              question.selectedOption !== undefined
            ) {
              optionSelections[question.selectedOption]++;
            }
            questionAnalysis = {
              totalAttempts: 1,
              questionDetails: questionDetails,
              optionSelections: optionSelections,
            };
            analysisResults[questionId] = questionAnalysis;
          } else {
            questionAnalysis.totalAttempts++;
            if (
              question.selectedOption !== null &&
              question.selectedOption !== undefined
            ) {
              questionAnalysis.optionSelections[question.selectedOption]++;
            }
          }
        }
      }
    }

    res.status(200).json({
      status: "success",
      success: true,
      message: "Attempted questions analysis",
      data: analysisResults,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: true,
      message: "Error retrieving attempted questions analysis",
      errorMessage: error.message,
    });
  }
});

app.get("/all-questions", async (req, res) => {
  try {
    const users = await User.find();
    const allQuestions = users.reduce((questions, user) => {
      const userQuestions = user.attemptedQuizzes.flatMap((quiz) =>
        quiz.questions.map((question) => ({
          questionId: question.questionId,
          selectedOption: question.selectedOption,
        }))
      );
      return questions.concat(userQuestions);
    }, []);
    const optionCount = allQuestions.reduce((count, question) => {
      if (!count[question.questionId]) {
        count[question.questionId] = {};
      }
      if (question.selectedOption !== "") {
        count[question.questionId][question.selectedOption] =
          (count[question.questionId][question.selectedOption] || 0) + 1;
      }
      return count;
    }, []);

    const questionsDetails = [];
    for (const questionId of Object.keys(optionCount)) {
      const question = await MCQ.findById(questionId);
      if (question) {
        const attempts = Object.values(optionCount[questionId]).reduce(
          (total, count) => total + count,
          0
        );
        questionsDetails.push({
          questionId: question._id,
          question: question.question,
          optionsCount: optionCount[questionId],
          attempts: attempts,
          details: question,
        });
      }
    }

    res.status(200).json({
      status: "success",
      success: true,
      message: "All questions retrieved successfully",
      data: questionsDetails,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: true,
      message: "Internal server error while retrieving questions",
      errorMessage: error.message,
    });
  }
});

//this will lower cas the fields
// function toLowerCaseKeys(obj) {
//   const lowercasedObj = {};
//   for (const key in obj) {
//     if (obj.hasOwnProperty(key)) {
//       lowercasedObj[key.toLowerCase()] = obj[key];
//     }
//   }
//   return lowercasedObj;
// }

function toLowerCaseKeys(obj) {
  const lowercasedObj = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      lowercasedObj[key.toLowerCase()] = obj[key];
    }
  }
  return lowercasedObj;
}

function convertOptions(data) {
  const convertedData = { ...data };

  convertedData.optionOne = convertedData["option a"];
  convertedData.optionTwo = convertedData["option b"];
  convertedData.optionThree = convertedData["option c"];
  convertedData.optionFour = convertedData["option d"];
  convertedData.optionFive = convertedData["option e"];
  convertedData.optionSix = convertedData["option f"];
  convertedData.optionOneExplanation = convertedData["option a explanation"];
  convertedData.optionTwoExplanation = convertedData["option b explanation"];
  convertedData.optionThreeExplanation = convertedData["option c explanation"];
  convertedData.optionFourExplanation = convertedData["option d explanation"];
  convertedData.optionFiveExplanation = convertedData["option e explanation"];
  convertedData.optionSixExplanation = convertedData["option f explanation"];

  if (convertedData.answer && typeof convertedData.answer === "string") {
    const answerMapping = {
      a: convertedData["option a"],
      b: convertedData["option b"],
      c: convertedData["option c"],
      d: convertedData["option d"],
      e: convertedData["option e"],
      f: convertedData["option f"],
    };
    convertedData.correctAnswer = answerMapping[convertedData.answer.toLowerCase()];
    delete convertedData.answer;
  }

  delete convertedData["option a"];
  delete convertedData["option b"];
  delete convertedData["option c"];
  delete convertedData["option d"];
  delete convertedData["option e"];
  delete convertedData["option f"];
  delete convertedData["option a explanation"];
  delete convertedData["option b explanation"];
  delete convertedData["option c explanation"];
  delete convertedData["option d explanation"];
  delete convertedData["option e explanation"];
  delete convertedData["option f explanation"];

  return convertedData;
}

function ensureAllFieldsPresent(data) {
  const requiredFields = [
    "usmleStep",
    "USMLE",
    "question",
    "optionOne",
    "optionTwo",
    "optionThree",
    "optionFour",
    "correctAnswer",
    "questionExplanation",

  ];

  const optionalFields = [
    "optionFive",
    "optionFiveExplanation",
    "optionOneExplanation",
    "optionTwoExplanation",
    "optionThreeExplanation",
    "optionFourExplanation",
    "optionSix",
    "optionSixExplanation",
    "comments",
    "image",
    "imageTwo",
    "video",
  ];

  const missingFields = [];

  requiredFields.forEach((field) => {
    if (!data.hasOwnProperty(field) || data[field] === null || data[field] === undefined) {
      missingFields.push(field);
    }
  });

  optionalFields.forEach((field) => {
    if (!data.hasOwnProperty(field)) {
      data[field] = null;
    }
  });

  return { data, missingFields };
}

async function filterDuplicates(questions) {
  const uniqueQuestions = [];
  const duplicates = new Set();
  for (let question of questions) {
    const { USMLE, usmleStep, question: questionText } = question;
    const existingQuestion = await MCQ.findOne({
      USMLE,
      usmleStep,
      question: questionText,
    });
    if (!existingQuestion && !duplicates.has(questionText)) {
      uniqueQuestions.push(question);
      duplicates.add(questionText);
    }
  }
  return uniqueQuestions;
}

app.post("/upload-questions", upload.single("file"), async (req, res) => {
  try {
    const {
      file,
      body: { USMLE, usmleStep },
    } = req;
    const inputFilePath = file.path;
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(inputFilePath);
    const worksheet = workbook.worksheets[0];
    const xlsxWorkbook = xlsx.readFile(inputFilePath);
    const sheetName = xlsxWorkbook.SheetNames[0];
    const sheet = xlsxWorkbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(sheet, { defval: null });

    const questionsToSave = jsonData.map((data, index) => {
      let convertedData = toLowerCaseKeys(data);
      convertedData = convertOptions(convertedData);
      if (!Array.isArray(convertedData.comments)) {
        convertedData.comments = [];
      }
      convertedData.questionExplanation = convertedData.explanation;
      delete convertedData.explanation;
      convertedData.USMLE = USMLE;
      convertedData.usmleStep = usmleStep;
      convertedData.row = index + 1;

      const { data: ensuredData, missingFields } = ensureAllFieldsPresent(convertedData);

      if (missingFields.length > 0) {
        throw new Error(`Missing ${missingFields.join(', ')} in row ${index + 2}, Kindly check the provided file.`);
      }

      return ensuredData;
    });

    for (const image of worksheet.getImages()) {
      const { tl } = image.range;
      const img = workbook.model.media.find((m) => m.index === image.imageId);
      if (img) {
        const imgFileName = `${USMLE}.${tl.nativeRow}.${tl.nativeCol}.${img.name}.${img.extension}`;
        const imgFilePath = path.join(
          __dirname,
          "uploads",
          "images",
          imgFileName
        );
        fs.writeFileSync(imgFilePath, img.buffer);
        console.log("Image File Details:");
        console.log("Row:", tl.nativeRow, "Column:", tl.nativeCol);
        console.log("Name:", img.name);
        console.log("Extension:", img.extension);
        console.log("Size:", img.buffer.length, "bytes");
        console.log("Path:", imgFilePath);

        const question = questionsToSave.find((q) => q.row === tl.nativeRow);
        if (question) {
          console.log("Question for Row:", tl.nativeRow, "=>", question);
          console.log("Column for Image:", tl.nativeCol);
          console.log("Question before modification:", question);
          if (tl.nativeCol === 8) {
            question.image = imgFileName;
          } else if (tl.nativeCol === 10) {
            question.imageTwo = imgFileName;
          }
          console.log("Question after modification:", question);
          console.log("Assigned to Image:", question.image);
          console.log("Assigned to ImageTwo:", question.imageTwo);
          console.log("Image file name:", imgFileName);
          await logImageName(question, imgFileName);
        }
      }
    }

    const uniqueQuestions = await filterDuplicates(questionsToSave);
    const savedQuestions = await MCQ.insertMany(uniqueQuestions);
    fs.unlink(inputFilePath, (err) => {
      if (err) {
        console.error("Error deleting the file:", err);
      }
    });

    res.status(200).json({
      status: "success",
      success: true,
      message: "Questions uploaded and saved successfully.",
      data: savedQuestions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: true,
      message: error.message,
      errorMessage: error.message,
    });
  }
});

//this function will log the names of images
async function logImageName(question, imgFileName) {
  try {
    question.imageTwo = imgFileName;
    console.log("Question object before saving:", question);
    await question.save();
    console.log("Question object after saving:", question);
    console.log("Image file name saved:", imgFileName);
  } catch (error) {
    console.error("Error saving question with image filename:", error);
  }
}

//////////admin routes
async function filterUniqueQuestions(questions) {
  const uniqueQuestions = [];
  const questionMap = new Map();
  for (const question of questions) {
    const questionKey = `${question.question}_${question.optionOne}_${question.optionTwo}_${question.optionThree}_${question.optionFour}_${question.optionFive}_${question.optionSix}`;
    if (!questionMap.has(questionKey)) {
      questionMap.set(questionKey, question);
    } else {
      questionMap.set(questionKey, question);
    }
  }
  for (const value of questionMap.values()) {
    uniqueQuestions.push(value);
  }
  return uniqueQuestions;
}

app.post("/upload-test", upload.single("file"), async (req, res) => {
  try {
    const {
      file,
      body: { usmleStep, testName, testDescription },
    } = req;

    const inputFilePath = file.path;
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(inputFilePath);
    const worksheet = workbook.worksheets[0];
    const xlsxWorkbook = xlsx.readFile(inputFilePath);
    const sheetName = xlsxWorkbook.SheetNames[0];
    const sheet = xlsxWorkbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(sheet, { defval: null });
    const uniqueQuestions = jsonData.map((data, index) => {
      let convertedData = toLowerCaseKeys(data);
      convertedData = convertOptions(convertedData);
      if (!Array.isArray(convertedData.comments)) {
        convertedData.comments = [];
      }
      convertedData.questionExplanation = convertedData.explanation;
      delete convertedData.explanation;
      convertedData.row = index + 1;
      convertedData.testName = testName;
      return ensureAllFieldsPresent(convertedData);
    });
    let test = await Test.findOne({ testName, usmleStep });
    if (!test) {
      test = new Test({
        testName,
        usmleStep,
        testDescription,
      });
    }
    const savedQuestions = await Promise.all(uniqueQuestions.map(async (questionData) => {
      let question = await Question.findOne({ testId: test._id, row: questionData.row });
      if (!question) {
        question = new Question({
          testId: test._id,
          ...questionData,
        });
        await question.save();
      }

      return question._id;
    }));
    const imageUploadPromises = [];
    for (const image of worksheet.getImages()) {
      const { tl } = image.range;
      const img = workbook.model.media.find((m) => m.index === image.imageId);
      if (img) {
        const imgFileName = `${testName}_${usmleStep}_${tl.nativeRow}_${tl.nativeCol}_${img.name}.${img.extension}`;
        const imgFilePath = path.join(
          __dirname,
          "uploads",
          "testimages",
          imgFileName
        );
        fs.writeFileSync(imgFilePath, img.buffer);
        const question = await Question.findOne({ testId: test._id, row: tl.nativeRow });
        if (question) {
          if (tl.nativeCol === 8) {
            question.image = imgFileName;
          } else if (tl.nativeCol === 10) {
            question.imageTwo = imgFileName;
          }
          imageUploadPromises.push(question.save());
        }
      }
    }
    await Promise.all(imageUploadPromises);
    test.questions = savedQuestions;
    await test.save();
    res.status(200).json({
      status: "success",
      success: true,
      message: "Questions and images saved in db",
      data: test,
    });
    fs.unlink(inputFilePath, (err) => {
      if (err) {
        console.error("Error deleting the file:", err);
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: true,
      message: "Error saving questions and images",
      errorMessage: error.message,
    });
  }
});


//delete test by admin
app.delete("/delete-test/:id", async (req, res) => {
  try {
    const testId = req.params.id;
    const deletedTest = await Test.findByIdAndDelete(testId);
    if (!deletedTest) {
      return res.status(404).json({
        error: true,
        message: "Test not found.",
      });
    }
    await Question.deleteMany({ testId: testId });
    await User.updateMany(
      { "attemptedTests.test": testId },
      { $pull: { attemptedTests: { test: testId } } }
    );
    res.status(200).json({
      status: "success",
      success: true,
      message: "Test and associated questions deleted successfully.",
      data: deletedTest,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: true,
      message: "Error deleting test and associated questions.",
      errorMessage: error.message,
    });
  }
});

// app.delete("/delete-users-test/:testId", async (req, res) => {
//   try {
//     const { testId } = req.params;
//     const test = await Test.findById(testId);
//     if (!test) {
//       return res.status(404).json({ error: true, message: "Test not found." });
//     }
//     await Test.findByIdAndDelete(testId);
//     await User.updateMany(
//       { "attemptedTests.test": testId },
//       { $pull: { attemptedTests: { test: testId } } }
//     );
//     res.status(200).json({
//       status: "success",
//       success: true,
//       message: "Test deleted successfully.",
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       error: true,
//       message: "Error deleting test.",
//       errorMessage: error.message,
//     });
//   }
// });

//get all tests by admin


// app.get("/uploaded-tests", async (req, res) => {
//   try {
//     const tests = await Test.find().populate('questions');

//     res.status(200).json({
//       status: "success",
//       success: true,
//       message: "Tests fetched successfully.",
//       data: tests,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       error: true,
//       message: "Error fetching tests.",
//       errorMessage: error.message,
//     });
//   }
// });

app.get("/uploaded-tests", async (req, res) => {
  try {
    const tests = await Test.find();
    res.status(200).json({
      status: "success",
      success: true,
      message: "Tests fetched successfully.",
      data: tests,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: true,
      message: "Error fetching tests.",
      errorMessage: error.message,
    });
  }
});

// app.get('/uploaded-tests', async (req, res) => {
//   try {
//     const tests = await Test.aggregate([
//       {
//         $lookup: {
//           from: 'questions',
//           localField: 'questions',
//           foreignField: '_id',
//           as: 'questions',
//         },
//       },
//       {
//         $addFields: {
//           totalQuestions: { $size: '$questions' },
//         },
//       },
//     ]);

//     res.status(200).json({
//       status: 'success',
//       success: true,
//       message: 'Tests fetched successfully.',
//       data: tests,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       error: true,
//       message: 'Error fetching tests.',
//       errorMessage: error.message,
//     });
//   }
// });
//get single test for admin
app.get("/uploaded-test/:id", async (req, res) => {
  try {
    const testId = req.params.id;
    const test = await Test.findById(testId).populate('questions');
    if (!test) {
      return res.status(404).json({
        error: true,
        message: "Test not found.",
      });
    }
    const totalQuestion = test.questions.length;
    const createSections = (questions, sectionSize) => {
      const sections = [];
      for (let i = 0; i < questions.length; i += sectionSize) {
        sections.push(questions.slice(i, i + sectionSize));
      }
      return sections;
    };
    const sections = createSections(test.questions, 40);
    const formattedSections = sections.map((section, index) => ({
      section: `Section ${index + 1}`,
      questions: section.map((question) => ({
        _id: question._id,
        question: question.question,
        optionOne: question.optionOne,
        optionTwo: question.optionTwo,
        optionThree: question.optionThree,
        optionFour: question.optionFour,
        optionFive: question.optionFive,
        optionSix: question.optionSix,
        correctAnswer: question.correctAnswer,
        questionExplanation: question.questionExplanation,
        optionOneExplanation: question.optionOneExplanation,
        optionTwoExplanation: question.optionTwoExplanation,
        optionThreeExplanation: question.optionThreeExplanation,
        optionFourExplanation: question.optionFourExplanation,
        optionFiveExplanation: question.optionFiveExplanation,
        optionSixExplanation: question.optionSixExplanation,
        comments: question.comments,
        image: question.image,
        imageTwo: question.imageTwo,
        video: question.video,
        row: question.row,
      })),
    }));

    res.status(200).json({
      status: "success",
      success: true,
      message: "Test fetched successfully.",
      data: {
        _id: test._id,
        testName: test.testName,
        testDescription: test.testDescription,
        usmleStep: test.usmleStep,
        totalQuestions: totalQuestion,
        sections: formattedSections,
        testCreatedAt: test.TestCreatedAt,
        version: test.__v,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: true,
      message: "Error fetching test.",
      errorMessage: error.message,
    });
  }
});

// app.get("/manage-test/:id", async (req, res) => {
//   try {
//     const testId = req.params.id;
//     const test = await Test.findById(testId);

//     if (!test) {
//       return res.status(404).json({
//         error: true,
//         message: "Test not found.",
//       });
//     }

//     const formattedQuestions = test.questions.map((question) => ({
//       _id: question._id,
//       question: question.question,
//       optionOne: question.optionOne,
//       optionTwo: question.optionTwo,
//       optionThree: question.optionThree,
//       optionFour: question.optionFour,
//       optionFive: question.optionFive,
//       optionSix: question.optionSix,
//       correctAnswer: question.correctAnswer,
//       questionExplanation: question.questionExplanation,
//       optionOneExplanation: question.optionOneExplanation,
//       optionTwoExplanation: question.optionTwoExplanation,
//       optionThreeExplanation: question.optionThreeExplanation,
//       optionFourExplanation: question.optionFourExplanation,
//       optionFiveExplanation: question.optionFiveExplanation,
//       optionSixExplanation: question.optionSixExplanation,
//       comments: question.comments,
//       image: question.image,
//       imageTwo: question.imageTwo,
//       video: question.video,
//       row: question.row,
//     }));

//     res.status(200).json({
//       status: "success",
//       success: true,
//       message: "Test fetched successfully.",
//       data: {
//         _id: test._id,
//         testName: test.testName,
//         testDescription: test.testDescription,
//         usmleStep: test.usmleStep,
//         totalQuestions: test.questions.length,
//         questions: formattedQuestions,
//         testCreatedAt: test.TestCreatedAt,
//         version: test.__v,
//       },
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       error: true,
//       message: "Error fetching test.",
//       errorMessage: error.message,
//     });
//   }
// });


//user routes
//create test

app.get("/manage-test/:id", async (req, res) => {
  try {
    const testId = req.params.id;
    const test = await Test.findById(testId).populate('questions');

    if (!test) {
      return res.status(404).json({
        error: true,
        message: "Test not found.",
      });
    }
    const formattedQuestions = test.questions.map((question) => ({
      _id: question._id,
      question: question.question,
      optionOne: question.optionOne,
      optionTwo: question.optionTwo,
      optionThree: question.optionThree,
      optionFour: question.optionFour,
      optionFive: question.optionFive,
      optionSix: question.optionSix,
      correctAnswer: question.correctAnswer,
      questionExplanation: question.questionExplanation,
      optionOneExplanation: question.optionOneExplanation,
      optionTwoExplanation: question.optionTwoExplanation,
      optionThreeExplanation: question.optionThreeExplanation,
      optionFourExplanation: question.optionFourExplanation,
      optionFiveExplanation: question.optionFiveExplanation,
      optionSixExplanation: question.optionSixExplanation,
      comments: question.comments,
      image: question.image,
      imageTwo: question.imageTwo,
      video: question.video,
      row: question.row,
    }));
    res.status(200).json({
      status: "success",
      success: true,
      message: "Test fetched successfully.",
      data: {
        _id: test._id,
        testName: test.testName,
        testDescription: test.testDescription,
        usmleStep: test.usmleStep,
        totalQuestions: test.questions.length,
        questions: formattedQuestions,
        testCreatedAt: test.TestCreatedAt,
        version: test.__v,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: true,
      message: "Error fetching test.",
      errorMessage: error.message,
    });
  }
});


// app.post("/save-test-attempt", async (req, res) => {
//   try {
//     const {
//       userId,
//       testId,
//       testAttemptedAt,
//       totalMarks,
//       obtainedScore = 0,
//     } = req.body;
//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({ error: true, message: "User not found." });
//     }

//     const test = await Test.findById(testId);

//     if (!test) {
//       return res.status(404).json({ error: true, message: "Test not found." });
//     }

//     const questions = test.questions;
//     const sections = [];

//     for (let i = 0; i < questions.length; i += 40) {
//       sections.push({
//         sectionNumber: Math.floor(i / 40) + 1,
//         questions: questions.slice(i, i + 40),
//       });
//     }

//     const sectionInfo = 1;

//     const testAttempt = {
//       test: testId,
//       sections: sections,
//       createdAt: testAttemptedAt,
//       totalScore: totalMarks,
//       obtainedScore: obtainedScore,
//       sectionInfo: sectionInfo,
//       usmleSteps: test.usmleStep,
//       USMLE: test.USMLE,
//       testInfo: false,
//     };

//     user.attemptedTests.push(testAttempt);
//     await user.save();

//     res.status(200).json({
//       status: "success",
//       success: true,
//       message: "Test attempt information saved successfully.",
//       testAttempt: testAttempt,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       error: true,
//       message: "Error saving test attempt information.",
//       errorMessage: error.message,
//     });
//   }
// });

//edit test

app.post("/save-test-attempt", async (req, res) => {
  try {
    const {
      userId,
      testId,
      testAttemptedAt,
      totalMarks,
      obtainedScore = 0,
    } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: true, message: "User not found." });
    }

    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({ error: true, message: "Test not found." });
    }
    const questions = await Question.find({ _id: { $in: test.questions } });
    const sections = [];
    for (let i = 0; i < questions.length; i += 40) {
      sections.push({
        sectionNumber: Math.floor(i / 40) + 1,
        questions: questions.slice(i, i + 40),
      });
    }

    const sectionInfo = 1;
    const testAttempt = {
      test: testId,
      sections: sections,
      createdAt: testAttemptedAt,
      totalScore: totalMarks,
      obtainedScore: obtainedScore,
      sectionInfo: sectionInfo,
      usmleSteps: test.usmleStep,
      USMLE: test.USMLE,
      testInfo: false,
    };

    user.attemptedTests.push(testAttempt);
    await user.save();

    res.status(200).json({
      status: "success",
      success: true,
      message: "Test attempt information saved successfully.",
      testAttempt: testAttempt,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: true,
      message: "Error saving test attempt information.",
      errorMessage: error.message,
    });
  }
});

app.put("/update-users-test", async (req, res) => {
  try {
    const {
      userId,
      testId,
      updatedQuestions,
      obtainedScore,
      timeInSeconds,
      sectionInfo,
      testInfo,
    } = req.body;
    if (
      !userId ||
      !testId ||
      !Array.isArray(updatedQuestions) ||
      updatedQuestions.length === 0
    ) {
      return res
        .status(400)
        .json({ error: true, message: "Invalid input data." });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: true, message: "User not found." });
    }
    const attempt = user.attemptedTests.find(
      (attempt) => attempt.test.toString() === testId
    );
    if (!attempt) {
      return res.status(404).json({
        error: true,
        message: "Test attempt not found for the given user and test.",
      });
    }
    updatedQuestions.forEach(({ questionId, selectedOption }) => {
      for (const section of attempt.sections) {
        const question = section.questions.find(
          (question) => question._id.toString() === questionId
        );
        if (question) {
          question.selectedOption = selectedOption;
        }
      }
    });
    attempt.obtainedScore = obtainedScore;
    attempt.timeInSeconds = timeInSeconds;
    attempt.sectionInfo = sectionInfo;
    attempt.testInfo = testInfo;
    user.markModified("attemptedTests");
    await user.save();
    res.status(200).json({
      status: "success",
      success: true,
      message: "Selected options and test info updated successfully.",
      testAttempt: attempt,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: true,
      message: "Error updating selected options.",
      errorMessage: error.message,
    });
  }
});

//get single attempted test by user
app.get("/get-test-attempt/:userId/:testId", async (req, res) => {
  try {
    const { userId, testId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: true, message: "User not found." });
    }
    const testAttempt = user.attemptedTests.find(
      (attempt) => attempt.test.toString() === testId
    );
    if (!testAttempt) {
      return res.status(404).json({ error: true, message: "test not found" });
    }
    res.status(200).json({
      status: "success",
      success: true,
      message: "Test attempt fetched successfully.",
      testAttempt: testAttempt,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: true,
      message: "Error fetching test attempt.",
      errorMessage: error.message,
    });
  }
});

//get all users test
app.get("/user-tests/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId).populate("attemptedTests.test");
    if (!user) {
      return res.status(404).json({ error: true, message: "User not found." });
    }
    res.status(200).json({
      status: "success",
      success: true,
      message: "Tests fetched successfully.",
      tests: user.attemptedTests,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: true,
      message: "Error fetching tests.",
      errorMessage: error.message,
    });
  }
});

// app.get('/user-tests/:userId', async (req, res) => {
//   try {
//     const userId = req.params.userId;
//     const user = await User.findById(userId).populate({
//       path: 'attemptedTests.test',
//       populate: {
//         path: 'questions',
//         model: 'Question',
//       },
//     });

//     if (!user) {
//       return res.status(404).json({ error: true, message: 'User not found.' });
//     }
//     const tests = user.attemptedTests.map((attemptedTest) => ({
//       test: {
//         _id: attemptedTest.test._id,
//         testName: attemptedTest.test.testName,
//         testDescription: attemptedTest.test.testDescription,
//         usmleStep: attemptedTest.test.usmleStep,
//         questions: attemptedTest.test.questions,
//       },
//       createdAt: attemptedTest.createdAt,
//       totalScore: attemptedTest.totalScore,
//       obtainedScore: attemptedTest.obtainedScore,
//       sectionInfo: attemptedTest.sectionInfo,
//       usmleSteps: attemptedTest.usmleSteps,
//       USMLE: attemptedTest.USMLE,
//       testInfo: attemptedTest.testInfo,
//     }));

//     res.status(200).json({
//       status: 'success',
//       success: true,
//       message: 'Tests fetched successfully.',
//       tests: tests,
//       firstName: user.firstName,
//       lastName: user.lastName,
//       email: user.email,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       error: true,
//       message: 'Error fetching tests.',
//       errorMessage: error.message,
//     });
//   }
// });


//get users latest test
app.get("/users-latest-test/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId, {
      attemptedTests: { $slice: -1 },
    }).populate("attemptedTests.test");

    if (!user) {
      return res.status(404).json({ error: true, message: "User not found." });
    }
    if (user.attemptedTests.length === 0) {
      return res.status(200).json({
        status: "success",
        success: true,
        message: "User has not attempted any test",
      });
    }
    const latestTest = user.attemptedTests[0];
    res.status(200).json({
      status: "success",
      success: true,
      message: "Latest test retrieved successfully",
      data: latestTest,
    });

    console.log("Latest test retrieved successfully");
  } catch (error) {
    res.status(500).json({
      error: true,
      message: "Error retrieving latest test of user",
      errorMessage: error.message,
    });
    console.log("Error retrieving latest test of user");
    console.error(error);
  }
});


// app.get('/users-latest-test/:userId', async (req, res) => {
//   try {
//     const { userId } = req.params;

//     const user = await User.findById(userId, { attemptedTests: { $slice: -1 } })
//       .populate({
//         path: 'attemptedTests.test',
//         populate: {
//           path: 'questions',
//           model: 'Question', 
//         },
//       });

//     if (!user) {
//       return res.status(404).json({ error: true, message: 'User not found.' });
//     }

//     if (user.attemptedTests.length === 0) {
//       return res.status(200).json({
//         status: 'success',
//         success: true,
//         message: 'User has not attempted any test',
//       });
//     }

//     const latestTest = user.attemptedTests[0];

//     res.status(200).json({
//       status: 'success',
//       success: true,
//       message: 'Latest test retrieved successfully',
//       data: {
//         test: {
//           _id: latestTest.test._id,
//           testName: latestTest.test.testName,
//           testDescription: latestTest.test.testDescription,
//           usmleStep: latestTest.test.usmleStep,
//           questions: latestTest.test.questions, // Already populated with full Question objects
//         },
//         createdAt: latestTest.createdAt,
//         totalScore: latestTest.totalScore,
//         obtainedScore: latestTest.obtainedScore,
//         sectionInfo: latestTest.sectionInfo,
//         usmleSteps: latestTest.usmleSteps,
//         USMLE: latestTest.USMLE,
//         testInfo: latestTest.testInfo,
//       },
//     });

//     console.log('Latest test retrieved successfully');
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       error: true,
//       message: 'Error retrieving latest test of user',
//       errorMessage: error.message,
//     });
//     console.log('Error retrieving latest test of user');
//   }
// });

app.get("/user-tests-and-quizes/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId).populate("attemptedTests.test");
    const userone = await User.findById(userId).populate({
      path: "attemptedQuizzes.questions.questionId",
      model: "Q/A-MCQ",
    });
    if (!user) {
      return res.status(404).json({ error: true, message: "User not found." });
    }
    // const attemptedQuizzes = user.attemptedQuizzes;
    // if (attemptedQuizzes.length === 0) {
    //   return res.status(200).json({
    //     status: "success",
    //     success: true,
    //     message: "User has not attempted any quiz",
    //   });
    // }
    res.status(200).json({
      status: "success",
      success: true,
      message: "Tests and quizes fetched successfully.",
      tests: user.attemptedTests,
      quizes: userone.attemptedQuizzes,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: true,
      message: "Error fetching tests.",
      errorMessage: error.message,
    });
  }
});

app.get("/all-attempted-tests", async (req, res) => {
  try {
    const users = await User.find().populate("attemptedTests.test");
    if (!users) {
      return res.status(404).json({ error: true, message: "No users found." });
    }
    let allTests = [];
    users.forEach((user) => {
      user.attemptedTests.forEach((testAttempt) => {
        const testInfo = {
          userId: user._id,
          ...testAttempt.toObject(),
        };
        allTests.push(testInfo);
      });
    });
    res.status(200).json({
      status: "success",
      success: true,
      message: "All attempted tests fetched successfully.",
      tests: allTests,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: true,
      message: "Error fetching attempted tests.",
      errorMessage: error.message,
    });
  }
});

app.delete("/delete-users-test/:testId", async (req, res) => {
  try {
    const { testId } = req.params;
    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({ error: true, message: "Test not found." });
    }
    await Test.findByIdAndDelete(testId);
    res.status(200).json({
      status: "success",
      success: true,
      message: "Test deleted successfully.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: true,
      message: "Error deleting test.",
      errorMessage: error.message,
    });
  }
});

////////////////////////
app.post("/add-question-by-user", async (req, res) => {
  try {
    const {
      usmleStep,
      USMLE,
      question,
      optionOne,
      optionTwo,
      optionThree,
      optionFour,
      optionFive,
      optionSix,
      correctAnswer,
      questionExplanation,
      optionOneExplanation,
      optionTwoExplanation,
      optionThreeExplanation,
      optionFourExplanation,
      optionFiveExplanation,
      optionSixExplanation,
      userId,
    } = req.body;
    if (!userId) {
      return res.status(400).json({
        error: true,
        message: "User ID is required in the request body.",
      });
    }

    const mcq = new USERMCQ({
      usmleStep,
      USMLE,
      question,
      optionOne,
      optionTwo,
      optionThree,
      optionFour,
      optionFive,
      optionSix,
      correctAnswer,
      questionExplanation,
      optionOneExplanation,
      optionTwoExplanation,
      optionThreeExplanation,
      optionFourExplanation,
      optionFiveExplanation,
      optionSixExplanation,
      user: userId,
    });

    await mcq.save();

    res.status(201).json({
      status: "success",
      success: true,
      message: "MCQ added successfully",
      data: mcq,
    });
    console.log("MCQ added successfully:", mcq);
  } catch (error) {
    console.error("Error adding MCQ:", error);
    res.status(500).json({
      error: true,
      message: "Internal server error while adding MCQ.",
      errorMessage: error.message,
    });
  }
});

app.get("/questions-by-user", async (req, res) => {
  try {
    const questions = await USERMCQ.find({}).populate("user", "firstName");
    res.status(200).json({
      status: "success",
      success: true,
      message: "All questions fetched successfully",
      data: questions,
    });
    console.log("All questions fetched successfully:", questions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({
      error: true,
      message: "Internal server error while fetching questions.",
      errorMessage: error.message,
    });
  }
});

app.put("/update-user-questions/:questionId", async (req, res) => {
  try {
    const questionId = req.params.questionId;
    const updatedData = req.body;
    delete updatedData.user;
    const updatedQuestion = await USERMCQ.findByIdAndUpdate(
      questionId,
      updatedData,
      { new: true }
    );
    if (!updatedQuestion) {
      return res.status(404).json({
        error: true,
        message: `Question with ID ${questionId} not found.`,
      });
    }
    res.status(200).json({
      status: "success",
      success: true,
      message: `Question with ID ${questionId} updated successfully`,
      data: updatedQuestion,
    });
    console.log(`Question with ID ${questionId} updated successfully`);
  } catch (error) {
    console.error("Error updating question:", error);
    res.status(500).json({
      error: true,
      message: "Internal server error while updating question.",
      errorMessage: error.message,
    });
  }
});

app.delete("/question-by-user/:questionId", async (req, res) => {
  try {
    const questionId = req.params.questionId;
    const deletedQuestion = await USERMCQ.findByIdAndDelete(questionId);

    if (!deletedQuestion) {
      return res.status(404).json({
        error: true,
        message: `Question with ID ${questionId} not found.`,
      });
    }

    res.status(200).json({
      status: "success",
      success: true,
      message: `Question with ID ${questionId} deleted successfully`,
      data: deletedQuestion,
    });
    console.log(`Question with ID ${questionId} deleted successfully`);
  } catch (error) {
    console.error("Error deleting question:", error);
    res.status(500).json({
      error: true,
      message: "Internal server error while deleting question.",
      errorMessage: error.message,
    });
  }
});

app.post("/approve-question/:questionId", async (req, res) => {
  try {
    const questionId = req.params.questionId;
    const userQuestion = await USERMCQ.findById(questionId);

    if (!userQuestion) {
      return res.status(404).json({
        error: true,
        message: `Question with ID ${questionId} not found in USERMCQ collection.`,
      });
    }
    const mcqQuestion = new MCQ({
      usmleStep: userQuestion.usmleStep,
      USMLE: userQuestion.USMLE,
      question: userQuestion.question,
      optionOne: userQuestion.optionOne,
      optionTwo: userQuestion.optionTwo,
      optionThree: userQuestion.optionThree,
      optionFour: userQuestion.optionFour,
      optionFive: userQuestion.optionFive,
      optionSix: userQuestion.optionSix,
      correctAnswer: userQuestion.correctAnswer,
      questionExplanation: userQuestion.questionExplanation,
      optionOneExplanation: userQuestion.optionOneExplanation,
      optionTwoExplanation: userQuestion.optionTwoExplanation,
      optionThreeExplanation: userQuestion.optionThreeExplanation,
      optionFourExplanation: userQuestion.optionFourExplanation,
      optionFiveExplanation: userQuestion.optionFiveExplanation,
      optionSixExplanation: userQuestion.optionSixExplanation,
      comments: userQuestion.comments,
      image: null,
      imageTwo: null,
      video: null,
    });
    await mcqQuestion.save();
    userQuestion.isApproved = true;
    await userQuestion.save();

    res.status(201).json({
      status: "success",
      success: true,
      message: `Question with ID ${questionId} posted to Q/A-MCQ collection successfully and isApproved set to true in USERMCQ.`,
      data: mcqQuestion,
    });
    console.log(
      `Question with ID ${questionId} posted to Q/A-MCQ collection successfully and isApproved set to true in USERMCQ.`
    );
  } catch (error) {
    console.error("Error posting question to Q/A-MCQ collection:", error);
    res.status(500).json({
      error: true,
      message:
        "Internal server error while posting question to Q/A-MCQ collection.",
      errorMessage: error.message,
    });
  }
});

app.get("/users-single-question/:questionId", async (req, res) => {
  try {
    const questionId = req.params.questionId;
    const question = await USERMCQ.findById(questionId).populate(
      "user",
      "firstName"
    );
    if (!question) {
      return res.status(404).json({
        error: true,
        message: `Question with ID ${questionId} not found.`,
      });
    }
    res.status(200).json({
      status: "success",
      success: true,
      message: `Question with ID ${questionId} retrieved successfully`,
      data: question,
    });
    console.log(`Question with ID ${questionId} retrieved successfully`);
  } catch (error) {
    console.error("Error fetching question:", error);
    res.status(500).json({
      error: true,
      message: "Internal server error while fetching question.",
      errorMessage: error.message,
    });
  }
});

app.get("/question-by-user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const questions = await USERMCQ.find({ user: userId }).populate(
      "user",
      "firstName"
    );
    res.status(200).json({
      status: "success",
      success: true,
      message: `Questions of user ${userId} fetched successfully`,
      data: questions,
    });
    console.log(`Questions of user ${userId} fetched successfully:`, questions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({
      error: true,
      message: "Internal server error while fetching questions.",
      errorMessage: error.message,
    });
  }
});

//aboutus routes
app.post("/add-aboutus", addAboutUs);
app.put("/edit-aboutus/:id", editAboutUs);
app.get("/about-us", getAboutUs);

//notifications routes
app.post("/add-notifications", addNotification);
app.get("/get-notifications", getNotifications);
app.get("/users-notifications/:userId", getUserNotifications);
app.delete(
  "/users/:userId/notifications/:notificationId",
  deleteUserNotification
);
app.delete("/delete-notifications/:notificationId", deleteNotification);
app.put("/update-user-notifications/:userId", updateUserNotifications);

app.get("/stats-counts", async (req, res) => {
  try {
    const users = await User.find({});
    const mcqs = await MCQ.countDocuments();
    const totalUserMcqs = await USERMCQ.countDocuments();
    const approvedUserMcqs = await USERMCQ.countDocuments({ isApproved: true });
    const unapprovedUserMcqs = await USERMCQ.countDocuments({ isApproved: false });
    const test = await Test.countDocuments();

    res.status(200).json({
      status: "success",
      success: true,
      message: "Stats Counted",
      users: users,
      totalMcqs: mcqs,
      totalUserMcqs: totalUserMcqs,
      UserApprovedQuestions: approvedUserMcqs,
      UserPEndingQuestions: unapprovedUserMcqs,
      totalTests: test,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: true,
      message: "Failed to get stats count",
      errorMessage: error.message,
    });
  }
});


//////
// app.put(
//   "/edit-question/:testId/:questionId",
//   upload.fields([
//     { name: "image", maxCount: 1 },
//     { name: "imageTwo", maxCount: 1 },
//     // { name: "video", maxCount: 1 },
//   ]),
//   async (req, res) => {
//     try {
//       const { testId, questionId } = req.params;
//       const updatedQuestionData = req.body;
//       const test = await Test.findOne({
//         _id: testId,
//         "questions._id": questionId,
//       });
//       if (!test) {
//         return res.status(404).json({
//           status: "error",
//           message: "Test or Question not found",
//         });
//       }
//       const question = test.questions.id(questionId);
//       Object.assign(question, updatedQuestionData);
//       if (req.files["image"]) {
//         const imageFile = req.files["image"][0];
//         const imageFileName = `${test.testName}_${test.usmleStep
//           }_${Date.now()}_${path.basename(imageFile.originalname)}`;
//         const imageFilePath = path.join(
//           __dirname,
//           "uploads",
//           "testimages",
//           imageFileName
//         );
//         if (question.image) {
//           const oldImagePath = path.join(
//             __dirname,
//             "uploads",
//             "testimages",
//             question.image
//           );
//           if (fs.existsSync(oldImagePath)) {
//             fs.unlinkSync(oldImagePath);
//           }
//         }
//         fs.renameSync(imageFile.path, imageFilePath);
//         question.image = imageFileName;
//       }
//       if (req.files["imageTwo"]) {
//         const imageTwoFile = req.files["imageTwo"][0];
//         const imageTwoFileName = `${test.testName}_${test.usmleStep
//           }_${Date.now()}_${path.basename(imageTwoFile.originalname)}`;
//         const imageTwoFilePath = path.join(
//           __dirname,
//           "uploads",
//           "testimages",
//           imageTwoFileName
//         );
//         if (question.imageTwo) {
//           const oldImageTwoPath = path.join(
//             __dirname,
//             "uploads",
//             "testimages",
//             question.imageTwo
//           );
//           if (fs.existsSync(oldImageTwoPath)) {
//             fs.unlinkSync(oldImageTwoPath);
//           }
//         }

//         fs.renameSync(imageTwoFile.path, imageTwoFilePath);
//         question.imageTwo = imageTwoFileName;
//       }
//       // if (req.files['video']) {
//       //   const videoFile = req.files['video'][0];
//       //   const videoFileName = `${test.testName}_${test.usmleStep}_${Date.now()}_${path.basename(videoFile.originalname)}`;
//       //   const videoFilePath = path.join(__dirname, 'uploads', 'testvideos', videoFileName);
//       //   if (question.video) {
//       //     const oldVideoPath = path.join(__dirname, 'uploads', 'testvideos', question.video);
//       //     if (fs.existsSync(oldVideoPath)) {
//       //       fs.unlinkSync(oldVideoPath);
//       //     }
//       //   }

//       //   fs.renameSync(videoFile.path, videoFilePath);
//       //   question.video = videoFileName;
//       // }
//       await test.save();

//       res.status(200).json({
//         status: "success",
//         message: "Question updated successfully",
//         data: question,
//       });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({
//         status: "error",
//         message: "Error updating question",
//         errorMessage: error.message,
//       });
//     }
//   }
// );

app.put(
  "/edit-question/:questionId",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "imageTwo", maxCount: 1 },
    // { name: "video", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { questionId } = req.params;
      const updatedQuestionData = req.body;
      const question = await Question.findOneAndUpdate(
        { _id: questionId },
        { $set: updatedQuestionData },
        { new: true }
      );
      if (!question) {
        return res.status(404).json({
          status: "error",
          message: "Question not found",
        });
      }
      if (req.files["image"]) {
        const imageFile = req.files["image"][0];
        const imageFileName = `${question.usmleStep}_${Date.now()}_${path.basename(imageFile.originalname)}`;
        const imageFilePath = path.join(__dirname, "uploads", "testimages", imageFileName);
        if (question.image) {
          const oldImagePath = path.join(__dirname, "uploads", "testimages", question.image);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        fs.renameSync(imageFile.path, imageFilePath);
        question.image = imageFileName;
      }
      if (req.files["imageTwo"]) {
        const imageTwoFile = req.files["imageTwo"][0];
        const imageTwoFileName = `${question.usmleStep}_${Date.now()}_${path.basename(imageTwoFile.originalname)}`;
        const imageTwoFilePath = path.join(__dirname, "uploads", "testimages", imageTwoFileName);
        if (question.imageTwo) {
          const oldImageTwoPath = path.join(__dirname, "uploads", "testimages", question.imageTwo);
          if (fs.existsSync(oldImageTwoPath)) {
            fs.unlinkSync(oldImageTwoPath);
          }
        }
        fs.renameSync(imageTwoFile.path, imageTwoFilePath);
        question.imageTwo = imageTwoFileName;
      }
      await question.save();
      res.status(200).json({
        status: "success",
        message: "Question updated successfully",
        data: question,
      });
    } catch (error) {
      console.error("Error updating question:", error);
      res.status(500).json({
        status: "error",
        message: "Error updating question",
        errorMessage: error.message,
      });
    }
  }
);

app.delete("/delete-question/:testId/:questionId", async (req, res) => {
  try {
    const { testId, questionId } = req.params;
    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({
        status: "error",
        message: "Test not found",
      });
    }
    const questionIndex = test.questions.findIndex(
      (q) => q._id.toString() === questionId
    );
    if (questionIndex === -1) {
      return res.status(404).json({
        status: "error",
        message: "Question not found in the test",

      });
    }
    test.questions.splice(questionIndex, 1);
    await test.save();
    res.status(200).json({
      status: "success",
      message: "Question deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Error deleting question",
      errorMessage: error.message,
    });
  }
});

// app.get("/get-question/:testId/:questionId", async (req, res) => {
//   try {
//     const { testId, questionId } = req.params;
//     const test = await Test.findById(testId);
//     if (!test) {
//       return res.status(404).json({
//         error: true,
//         success: false,
//         message: "Test not found",
//       });
//     }
//     const question = test.questions.find(
//       (q) => q._id.toString() === questionId
//     );
//     if (!question) {
//       return res.status(404).json({
//         error: true,
//         success: false,
//         message: "Question not found in the test",
//       });
//     }
//     res.status(200).json({
//       status: "success",
//       data: question,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       error: true,
//       success: false,
//       message: "Error fetching question details",
//       errorMessage: error.message,
//     });
//   }
// });

app.get('/get-question/:testId/:questionId', async (req, res) => {
  try {
    const { testId, questionId } = req.params;
    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({
        error: true,
        success: false,
        message: 'Test not found',
      });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        error: true,
        success: false,
        message: 'Question not found',
      });
    }
    res.status(200).json({
      success: true,
      error: false,
      message: 'Question fetched',
      data: question,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: true,
      success: false,
      message: 'Error fetching question details',
      errorMessage: error.message,
    });
  }
});

// app.post('/comment-in-test/:testId/:questionId', async (req, res) => {
//   const { testId, questionId } = req.params;
//   const { commentText } = req.body;

//   try {
//     const test = await Test.findById(testId);
//     if (!test) {
//       return res.status(404).json({
//         error: true,
//         success: false,
//         message: "Test not found",
//       });
//     }
//     const question = test.questions.id(questionId);
//     if (!question) {
//       return res.status(404).json({
//         error: true,
//         success: false,
//         message: "Question not found",
//       });
//     }
//     question.comments.push({ commentText });
//     await test.save();
//     res.status(200).json({
//       status: "success",
//       success: true,
//       message: "Comment added successfully",
//       data: question,
//     });
//   } catch (error) {
//     res.status(500).json({
//       error: true,
//       success: false,
//       message: "Server Error",
//       errorMessage: error.message,
//     });
//   }
// });

app.post('/comment-in-test/:questionId', async (req, res) => {
  const { questionId } = req.params;
  const { commentText } = req.body;

  try {
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        error: true,
        success: false,
        message: "Question not found",
      });
    }
    question.comments.push({ commentText });
    await question.save();
    res.status(200).json({
      status: "success",
      success: true,
      message: "Comment added successfully",
      data: question,
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      success: false,
      message: "Server Error",
      errorMessage: error.message,
    });
  }
});


app.get('/test-questions-with-comments', async (req, res) => {
  try {
    const questionsWithComments = await Question.find({
      'comments': { $exists: true, $not: { $size: 0 } }
    }, {
      _id: 1,
      question: 1,
      optionOne: 1,
      optionTwo: 1,
      optionThree: 1,
      optionFour: 1,
      optionFive: 1,
      optionSix: 1,
      correctAnswer: 1,
      questionExplanation: 1,
      optionOneExplanation: 1,
      optionTwoExplanation: 1,
      optionThreeExplanation: 1,
      optionFourExplanation: 1,
      optionFiveExplanation: 1,
      optionSixExplanation: 1,
      image: 1,
      imageTwo: 1,
      comments: 1
    }).populate('testId', 'testName');
    if (!questionsWithComments || questionsWithComments.length === 0) {
      return res.status(404).json({
        error: true,
        success: false,
        message: "No questions with comments found",
      });
    }
    res.status(200).json({
      status: "success",
      success: true,
      message: "Questions with comments fetched successfully",
      data: questionsWithComments,
    });

  } catch (error) {
    console.error("Error fetching questions with comments:", error);
    res.status(500).json({
      error: true,
      success: false,
      message: "Error fetching questions with comments",
      errorMessage: error.message,
    });
  }
});


app.delete('/delete-comment/:questionId/:commentId', async (req, res) => {
  const { questionId, commentId } = req.params;

  try {
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        error: true,
        success: false,
        message: "Question not found",
      });
    }
    const commentIndex = question.comments.findIndex(comment => comment._id.toString() === commentId);
    if (commentIndex === -1) {
      return res.status(404).json({
        error: true,
        success: false,
        message: "Comment not found",
      });
    }
    question.comments.splice(commentIndex, 1);
    await question.save();
    res.status(200).json({
      status: "success",
      success: true,
      message: "Comment deleted successfully",
    });

  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({
      error: true,
      success: false,
      message: 'Server Error',
      errorMessage: error.message
    });
  }
});



app.post('/add-tester-user', (req, res) => {
  addTesterUser(testerUser, req, res);
});

app.delete('/delete-tester-user/:id', (req, res) => {
  deleteTesterUser(testerUser, req, res);
});

app.get('/get-tester-users', (req, res) => {
  getTesterUsers(testerUser, req, res);
});

app.put('/edit-tester-user/:id', (req, res) => {
  editTesterUser(testerUser, req, res);
});

//server
app.listen(PORT, () => {
  console.log("==================================");
  console.log(`Server is running on port ${PORT}`);
});
