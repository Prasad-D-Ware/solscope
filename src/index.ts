import { Client, Events, GatewayIntentBits } from "discord.js";
import { registerCommands } from "./commands/commands";
import connectDB from "./db/connectDB";
import user from "./db/user";
import { userCache } from "./db/userCache";
import {
	airDropUser,
	createWallet,
	getSolPrice,
	getUserBalance,
	sendSOL,
} from "./solana/functions";
import {
	createMainMenuButtons,
	createWalletMenuButtons,
	exportEmbed,
	resetEmbed,
	sendModal,
} from "./utils";

const TOKEN = process.env.TOKEN || "";

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
});

registerCommands();

await connectDB();

client.on(Events.ClientReady, (readyClient) => {
	console.log(`Logged in as ${readyClient.user.tag}!`);
});

// client.on(Events.MessageCreate, async (message) => {
// 	if (message.author.bot) return;

// 	// console.log(message);
// 	// console.log(message.author);
// 	message.reply({
// 		content: "Hi " + message.author.username,
// 	});
// });

client.on(Events.InteractionCreate, async (interaction) => {
	try {
		if (interaction.isChatInputCommand()) {
			if (interaction.commandName === "start") {
				const userId = interaction.user.id;
				const username = interaction.user.username;
				const dbUser = await userCache.getUser(userId, username);

				if (!dbUser) {
					const keypair = createWallet();
					const newUser = await user.create({
						userId,
						username,
						privateKey: keypair.secretKey,
						publicKey: keypair.publicKey.toString(),
					});

					await interaction
						.reply({
							content: `Welcome to SolScope \n\n A one stop discord wallet solution for solana \n\n Created Your publicKey :\n ${newUser.publicKey} \n \n interact with the wallet using below options :`,
							components: createMainMenuButtons().map((row) => row.toJSON()),
							flags: "Ephemeral",
						})
						.catch((error) => {
							console.error("Error replying to interaction:", error);
						});
				} else {
					await interaction
						.reply({
							content: `Welcome to SolScope \n\n A one stop discord wallet solution for solana \n\n Your publicKey :\n ${dbUser.publicKey} \n\n interact with the wallet using below options :`,
							components: createMainMenuButtons().map((row) => row.toJSON()),
							flags: "Ephemeral",
						})
						.catch((error) => {
							console.error("Error replying to interaction:", error);
						});
				}
			} else if (interaction.commandName === "send") {
				await interaction.deferReply({ flags: "Ephemeral" }).catch((error) => {
					console.error("Error deferring reply:", error);
					return;
				});

				const username = interaction.user.username;
				const userId = interaction.user.id;

				const fromUser = await userCache.getUser(userId, username);

				if (!fromUser) {
					await interaction.editReply({
						content:
							"You dont have SolScope Wallet. please use /start command first before /send",
					});
					return;
				}

				const sendUsername = interaction.options.getUser("user")?.username;
				const sendUserId = interaction.options.getUser("user")?.id;
				const amount = interaction.options.getString("amount");

				if (!sendUsername || !sendUserId) {
					await interaction.editReply({
						content: "Invalid user selected",
					});
					return;
				}

				const sendTo = await userCache.getUser(sendUserId, sendUsername);

				if (sendTo) {
					const success = await sendSOL(
						fromUser.privateKey,
						sendTo.publicKey,
						amount as string
					);

					if (success) {
						await interaction
							.editReply({ content: "Successfully Send SOL!" })
							.catch((error) => {
								console.error("Error editing reply:", error);
							});
					} else {
						await interaction
							.editReply({ content: "Faced issue doing transaction" })
							.catch((error) => {
								console.error("Error editing reply:", error);
							});
					}
				} else {
					await interaction.editReply({
						content: "Selected User doesn't have SolScope Wallet.",
					});
				}
			}
		} else if (interaction.isButton()) {
			if (interaction.customId === "fund") {
				const userId = interaction.user.id;
				const username = interaction.user.username;
				const fundUser = await userCache.getUser(userId, username);

				await interaction
					.reply({
						content: `Add funds to this address : \n \n ${fundUser?.publicKey} \n`,
						flags: "Ephemeral",
					})
					.catch((error) => {
						console.error("Error replying to fund interaction:", error);
					});
			} else if (interaction.customId === "airdrop") {
				const userId = interaction.user.id;
				const username = interaction.user.username;

				await interaction.deferReply({ flags: "Ephemeral" }).catch((error) => {
					console.error("Error deferring reply:", error);
					return;
				});

				const dropUser = await userCache.getUser(userId, username);
				if (!dropUser) {
					await interaction.editReply({
						content: "User not found. Please use /start first.",
					});
					return;
				}

				const success = await airDropUser(dropUser.publicKey);
				const balance = await getUserBalance(dropUser.publicKey);

				if (success && balance) {
					await interaction
						.editReply({
							content: `Successfully airdroped for the user at : \n \n ${dropUser.publicKey} \n \n Current balance for the user is : ${balance} SOL`,
						})
						.catch((error) => {
							console.error("Error editing reply:", error);
						});
				} else {
					await interaction
						.editReply({
							content: "Failed to airdrop user",
						})
						.catch((error) => {
							console.error("Error editing reply:", error);
						});
				}
			} else if (interaction.customId === "balance") {
				const userId = interaction.user.id;
				const username = interaction.user.username;
				await interaction.deferReply({ flags: "Ephemeral" });

				const User = await userCache.getUser(userId, username);
				if (!User) {
					await interaction.editReply({
						content: "User not found. Please use /start first.",
					});
					return;
				}

				const balance = await getUserBalance(User.publicKey);

				if (balance !== null) {
					interaction.editReply({
						content: `Current balance for the user : \n \n ${User.publicKey} \n \n ${balance} SOL`,
					});
				} else {
					interaction.editReply({
						content: "Failed to fetch balance",
					});
				}
			} else if (interaction.customId === "refresh") {
				const userId = interaction.user.id;
				const username = interaction.user.username;
				const refUser = await userCache.getUser(userId, username);

				if (!refUser) {
					await interaction.reply({
						content: "User not found. Please use /start first.",
						flags: "Ephemeral",
					});
					return;
				}

				await interaction.reply({
					content: `Welcome to SolScope Bot \n\n A one stop discord wallet solution for solana \n\npublicKey : ${refUser.publicKey} \n \n interact with the wallet using below options :`,
					components: createMainMenuButtons().map((row) => row.toJSON()),
					flags: "Ephemeral",
				});
			} else if (interaction.customId === "wallet") {
				const userId = interaction.user.id;
				const username = interaction.user.username;

				const User = await userCache.getUser(userId, username);
				if (!User) {
					await interaction.reply({
						content: "User not found. Please use /start first.",
						flags: "Ephemeral",
					});
					return;
				}

				const balance = await getUserBalance(User.publicKey);
				await interaction.reply({
					content: `This is your SolScope Wallet \n \n publicKey : ${User.publicKey} \n \n Balance : ${balance} SOL \n\n Select options from below`,
					components: createWalletMenuButtons(User.publicKey).map((row) =>
						row.toJSON()
					),
					flags: "Ephemeral",
				});
			} else if (interaction.customId === "send") {
				await interaction.showModal(sendModal());
			} else if (interaction.customId === "reset") {
				const { embed, row } = resetEmbed();
				await interaction.reply({
					embeds: [embed],
					components: [row.toJSON()],
					flags: "Ephemeral",
				});
			} else if (interaction.customId === "confirm_reset") {
				const username = interaction.user.username;
				const userId = interaction.user.id;

				const User = await user.deleteOne({
					userId,
					username,
				});

				userCache.invalidateUser(userId, username);

				if (User.acknowledged) {
					const keypair = createWallet();
					const newUser = await user.create({
						userId,
						username,
						privateKey: keypair.secretKey,
						publicKey: keypair.publicKey.toString(),
					});

					if (!newUser) {
						await interaction.update({
							content: "Error happening while reseting try /start again",
						});
						return;
					}

					await interaction
						.update({
							content: `Welcome to SolScope \n\n A one stop discord wallet solution for solana \n\n Reseted Your Account \n\n publicKey : ${newUser.publicKey} \n \n interact with the wallet using below options :`,
							components: createMainMenuButtons().map((row) => row.toJSON()),
							embeds: [],
						})
						.catch((error) => {
							console.error("Error updating message:", error);
						});
				}
			} else if (interaction.customId === "cancel_reset") {
				await interaction
					.update({
						content: "Cancelled Wallet Reset",
						components: [],
						embeds: [],
					})
					.catch((error) => {
						console.error("Error updating message:", error);
					});
			} else if (interaction.customId === "export") {
				const { embed, row } = exportEmbed();
				await interaction.reply({
					embeds: [embed],
					components: [row.toJSON()],
					flags: "Ephemeral",
				});
			} else if (interaction.customId === "confirm_export") {
				const username = interaction.user.username;
				const userId = interaction.user.id;

				const User = await userCache.getUser(userId, username);
				if (!User) {
					await interaction.update({
						content: "User not found. Please use /start first.",
					});
					return;
				}

				await interaction
					.update({
						content: `Your Exported Private Key : \n\n [${User.privateKey}] \n\n Save this secret key for importing in new Wallet `,
						embeds: [],
						components: [],
					})
					.catch((error) => {
						console.error("Error updating message:", error);
					});

				await user.deleteOne({
					userId,
					username,
				});
				userCache.invalidateUser(userId, username);
			} else if (interaction.customId === "cancel_export") {
				await interaction
					.update({
						content: "Cancelled Wallet Export",
						components: [],
						embeds: [],
					})
					.catch((error) => {
						console.error("Error updating message:", error);
					});
			} else if (interaction.customId === "current_price") {
				const solPrice = await getSolPrice();

				if (!solPrice) {
					await interaction.reply({
						content: "Failed to fetch Current price for SOL",
						flags: "Ephemeral",
					});
					return;
				}

				await interaction.reply({
					content: `The current price of SOL : \n\n 1 SOL = ${solPrice} USD`,
					flags: "Ephemeral",
				});
			}
		} else if (interaction.isModalSubmit()) {
			await interaction.deferReply({ flags: "Ephemeral" }).catch((error) => {
				console.error("Error deferring modal reply:", error);
				return;
			});

			const userId = interaction.user.id;
			const username = interaction.user.username;
			const sender = await userCache.getUser(userId, username);

			if (!sender) {
				await interaction.editReply({
					content: "User not found. Please use /start first.",
				});
				return;
			}

			const receiver = interaction.fields.getTextInputValue("reciever");
			const amount = interaction.fields.getTextInputValue("amount");

			const success = await sendSOL(sender.privateKey, receiver, amount);

			if (success) {
				await interaction
					.editReply({ content: "Successfully Send SOL!" })
					.catch((error) => {
						console.error("Error editing modal reply:", error);
					});
			} else {
				await interaction
					.editReply({ content: "Faced issue doing transaction" })
					.catch((error) => {
						console.error("Error editing modal reply:", error);
					});
			}
		}
	} catch (error: any) {
		console.error("Error handling interaction:", error);
	}
});

client.login(TOKEN);
