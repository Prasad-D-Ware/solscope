import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js";

export function createMainMenuButtons() {
	// Top row: Buy and Fund
	const topRow = new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId("airdrop")
			.setLabel("Airdrop")
			.setStyle(ButtonStyle.Secondary),
		new ButtonBuilder()
			.setCustomId("fund")
			.setLabel("Fund")
			.setStyle(ButtonStyle.Secondary)
	);

	const secondRow = new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId("wallet")
			.setLabel("Wallet")
			.setStyle(ButtonStyle.Secondary),
		// new ButtonBuilder()
		// 	.setCustomId("settings")
		// 	.setLabel("Settings")
		// 	.setStyle(ButtonStyle.Secondary),
		new ButtonBuilder()
			.setCustomId("refresh")
			.setLabel("Refresh")
			.setStyle(ButtonStyle.Secondary)
	);

	return [topRow, secondRow];
}

export function createWalletMenuButtons(publicKey: string) {
	const topRow = new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setURL(`https://explorer.solana.com/address/${publicKey}?cluster=devnet`)
			.setLabel("View on Explorer")
			.setStyle(ButtonStyle.Link),

		new ButtonBuilder()
			.setCustomId("send")
			.setLabel("Send SOL")
			.setStyle(ButtonStyle.Secondary),
		new ButtonBuilder()
			.setCustomId("balance")
			.setLabel("Get Balance")
			.setStyle(ButtonStyle.Secondary)
	);

	const secondRow = new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId("reset")
			.setLabel("Reset Wallet")
			.setStyle(ButtonStyle.Secondary),
		new ButtonBuilder()
			.setCustomId("export")
			.setLabel("Export Wallet")
			.setStyle(ButtonStyle.Secondary),
		new ButtonBuilder()
			.setCustomId("current_price")
			.setLabel("Current Price : SOL")
			.setStyle(ButtonStyle.Secondary)
	);

	return [topRow, secondRow];
}

export function sendModal() {
	const modal = new ModalBuilder()
		.setCustomId("sendModal")
		.setTitle("Send SOL")
		.addComponents(
			new ActionRowBuilder<TextInputBuilder>().addComponents(
				new TextInputBuilder()
					.setCustomId("reciever")
					.setLabel("Receiver's Address")
					.setStyle(TextInputStyle.Short)
					.setRequired(true)
			),
			new ActionRowBuilder<TextInputBuilder>().addComponents(
				new TextInputBuilder()
					.setCustomId("amount")
					.setLabel("Amount (SOL)")
					.setStyle(TextInputStyle.Short)
					.setRequired(true)
			)
		);

	return modal;
}

export function resetEmbed() {
	const embed = new EmbedBuilder()
		.setTitle("Are You sure? Reset Wallet?")
		.setDescription(
			"Confirming this would reset the current account and never access the account."
		);

	const row = new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId("confirm_reset")
			.setLabel("Confirm Reset")
			.setStyle(ButtonStyle.Danger),
		new ButtonBuilder()
			.setCustomId("cancel_reset")
			.setLabel("Cancel")
			.setStyle(ButtonStyle.Secondary)
	);

	return { embed, row };
}

export function exportEmbed() {
	const embed = new EmbedBuilder()
		.setTitle("Are You sure? Export the Wallet?")
		.setDescription(
			"Confirming this would export the current account's private key and delete from the SolScope Database \n  You can only export once"
		);

	const row = new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId("confirm_export")
			.setLabel("Confirm Export")
			.setStyle(ButtonStyle.Danger),
		new ButtonBuilder()
			.setCustomId("cancel_export")
			.setLabel("Cancel")
			.setStyle(ButtonStyle.Secondary)
	);

	return { embed, row };
}
