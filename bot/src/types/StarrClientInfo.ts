import { Snowflake, ClientOptions } from "discord.js";

export default interface StarrClientInfo {
    defaultPrefix: string;
    owners: Array<Snowflake>;
    baseOptions?: ClientOptions;
}