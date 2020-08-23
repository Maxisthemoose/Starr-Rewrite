import { BaseCommand } from "../../utils/BaseClasses/BaseCommand";
import StarrClient from "../../utils/BaseClasses/StarrClient";
import { Message, MessageEmbed, MessageReaction, User } from "discord.js";
import Guild from "../../database/models/Guild";

export default new class ViewWarns extends BaseCommand {
    constructor() {
        super({
            name: "viewinfractions",
            usage: "?viewinfractions <user>",
            aliases: ["infractions", "vinfractions", "vinfs"],
            category: "moderation",
            permissions: ["MANAGE_MESSAGES"],
            description: "Check warns of a given user",
            ownerOnly: false,
        });
    }

    async run(client: StarrClient, message: Message, args: Array<string>) {

        let foundGuild = await Guild.findOne({ id: message.guild.id });
        if (!foundGuild) foundGuild = new Guild({ id: message.guild.id });
        
        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

        if (!member) return message.channel.send("Please mention someone to view their infraction history.");

        const Infractions_Exist = foundGuild.infractions.find(infraction => infraction.user === member.id);

        if (!Infractions_Exist) return message.channel.send("That member has no infractions!");

        const infractions = foundGuild.infractions.filter(infraction => infraction.user === member.id);

        let page = 0;


        const embed = new MessageEmbed()
            .setAuthor(`${member.user.tag}'s infractions`, member.user.displayAvatarURL({ format: "png" }));
            embed.addField(`Case #${infractions[page].caseId} - Infraction Type: ${infractions[page].infractionType}`, `${infractions[page].description}`);
            embed.setFooter(`Page: 1/${infractions.length} - Issued `)
            .setTimestamp(infractions[page].date);
        const msg = await message.channel.send(embed);

        if (infractions.length > 1) {

            await msg.react("⏪");
            await msg.react("◀️");
            await msg.react("▶️");
            await msg.react("⏩");
        
            const filter = (reaction: MessageReaction, user: User) => (reaction.emoji.name === "⏪" || reaction.emoji.name === "◀️" || reaction.emoji.name === "▶️" || reaction.emoji.name === "⏩" ) && !user.bot && user.id === message.author.id;

            const collector = msg.createReactionCollector(filter, { 
                time: 1 * 1000 * 60 * 2, 
                dispose: true
            });

            collector.on("collect", (reaction) => {
                let newEmbed = undefined;
                switch (reaction.emoji.name) {
                    case "⏪":

                    page = 0;

                    newEmbed = new MessageEmbed()
                        .setAuthor(`${member.user.tag}'s infractions`, member.user.displayAvatarURL({ format: "png" }));
                        newEmbed.addField(`Case #${infractions[page].caseId} - Infraction Type: ${infractions[page].infractionType}`, `${infractions[page].description}`);
                        newEmbed.setFooter(`Page: ${page + 1}/${infractions.length} - Issued `)
                        .setTimestamp(infractions[page].date);
                    return msg.edit(newEmbed);

                    case "◀️":
                        if (page > 0) {
                            page--;

                            newEmbed = new MessageEmbed()
                                .setAuthor(`${member.user.tag}'s infractions`, member.user.displayAvatarURL({ format: "png" }));
                                newEmbed.addField(`Case #${infractions[page].caseId} - Infraction Type: ${infractions[page].infractionType}`, `${infractions[page].description}`);
                                newEmbed.setFooter(`Page: ${page + 1}/${infractions.length} - Issued `)
                                .setTimestamp(infractions[page].date);
                            return msg.edit(newEmbed);
                        }
                    break;
                    case "▶️":
                        if (page < infractions.length - 1) {
                            page++;

                            newEmbed = new MessageEmbed()
                                .setAuthor(`${member.user.tag}'s infractions`, member.user.displayAvatarURL({ format: "png" }));
                                newEmbed.addField(`Case #${infractions[page].caseId} - Infraction Type: ${infractions[page].infractionType}`, `${infractions[page].description}`);
                                newEmbed.setFooter(`Page: ${page + 1}/${infractions.length} - Issued `)
                                .setTimestamp(infractions[page].date);
                            return msg.edit(newEmbed);
                        }
                    break;
                    case "⏩":

                    page = infractions.length - 1;

                    newEmbed = new MessageEmbed()
                        .setAuthor(`${member.user.tag}'s infractions`, member.user.displayAvatarURL({ format: "png" }));
                        newEmbed.addField(`Case #${infractions[page].caseId} - Infraction Type: ${infractions[page].infractionType}`, `${infractions[page].description}`);
                        newEmbed.setFooter(`Page: ${page + 1}/${infractions.length} - Issued `)
                        .setTimestamp(infractions[page].date);
                    return msg.edit(newEmbed);

                }
            });

            collector.on("end", (_, __) => {

            });
        
        }

    }
}