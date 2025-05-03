import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
	userId : {
		type : String,
		require : true,
		unique : true
	},
	username: {
		type: String,
		required: true,
		unique : true,
	},
	privateKey: {
		type: String,
	},
	publicKey: {
		type: String,
	},
});


const user = mongoose.model("User" , userSchema);

export default user;