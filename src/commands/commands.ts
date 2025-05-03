import { REST, Routes } from 'discord.js';

const commands = [
    {
        name : 'start',
        description : "Creates a wallet or shows the exisiting wallet"
    }
  ];
  
  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN!);
  
  export const registerCommands = async() =>{
    try {
      console.log('Started refreshing application (/) commands.');
    
      await rest.put(Routes.applicationCommands(process.env.CLIENT_ID!), { body: commands });
        // console.log(commands);
      console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
      console.error(error);
    }
  }
  