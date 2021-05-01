const url = "http://localhost:3000"

var app = new Vue ( {
    el: "#app",

    data: {
        page: "main",
        new_title: "",
        intro_img: "",
        intro_text: "",
        outro_img: "",
        outro_text: "",
        step: 1,
        dialog: false,
        finalize_dialog: false,
        steps_container: [
            {
                step_text: "",
                step_img: "",
                step_ref: "",
            },
        ],
        tutorial_list: [], //this holds all tutorials
        display_tut: {},
        register_email: "",
        register_password: "",
        login_email: "",    //log in email and password
        login_password: "",
        tutNav: false,
        intro_editing: false,
        steps_editing: false,
        outro_editing: false,
        users_id: "",
        isLoggedin: false,
        entire_user: {},

        editMode: false,
        // start //
        dispayTutFilled: false,
        // end //
        user_type: "sign",

        //image selector variables
        current_type: "",
        imageName: '',
		imageUrl: '',
        imageFile: '',
        overlay: false,


    },
    //LIST OF TUTS ACCESSED BY (entire_user.user_tut_list[i].*) refer to user.js for structure
    created: function () {
      //this.getFullTutList();
      this.isUserLogin();
    },

    methods: {
        /////pick image file functions
        pickFile (Type) {
            //if()
            //console.log("type", Type)
            this.current_type = Type
            if(Type[0] == "s"){
                this.$refs[Type][0].click()
            } else {
                this.$refs[Type].click()
            }
            //this.$refs[Type].click()
        },
		
		onFilePicked (e) {
            //console.log(e)
			const files = e.target.files
			if(files[0] !== undefined) {
				this.imageName = files[0].name
				if(this.imageName.lastIndexOf('.') <= 0) {
					return
				}
				const fr = new FileReader ()
				fr.readAsDataURL(files[0])
				fr.addEventListener('load', () => {
                    //if statements
                    if(this.current_type == "intro_image"){
                        //console.log("intro image picked")
                        this.intro_img = fr.result
                    } else if (this.current_type == "outro_image"){
                        //console.log("outro image picked")
                        this.outro_img = fr.result
                    } else if (this.current_type == "intro_image_D"){
                        this.display_tut.intro_img = fr.result

                    } else if (this.current_type == "outro_image_D"){
                        this.display_tut.outro_img = fr.result
                    } else {
                        console.log("this is steps")
                        var temp = ""
                        for(var i = 1; i < this.current_type.length; i ++){
                            temp += this.current_type[i];
                        }
                        var num = Number(temp)
                        //console.log("the index being stored at: ", num)
                        this.steps_container[num].step_img = fr.result

                    }
					//this.intro_img = fr.result
                    //this.imageFile = files[0] // this is an image file that can be sent to server...
                    
				})
			} else {
				this.imageName = ''
				this.imageFile = ''
				this.imageUrl = ''
			}
        },
        
        imageStep: function(index){
            //console.log("s"+ index);
            return ("s" + index)
        },



        ////////////////////////
        incrementStep: function () {
            var temp = {
                step_text: "",
                step_img: "",
                step_ref: "",
            }

            this.steps_container.push(temp);
        },
        decreaseStep: function () {
            var temp = this.steps_container.length;
            console.log(temp);
            if (this.steps_container.length > 1 ) {
                this.steps_container.splice(temp-1 ,1);
                console.log(this.steps_container.length);
                this.dialog = false;
            }
        },


        /////////////////mongoose fetches

        //check to see if some one is logged in (passive function)
        isUserLogin: function(){
            fetch(`${url}/user/get/login`, {
				credentials: "include",
			}).then(function(response) {
				response.json().then(function(data) {
                    if(response.status == 200){
                        app.users_id = data.user_id
                        app.isLoggedin = true
                        app.Get_whole_user();
                    }
                    // app.users_id = data.user_id
                    // app.isLoggedin = true
                    // app.Get_whole_user();
                    //console.log("/user/get/login: ", users_id)
				});
			});
        },

        //register new user
        registerUser: function() {
			fetch(`${url}/users/register`, {
				method: "POST",
				credentials: "include",
				headers: {
					"Content-type": "application/json"
				},
				body: JSON.stringify({
					email: this.register_email,
					password: this.register_password
				})
			}).then(function(response) {
				if (response.status == 422 || response.status == 400) {
					response.json().then(function(data) {
						alert(data.msg);
					})
				} else if (response.status == 201) {
                    console.log("It worked");
                    app.page = "main"
				}
			});
        },

        //login a user
        loginUser: function() {
            this.overlay = true;
			fetch(`${url}/users/login`, {
				method: "POST",
				credentials: "include",
				headers: {
					"Content-type": "application/json"
				},
				body: JSON.stringify({
					email: this.login_email,
					password: this.login_password
				})
			}).then(function(response) {
				if (response.status == 200 || response.status == 403) {
					response.json().then(function(data) {
                        alert(data.msg);
                        app.users_id = data.user_id
                        app.isLoggedin = true
                        app.Get_whole_user();
                        console.log("logged in")
                        app.page = "main";
                        app.overlay = false;
                        //console.log("login: ", users_id)
					})
				}
			});
        },

        //authentication stuff (passive function)
        checkAuthentication: function() {
			fetch(`${url}/`, {
				credentials: "include",
			}).then(function(response) {
				response.json().then(function(data) {
					alert(data.msg);
				});
			});
        },
        //the entire user as an object (passive function)
        Get_whole_user: function() {
            fetch(`${url}/users/${app.users_id}/tutorials`, {
                credentials: "include",
            }).then(function(response){
                response.json().then(function(data){
                    //stuff here
                    app.entire_user = data.user
                    //console.log("whole user:", app.entire_user)
                })
            })
        },

        //get single tutorial
        Get_tutorial: function(tut){
            fetch(`${url}/users/${app.users_id}/tutorials/${tut._id}`, {
                credentials: "include",
            }).then(function(response){
                response.json().then(function(data){
                    //do stuff here
                    //console.log("the tut", data.the_user_tut)
                    app.display_tut = data.the_user_tut
                })
            })
        },

        Post_tutorial:function(){
            var req_body = {
                title: this.new_title,
                intro_text: this.intro_text,
                intro_img: this.intro_img,
                steps: this.steps_container,
                outro_text: this.outro_text,
                outro_img: this.outro_img,
            }
            fetch(`${url}/users/${this.users_id}/create`, {
                method: "POST",
                credentials: "include",
                headers:{"Content-type": "application/json"},
                body: JSON.stringify(req_body)
            }).then(function(response){
                //do stuff here
                app.new_title = "";
                app.intro_text  = "";
                app.intro_img = "";
                app.steps_container = [
                    {
                        step_text: "",
                        step_img: "",
                        step_ref: "",
                    },
                ];
                app.outro_text = "";
                app.outro_img = "";
            })
        },

        Delete_tutorial: function(tut){
            fetch(`${url}/users/${app.users_id}/tutorials/${tut._id}`, {
                method: "DELETE",
                credentials: "include",
            }).then(function(response){
                if(response.status == 404 || response.status == 400){
                    console.log("user not found")
                } else {
                    // response.json().then(function(data){
                    //     //do stuff here
                    //     //console.log("the tut", data.the_user_tut)
                    //     console.log("succesfully deleted")
                    //     app.entire_user = data.user
                    // })
                    console.log("Tutorial Deleted")
                    app.display_tut = {};
                    app.steps_container = [
                        {
                            step_text: "",
                            step_img: "",
                            step_ref: "",
                        },
                    ];
                    app.editMode = false
                    app.Get_whole_user()
                    app.dispayTutFilled = false
                }
            })
        },

        Edit_tutorial: function(tut){
            var req_body = {
                title: this.display_tut.title,
                intro_text: this.display_tut.intro_text,
                intro_img: this.display_tut.intro_img,
                steps: this.steps_container,
                outro_text: this.display_tut.outro_text,
                outro_img: this.display_tut.outro_img,
            }
            fetch(`${url}/users/${this.users_id}/tutorials/${tut._id}`, {
                method: "PUT",
                credentials: "include",
                headers:{"Content-type": "application/json"},
                body: JSON.stringify(req_body)
            }).then(function(response){
                //do stuff here
                console.log("end of edit?")
                app.Get_whole_user()
                app.editMode = false
            })
        },
        LogOut: function (){
            fetch(`${url}/logout`).then(function(response){
                console.log("logged out")
                //switch to login
                app.isLoggedin = false;
            })
        },

        /////////////
        selectTut: function(tut) {
          // //end
          this.display_tut = tut;
          this.steps_container = this.display_tut.steps;
          this.tutNav = false;
          this.editMode = false;
          this.dispayTutFilled = true;
        },
    },
} )
