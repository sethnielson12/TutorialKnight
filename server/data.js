const uuid = require("uuid");

var data = {
    tutorial_list:[
        {
            title: "test title",
            intro_text: "intro test text",
            intro_img: "intro test img.jpg",
            steps: [
                {
                    step_text: "test step_text",
                    step_ref: "this is step_ref_img",
                    step_img: "this is step_result_img",
                }
            ],
            outro_text: "test outro text",
            outro_img: "outro img.jpg",
            ID: uuid.v4(),
        }
    ],

    Users: [
        {
            email: "",
            password: "",
            user_tut_list: [
                {
                    title: "",
                    intro_text: "",
                    intro_img: "",
                    steps: [
                        {
                            step_text: "",
                            step_ref: "",
                            step_img: "",
                        }
                    ],
                    outro_text: "",
                    outro_img: "",
                    tut_ID: uuid.v4(),
                }

            ],
            user_ID: uuid.v4()
        }
    ]
}

module.exports = data;