import crypto from "crypto";

class EncryptionService {
	private readonly algorithm = "aes-256-gcm";
	private readonly keyLength = 32; // 256 bits
	private readonly ivLength = 16; // 128 bits
	private readonly saltLength = 64;
	private readonly tagLength = 16;
	private readonly key: Buffer;

	constructor() {
		// Use environment variable for encryption key
		const encryptionKey = process.env.ENCRYPTION_KEY;
		if (!encryptionKey) {
			throw new Error("ENCRYPTION_KEY environment variable is required");
		}

		// Create a key using PBKDF2
		this.key = crypto.pbkdf2Sync(
			encryptionKey,
			"solscope-salt", // You might want to make this configurable
			100000, // Number of iterations
			this.keyLength,
			"sha256"
		);
	}

	encrypt(text: string): string {
		// Generate a random initialization vector
		const iv = crypto.randomBytes(this.ivLength);

		// Create cipher
		const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

		// Encrypt the text
		let encrypted = cipher.update(text, "utf8", "hex");
		encrypted += cipher.final("hex");

		// Get the auth tag
		const tag = cipher.getAuthTag();

		// Combine IV, encrypted text, and auth tag
		return Buffer.concat([iv, Buffer.from(encrypted, "hex"), tag]).toString(
			"base64"
		);
	}

	decrypt(encryptedData: string): string {
		// Convert from base64
		const buffer = Buffer.from(encryptedData, "base64");

		// Extract IV, encrypted text, and auth tag
		const iv = buffer.subarray(0, this.ivLength);
		const tag = buffer.subarray(buffer.length - this.tagLength);
		const encrypted = buffer.subarray(
			this.ivLength,
			buffer.length - this.tagLength
		);

		// Create decipher
		const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
		decipher.setAuthTag(tag);

		// Decrypt the text
		let decrypted = decipher.update(encrypted);
		decrypted = Buffer.concat([decrypted, decipher.final()]);

		return Array.from(decrypted).join(",");
	}
}

export const encryptionService = new EncryptionService();
