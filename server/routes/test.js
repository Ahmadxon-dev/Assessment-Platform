const {Router} = require('express')
const router = Router()
const Test = require("../models/Test")
const TopicAndQuestion = require("../models/TopicAndQuestion")
const upload = require("../middleware/upload")
const cloudinary = require('cloudinary').v2;
const {v4: uuidv4} = require('uuid');
//start

router.get("/getfulltestdb", async (req, res) => {
    const data = await TopicAndQuestion.find()
    return res.json(data)
})
router.post("/start", async (req, res) => {
    const { time, subtopicnamesArray, userEmail, userId, numberOfQuestions } = req.body;
    const { b, q, m } = numberOfQuestions;

    const totalRequested = b + q + m;

    // Step 1: Fetch all topics containing the selected subtopics
    const topics = await TopicAndQuestion.find({
        "subtopics.subtopicname": { $in: subtopicnamesArray }
    });

    if (!topics || topics.length === 0) {
        return res.status(400).json({ error: "Subtopic not found in any topic" });
    }

    // Step 2: Collect all questions from selected subtopics
    let allQuestions = [];
    topics.forEach(topic => {
        topic.subtopics?.forEach(subtopic => {
            if (subtopicnamesArray.includes(subtopic.subtopicname)) {
                allQuestions.push(...subtopic.questions);
            }
        });
    });

    // Step 3: Filter questions by status
    const grouped = {
        b: allQuestions.filter(q => q.status === 'b'),
        q: allQuestions.filter(q => q.status === 'q'),
        m: allQuestions.filter(q => q.status === 'm'),
    };

    if(grouped.b.length < b){
        return res.status(400).json({error: "Bilishga tegishli savollar yetarli emas. Savollar sonini kamaytiring."})
    }
    if(grouped.q.length < q){
        return res.status(400).json({error: "Qo'llashga tegishli savollar yetarli emas. Savollar sonini kamaytiring."})
    }
    if(grouped.m.length < m){
        return res.status(400).json({error: "Mulohazaga tegishli savollar yetarli emas. Savollar sonini kamaytiring."})
    }

    // Step 5: Randomly select required number from each group
    const getRandomSubset = (arr, count) => arr.sort(() => 0.5 - Math.random()).slice(0, count);

    const selectedB = getRandomSubset(grouped.b, b);
    const selectedQ = getRandomSubset(grouped.q, q);
    const selectedM = getRandomSubset(grouped.m, m);

    const orderedQuestions = [...selectedB, ...selectedQ, ...selectedM];

    // Step 6: Shuffle all selected questions together
    const finalQuestions = orderedQuestions.map(question => ({
        questionText: question.questionText,
        questionImage: question.questionImage || null,
        options: {
            option1: { text: question.options.option1?.text || "", image: question.options.option1?.image || null },
            option2: { text: question.options.option2?.text || "", image: question.options.option2?.image || null },
            option3: { text: question.options.option3?.text || "", image: question.options.option3?.image || null },
            option4: { text: question.options.option4?.text || "", image: question.options.option4?.image || null },
            option5: { text: question.options.option5?.text || "", image: question.options.option5?.image || null }
        },
        selectedAnswer: "",
        correctAnswer: question.answer,
        status: question.status || null,
        solutionImage: question.solutionImage || null
    }));

    const newTest = new Test({
        subtopicname: subtopicnamesArray,
        questions: finalQuestions,
        startTime: new Date(),
        remainingTime: time,
        isCompleted: false,
        result: 0,
        userEmail,
        userId
    });

    await newTest.save();
    return res.status(200).json({ msg: "Test yaratildi", testId: newTest._id, newTest });
});
router.get("/all-results", async (req, res) => {
    const test = await Test.find().populate('userId')
    return res.status(200).json(test)
})
router.get("/:testId", async (req, res) => {
    const {testId} = req.params
    await Test.findById(testId)
        .then(test => {
            return res.status(200).json(test)
        })
})

