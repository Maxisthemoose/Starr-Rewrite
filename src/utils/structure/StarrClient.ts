import { Client, Snowflake, Guild, Channel, ClientOptions, Constants, Collection } from "discord.js"
import StarrClientInfo from "../interfaces/StarrClientInfo";
import GuildDoc from "../../database/models/Guild";
import SnipeData from "../interfaces/SnipeData";
import CommandHandler from "../../handlers/CommandHandler"; // Import the command handler
import EventHandler from "../../handlers/EventHandler"; // Import the event handler
import { Categories } from "../resolvables/Resolvables"; // Import the categories for the command handler
import { config } from "dotenv"; // Import config for environment variables
import { DiscordUNO } from "discord-uno";
import BaseCommand from "./BaseCommand";

export default class StarrClient extends Client {
    defaultPrefix: string;
    commands: Collection<string, BaseCommand>;
    aliases: Collection<string, string>;
    owners: Array<Snowflake>;
    snipes: Map<string, SnipeData>;
    baseOptions: ClientOptions;
    cachedPrefixes: Map<string, string>;
    DiscordUNO: DiscordUNO;
    develop: boolean;
    colors: {
        noColor: "#2F3136",
    }

    constructor(public StarrClientInfo: StarrClientInfo) {
        super();
        this.defaultPrefix = StarrClientInfo.defaultPrefix;
        this.commands = new Collection();
        this.aliases = new Collection();
        this.owners = StarrClientInfo.owners;
        this.snipes = new Map();
        this.baseOptions = StarrClientInfo.baseOptions;
        this.cachedPrefixes = new Map();
        this.DiscordUNO = new DiscordUNO();
        this.develop = StarrClientInfo.develop;
        this.colors = {
            noColor: "#2F3136",
        }
    };

    private getToken(): string | undefined {
        return this.develop ? process.env.TEST_TOKEN : process.env.BOT_TOKEN;
    }

    public async getDBGuildPrefix(guild: Guild): Promise<string> {
        const foundGuild = await GuildDoc.findOne({ id: guild.id });
        if (!foundGuild) return null;
        const guildPrefix = foundGuild.prefix;
        return guildPrefix;
    }
    public getSnipe(client: StarrClient, guild: Guild, channel: Channel): SnipeData {
        const toget = JSON.stringify({ guild: guild.id, channel: channel.id });
        const snipedata = client.snipes.get(toget);
        return snipedata;
    }
    public start(): void {
        config(); // Execute the config to bind env to the process
        Constants.DefaultOptions.ws.properties.$browser = "Discord iOS";
        this.login(this.getToken());
        import("../../database/database"); // Startup the database connection
        CommandHandler.load("./src/commands", Categories, this); // Execute both to initialize the commands and events
        EventHandler.load("./src/events", this);
    }
}