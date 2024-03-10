// https://discord.com/developers/docs/resources/guild#guild-member-object-guild-member-structure
// https://discord.com/developers/docs/resources/user#user-object

import { Role } from '../model/Role.js';
import { User } from '../model/User.js';
import { config } from '../utils/Config.js';

export class DiscordRepository {

    #API_VERSION = config.DISCORD_API_VERSION;
    #BASE_URL = 'https://discord.com/api';
    #VERSION_URL = this.#API_VERSION ? `${this.#BASE_URL}/v${this.#API_VERSION}` : this.#BASE_URL;
    #SERVER_URL = this.#VERSION_URL + '/guilds';

    #SERVER_ID = config.SERVER_ID;

    #AUTHORIZATION_HEADER = {
        headers: {
            Authorization: config.OAUTH2_TOKEN 
        }
    };

    async #authorizedFetch(url) {
        return await fetch(url, this.#AUTHORIZATION_HEADER);
    }

    async getGuildMember(userId) {
        const response = await this.#authorizedFetch(this.#SERVER_URL + this.#SERVER_ID + '/members/' + userId);
        if (!response.ok) {
            throw new Error('Failed to fetch user info');
        }
        const guildMember = response.json();
        const user = guildMember.user;
        return new User(
            {
                id: user.id,
                username: user.username,
                discriminator: user.discriminator,
                display_name: user.global_name,
                avatar: user.avatar,
                joined_at: guildMember.joined_at,
                roles: guildMember.roles,
                is_bot: user.bot,
                banner: user.banner,
                locale: user.locale,
                accent_color: user.accent_color,
                verified: user.verified,
                flags: user.flags,
                premium_type: user.premium_type,
                server_nickname: guildMember.nick,
                server_avatar: guildMember.avatar,
            }
        );
    }

    async getGuildRoles() {
        const response = await this.#authorizedFetch(this.#SERVER_URL + this.#SERVER_ID);
        if (!response.ok) {
            throw new Error('Failed to fetch roles info');
        }
        const roles = response.json();
        return roles.map((role) => {
            return new Role(
                role.id,
                role.name,
                role.color,
                role.position,
                role.permissions,
                role.icon,
                role.unicode_emoji,
            );
        });
    }

}