router.put("/submit/:testId", async (req, res) => {
    const {testId} = req.params
    const {remainingTime, isCompleted} = req.body
    const test = await Test.findById(testId)
    test.remainingTime = remainingTime
    test.isCompleted = isCompleted
    let score = 0
    const questionsNumber = test.questions.length
    for (let i = 0; i < questionsNumber; i++) {
        if (test.questions[i].correctAnswer === test.questions[i].selectedAnswer) {
            score += 1
        }
    }
    test.result = score
    await test.save()
    if (!test) return res.status(400).json({error: "Test not updated"})
    return res.status(200).json({msg: "Test updated"})

})

router.put("/:testId/answer", async (req, res) => {
    const {testId} = req.params
    const {questionIndex, selectedAnswer} = req.body
    try {
        const test = await Test.findById(testId)
        if (questionIndex < 0 || questionIndex >= test.questions.length) {
            return res.status(400).json({message: "Invalid question index"});
        }
        test.questions[questionIndex].selectedAnswer = selectedAnswer;
        await test.save()
    } catch (e) {
        console.log(e)
    }
})

router.get("/results/:userEmail", async (req, res) => {
    const {userEmail} = req.params
    const test = await Test.find({userEmail}).populate("userId").sort({_id: -1})
    return res.json(test)
})


router.put("/topics/add", async (req, res) => {
    const {newMainTopic} = req.body
    const newTopic = new TopicAndQuestion({
        maintopicname: newMainTopic, subtopics: []
    })
    await newTopic.save()
    const newData = await TopicAndQuestion.find()
    return res.status(200).json({msg: "Yangi bo'lim muvaffaqiyatli yaratildi", newData})
})
router.delete("/topics/delete", async (req, res) => {
    const {mainTopicId} = req.body
    await TopicAndQuestion.findByIdAndDelete(mainTopicId)
    const newData = await TopicAndQuestion.find()
    return res.status(200).json({msg: "Bo'lim muvaffaqiyatli o'chirildi", newData})
})
router.put("/topics/edit", async (req, res) => {
    const {mainTopicId, newMainTopicName} = req.body
    await TopicAndQuestion.findByIdAndUpdate(mainTopicId, {maintopicname: newMainTopicName})
    const newData = await TopicAndQuestion.find()
    return res.status(200).json({msg: "Bo'lim muvaffaqiyatli o'zgartirildi", newData})
})


router.post("/subtopics/add", async (req, res) => {
    const {newSubTopic, mainTopicId} = req.body
    await TopicAndQuestion.findByIdAndUpdate(mainTopicId, {
        $push: {
            subtopics: {
                subtopicname: newSubTopic, questions: []
            }
        }
    }, {new: true})
    const newData = await TopicAndQuestion.find()
    return res.status(200).json({msg: "Yangi mavzu muvaffaqiyatli yaratildi", newData})
})
router.delete("/subtopics/delete", async (req, res) => {
    const {subTopicName, mainTopicId} = req.body
    await TopicAndQuestion.findByIdAndUpdate(mainTopicId, {
        $pull: {
            subtopics: {subtopicname: subTopicName}
        }
    }, {new: true})
    const newData = await TopicAndQuestion.find()
    return res.status(200).json({msg: "Mavzu muvaffaqiyatli o'chirildi", newData})
})

router.put("/subtopics/edit", async (req, res) => {
    const {mainTopicId, newSubTopicName, oldSubTopicName} = req.body
    await TopicAndQuestion.findOneAndUpdate({
        _id: mainTopicId,
        "subtopics.subtopicname": oldSubTopicName
    }, {$set: {"subtopics.$.subtopicname": newSubTopicName}}, {new: true})
    const newData = await TopicAndQuestion.find()
    return res.status(200).json({msg: "Mavzu muvaffaqiyatli o'zgartirildi", newData})
})


