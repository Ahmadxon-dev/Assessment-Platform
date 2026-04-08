const {Schema, model} = require("mongoose");

const TestSchema = new Schema({
    subtopicname:[{type:String, required:true}],
    questions: [{
        questionText: { type: String, required: true }, // Question text
        questionImage: { type: String, default: null },
        options: {
            option1: {
                text: { type: String, required: true },
                image: { type: String, default: null }
            },
            option2: {
                text: { type: String, required: true },
                image: { type: String, default: null }
            },
            option3: {
                text: { type: String, required: true },
                image: { type: String, default: null }
            },
            option4: {
                text: { type: String, required: true },
                image: { type: String, default: null }
            },
            option5: {
                text: { type: String, required: true },
                image: { type: String, default: null }
            }
        },
        selectedAnswer: {
            type: String,
            // enum: ['option1', 'option2', 'option3', 'option4'],
            required: false
        },
        solutionImage:{
            type:String,
            required: false
        },
        correctAnswer: {
            type: String,
            enum: ['option1', 'option2', 'option3', 'option4', 'option5'],
            required: true
        },
        status:{
            type:String,
            required:false,
            default:null
        }
    }],
    startTime: Date,
    remainingTime: Number, //  time in seconds
    isCompleted: Boolean,
    result:{type:Number, default:0},
    userEmail:{type:String},
    userId: { type: Schema.ObjectId, ref: 'Person', required: true }
},  {timestamps:true, collection: "Tests"})

module.exports = model("Test", TestSchema)