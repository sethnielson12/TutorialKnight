const mongoose = require("mongoose");

const userModel = mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    user_tut_list:[
        {
            title:{
                type:String,
                required: true,
            },
            intro_text:{
                type:String,
                required: true,
            },
            intro_img:{
                type:String,
                required: true,
            },
            steps:[
                {
                    step_text: {
                        type: String,
                        required: true,
                    },
                    step_ref: {
                        type: String,
                        required: true,
                    },
                    step_img: {
                        type: String,
                        required: true,
                    },

                }
            ],
            outro_text:{
                type:String,
                required: true,
            },
            outro_img:{
                type:String,
                required: true,
            },
        }
    ]
});

var model = mongoose.model("user", userModel);
module.exports = model;