router.delete("/questions/delete", async (req, res) => {
    const {mainTopicId, subTopicName, questionId} = req.body;
    await TopicAndQuestion.findOneAndUpdate({_id: mainTopicId, "subtopics.subtopicname": subTopicName}, {
        $pull: {
            "subtopics.$[subtopic].questions": {questionId}
        }
    }, {
        new: true, arrayFilters: [{"subtopic.subtopicname": subTopicName}] // Ensures it targets only the correct subtopic
    });

    const newData = await TopicAndQuestion.find()
    return res.status(200).json({msg: "Savol muvaffaqiyatli o'chirildi", newData})
})
// multer file
router.post('/questions/add', upload, async (req, res) => {
    try {
        const {questionText, answer, optionsText, mainTopicId, subTopicName, questionStatus} = req.body;
        // Upload images to Cloudinary
        const uploadToCloudinary = (imageBuffer, imageName) => {
            return new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream({
                    resource_type: 'auto',
                    public_id: imageName,
                    // folder: 'quiz-platform',
                    folder: 'itfizika',
                    quality: 40,
                    fetch_format: 'auto'
                }, (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result.secure_url); // Return the Cloudinary URL
                    }
                }).end(imageBuffer); // Pass the image buffer directly to Cloudinary
            });
        };
        // Collect image files (in memory)
        const questionImage = req.files['questionImage'] ? req.files['questionImage'][0] : null;
        const solutionImage = req.files['solutionImage'] ? req.files['solutionImage'][0] : null;

        const questionImageUrl = questionImage ? await uploadToCloudinary(questionImage.buffer, `question_${uuidv4()}`) : null;
        const solutionImageUrl = solutionImage ? await uploadToCloudinary(solutionImage.buffer, `solution_image`) : null;


        const optionImages = [];
        for (let i = 1; i <= 5; i++) {
            const image = req.files[`optionImage${i}`];  // Expecting 'optionImage1', 'optionImage2', ...
            if (image) {
                optionImages.push(image[0]);  // Only the first file in the array
            } else {
                optionImages.push(null);  // No image for this option
            }
        }
        const optionImageUrls = [];
        for (let i = 0; i < 5; i++) {
            const imageFile = optionImages[i];  // Get the image for the i-th option
            if (imageFile) {
                const imageUrl = await uploadToCloudinary(imageFile.buffer, `option_${uuidv4()}_${i}`);
                optionImageUrls.push(imageUrl);
            } else {
                optionImageUrls.push(null); // If no image, set to null
            }
        }
        const options = {};
        for (let i = 0; i < 5; i++) {
            options[`option${i + 1}`] = {
                text: optionsText[i] || '', // Default to empty if not provided
                image: optionImageUrls[i] || null // If no image, set to null
            };
        }
        await TopicAndQuestion.findOneAndUpdate({_id: mainTopicId, "subtopics.subtopicname": subTopicName}, {
            $push: {
                "subtopics.$.questions": {
                    questionId: uuidv4(),
                    questionText: questionText,
                    questionImage: questionImageUrl,
                    answer,
                    solutionImage: solutionImageUrl,
                    options: options,
                    status: questionStatus,
                }
            }
        }, {new: true})
        const newData = await TopicAndQuestion.find()
        return res.status(200).json({msg: "Muvaffaqiyatli yaratildi", newData})
    } catch (err) {
        res.status(500).json({message: 'Error adding question', error: err});
    }
});


