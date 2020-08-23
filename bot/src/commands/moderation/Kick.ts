import { BaseCommand } from "../../utils/BaseClasses/BaseCommand";
import StarrClient from "../../utils/BaseClasses/StarrClient";
import { Message } from "discord.js";
import Guild from "../../database/models/Guild";

export default new class Kick extends BaseCommand {
    constructor() {
        super({
            name: "kick",
            category: "moderation",
            description: "Kick a user from the server",
            permissions: ["MANAGE_GUILD"],
            usage: "?kick <user> <reason>",
        });
    }
    async run (client: StarrClient, message: Message, args: string[]) {
        const kickMember = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!kickMember) return message.channel.send("Please mention a member to kick");

        let foundGuild = await Guild.findOne({ id: message.guild.id });
        if (!foundGuild) foundGuild = new Guild({ id: message.guild.id });

        let reason = args.slice(1).join(" ");
        if (!reason) reason = ``

    }
}