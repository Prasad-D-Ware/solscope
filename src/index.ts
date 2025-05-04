import { Client, Events, GatewayIntentBits } from "discord.js";
import { registerCommands } from "./commands/commands";
import connectDB from "./db/connectDB";
import user from "./db/user";
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
				// console.log(interaction.user.id);
				const userId = interaction.user.id;
				const username = interaction.user.username;
				const dbUser: any = await user.findOne({
					userId,
					username,
				});

				// console.log(dbUser + " db user find");

				if (!dbUser) {
					const keypair = createWallet();
					const newUser = await user.create({
						userId,
						username,
						privateKey: keypair.secretKey,
						publicKey: keypair.publicKey.toString(),
					});

					// console.log(newUser + " new user created");
					await interaction
						.reply({
							content: `Welcome to SolScope \n\n A one stop discord wallet solution for solana \n\n Created Your publicKey :\n ${newUser.publicKey} \n \n interact with the wallet using below options :`,
							// @ts-ignore
							components: createMainMenuButtons(),
							flags: "Ephemeral",
						})
						.catch((error) => {
							console.error("Error replying to interaction:", error);
						});
				} else {
					await interaction
						.reply({
							content: `Welcome to SolScope \n\n A one stop discord wallet solution for solana \n\n Your publicKey :\n ${dbUser.publicKey} \n\n interact with the wallet using below options :`,
							// @ts-ignore
							components: createMainMenuButtons(),
							flags: "Ephemeral",
						})
						.catch((error) => {
							console.error("Error replying to interaction:", error);
						});
				}
				// console.log(dbUser);
			} else if (interaction.commandName === "send") {
				await interaction.deferReply({ flags: "Ephemeral" }).catch((error) => {
					console.error("Error deferring reply:", error);
					return;
				});

				const username = interaction.user.username;
				const userId = interaction.user.id;

				const fromUser = await user.findOne(
					{
						userId,
						username,
					},
					{
						privateKey: 1,
					}
				);

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

				const sendTo = await user.findOne(
					{
						userId: sendUserId,
						username: sendUsername,
					},
					{
						publicKey: 1,
					}
				);

				if (sendTo) {
					const success = await sendSOL(
						fromUser?.privateKey as string,
						sendTo?.publicKey as string,
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
				const fundUser = await user.findOne(
					{
						userId,
						username,
					},
					{
						publicKey: 1,
					}
				);
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
				const dropUser = await user.findOne(
					{
						userId,
						username,
					},
					{
						publicKey: 1,
					}
				);
				const success = await airDropUser(dropUser?.publicKey as string);
				const balance = await getUserBalance(dropUser?.publicKey as string);

				if (success && balance) {
					await interaction
						.editReply({
							content: `Successfully airdroped for the user at : \n \n ${dropUser?.publicKey} \n \n Current balance for the user is : ${balance} SOL`,
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
				const User = await user.findOne(
					{
						userId,
						username,
					},
					{
						publicKey: 1,
					}
				);

				const balance = await getUserBalance(User?.publicKey as string);

				if (balance !== null) {
					interaction.editReply({
						content: `Current balance for the user : \n \n ${User?.publicKey} \n \n ${balance} SOL`,
					});
				} else {
					interaction.editReply({
						content: "Failed to fetch balance",
					});
				}
			} else if (interaction.customId === "refresh") {
				const userId = interaction.user.id;
				const username = interaction.user.username;
				const refUser = await user.findOne(
					{
						userId,
						username,
					},
					{
						publicKey: 1,
					}
				);
				await interaction.reply({
					content: `Welcome to SolScope Bot \n\n A one stop discord wallet solution for solana \n\npublicKey : ${refUser?.publicKey} \n \n interact with the wallet using below options :`,
					// @ts-ignore
					components: createMainMenuButtons(),
					flags: "Ephemeral",
				});
			} else if (interaction.customId === "wallet") {
				const userId = interaction.user.id;
				const username = interaction.user.username;

				const User = await user.findOne(
					{
						userId,
						username,
					},
					{
						publicKey: 1,
					}
				);

				const balance = await getUserBalance(User?.publicKey as string);
				await interaction.reply({
					content: `This is your SolScope Wallet \n \n publicKey : ${User?.publicKey} \n \n Balance : ${balance} SOL \n\n Select options from below`,
					// @ts-ignore
					components: createWalletMenuButtons(User?.publicKey),
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
				console.log("confirm reset!");
				// reset logic here
				const username = interaction.user.username;
				const userId = interaction.user.id;

				const User = await user.deleteOne({
					userId,
					username,
				});

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
							// @ts-ignore
							components: createMainMenuButtons(),
							embeds: [],
						})
						.catch((error) => {
							console.error("Error updating message:", error);
						});
				}
			} else if (interaction.customId === "cancel_reset") {
				// console.log("cancel reset!")
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
				console.log("export confirmed!");
				const username = interaction.user.username;
				const userId = interaction.user.id;

				const User = await user.findOne({
					userId,
					username,
				});

				await interaction
					.update({
						content: `Your Exported Private Key : \n\n [${User?.privateKey}] \n\n Save this secret key for importing in new Wallet `,
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
				// await interaction.deferReply({flags : "Ephemeral"});

				const solPrice = await getSolPrice();

				if (!solPrice) {
					await interaction.reply({
						content: "Failed to fetch Current price for SOL",
					});
					return;
				}

				await interaction.reply({
					content: `The current price of SOL : \n\n 1 SOL = ${solPrice} USD`,
				});
			}
		} else if (interaction.isModalSubmit()) {
			// console.log("MOdal Submitting......");

			await interaction.deferReply({ flags: "Ephemeral" }).catch((error) => {
				console.error("Error deferring modal reply:", error);
				return;
			});

			const userId = interaction.user.id;
			const username = interaction.user.username;
			const sender = await user.findOne({
				userId,
				username,
			});

			const receiver = interaction.fields.getTextInputValue("reciever");
			const amount = interaction.fields.getTextInputValue("amount");

			// console.log(receiver, amount);

			const success = await sendSOL(
				sender?.privateKey as string,
				receiver,
				amount
			);

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
		// Only try to reply if the interaction is still valid
		// if (
		// 	interaction.isRepliable() &&
		// 	!interaction.replied &&
		// 	!interaction.deferred
		// ) {
		// 	try {
		// 		await interaction.reply({
		// 			content:
		// 				"An error occurred while processing your request. Please try again.",
		// 			ephemeral: true,
		// 		});
		// 	} catch (replyError) {
		// 		console.error("Error sending error message:", replyError);
		// 	}
		// }
	}
});

client.login(TOKEN);