const uploadToCloudinary = (buffer, publicId) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream({
            resource_type: 'auto', public_id: publicId,
            // folder: 'quiz-platform',
            folder: 'itfizika',
            quality: 40, fetch_format: 'auto'

        }, (err, result) => {
            if (err) return reject(err);
            resolve(result.secure_url);
        }).end(buffer);
    });
};
router.patch('/questions/edit', upload, async (req, res) => {
    try {
        const {
            questionText, answer, optionsText, subTopicName, questionStatus, questionId
        } = req.body;

        // Collect the current images and check if new images are provided
        const questionImageFile = req.files['questionImage']?.[0] || null;
        const solutionImageFile = req.files['solutionImage']?.[0] || null;

        const questionImageUrl = questionImageFile
            ? await uploadToCloudinary(questionImageFile.buffer, `question_${uuidv4()}`)
            : null;

        const solutionImageUrl = solutionImageFile
            ? await uploadToCloudinary(solutionImageFile.buffer, `solution_${uuidv4()}`)
            : null;

        // const optionImagesFiles = Array(5).fill(null).map((_, idx) => req.files[`optionImage${idx + 1}`]?.[0] || null);

        const optionImagesFiles = Array(5).fill(null).map((_, idx) => {
            let file = req.files[`optionImage${idx + 1}`]?.[0] || null;

            // If file is explicitly the string "null", treat it as null
            if (file === "null") {
                file = null;
            }

            return file;
        });
        const optionImageUrls = await Promise.all(optionImagesFiles.map((file, idx) => {
            return file ? uploadToCloudinary(file.buffer, `option_${uuidv4()}_${idx + 1}`) : null;
        }));

        const updateFields = {
            'subtopics.$.questions.$[elem].questionText': questionText,
            'subtopics.$.questions.$[elem].answer': answer,
            'subtopics.$.questions.$[elem].status': questionStatus,
        };

        // Handle questionImage - if new image URL exists, set it; else keep existing
        if (questionImageUrl) {
            updateFields['subtopics.$.questions.$[elem].questionImage'] = questionImageUrl;
        }
        // If no new question image, ensure we don't overwrite the existing one
        else if (req.body.questionImage !== undefined && req.body.questionImage !== null && req.body.questionImage !== "null") {
            updateFields['subtopics.$.questions.$[elem].questionImage'] = req.body.questionImage;
        }

        // Handle solutionImage
        if (solutionImageUrl) {
            updateFields['subtopics.$.questions.$[elem].solutionImage'] = solutionImageUrl;
        }
        // If no new solution image, ensure we don't overwrite the existing one
        else if (req.body.solutionImage !== undefined && req.body.solutionImage !== null && req.body.solutionImage !== "null") {
            updateFields['subtopics.$.questions.$[elem].solutionImage'] = req.body.solutionImage;
        }
        for (let i = 0; i < 5; i++) {
            updateFields[`subtopics.$.questions.$[elem].options.option${i + 1}.text`] = optionsText[i] || '';

            const currentImage = optionImageUrls[i];

            if (currentImage) {
                updateFields[`subtopics.$.questions.$[elem].options.option${i + 1}.image`] = currentImage;
            } else {
                // If `null` is passed from frontend, explicitly set it as null in the DB
                const frontendImage = req.body[`optionImage${i + 1}`];

                if (frontendImage === null || frontendImage === "null") {
                    updateFields[`subtopics.$.questions.$[elem].options.option${i + 1}.image`] = null;
                }
                // Retain existing image if no new image is provided
                else if (frontendImage && !frontendImage.includes('cloudinary.com')) {
                    // Existing image URL (non-Cloudinary links will be preserved)
                    updateFields[`subtopics.$.questions.$[elem].options.option${i + 1}.image`] = frontendImage;
                }
            }
        }
        // Perform the update
        const result = await TopicAndQuestion.findOneAndUpdate({
            'subtopics.subtopicname': subTopicName,
            'subtopics.questions.questionId': questionId
        }, { $set: updateFields }, {
            new: true,
            arrayFilters: [{ 'elem.questionId': questionId }]
        });

        if (!result) {
            return res.status(404).json({ message: 'Question not found' });
        }

        // Return updated data
        const newData = await TopicAndQuestion.find();
        res.status(200).json({
            msg: 'Savol muvaffaqiyatli yangilandi', newData
        });
    } catch (err) {
        console.error('Error editing question:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

router.put("/questions/edit/status", async (req,res)=>{
    const {topicName, subtopicName, questionId, newStatus} = req.body
    try {
        // Validate the new status
        if (!['b', 'q', 'm'].includes(newStatus)) {
            return res.status(400).json({ msg: 'Invalid status provided' });
        }

        // Find the topic by its name
        const topic = await TopicAndQuestion.findOne({ 'maintopicname': topicName });

        if (!topic) {
            return res.status(404).json({ msg: 'Topic not found' });
        }

        // Find the subtopic within the topic
        const subtopic = topic.subtopics.find(sub => sub.subtopicname === subtopicName);

        if (!subtopic) {
            return res.status(404).json({ msg: 'Subtopic not found' });
        }

        // Find the specific question by its questionId
        const question = subtopic.questions.find(q => q.questionId === questionId);

        if (!question) {
            return res.status(404).json({ msg: 'Question not found' });
        }

        // Update the status of the found question
        question.status = newStatus;

        // Save the updated topic back to the database
        await topic.save();

        // Return the updated topic data as response
        const newData = await TopicAndQuestion.find();
        res.status(200).json({
            msg: 'Savol muvaffaqiyatli yangilandi',
            newData
        });

    } catch (error) {
        console.error('Error updating question status:', error.message);
        res.status(500).json({ msg: 'Internal Server Error' });
    }
})



module.exports = router