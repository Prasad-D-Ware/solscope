import mongoose from "mongoose";
import { encryptionService } from "../utils/encryption";

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
		get: function(value: string) {
			if (!value) return value;
			try {
				return encryptionService.decrypt(value);
			} catch (error) {
				console.error('Error decrypting private key:', error);
				return value;
			}
		},
		set: function(value: string) {
			if (!value) return value;
			try {
				return encryptionService.encrypt(value);
			} catch (error) {
				console.error('Error encrypting private key:', error);
				return value;
			}
		}
	},
	publicKey: {
		type: String,
	},
});

// Enable virtuals and getters
userSchema.set('toJSON', { getters: true });
userSchema.set('toObject', { getters: true });

const user = mongoose.model("User" , userSchema);

export default user;