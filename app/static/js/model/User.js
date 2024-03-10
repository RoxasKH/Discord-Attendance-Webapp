// https://discord.com/developers/docs/reference#image-formatting

import { ImageCategoryEnum } from "../utils/enums/ImageCategoryEnum.js";

export class User {

    #BASE_URL = 'https://cdn.discordapp.com';

    constructor(
        {
            id,
            username,
            discriminator,
            display_name,
            avatar,
            joined_at,
            roles,
            is_bot = null,
            banner = null,
            locale = null,
            accent_color = null,
            verified = null,
            flags = null,
            premium_type = null,
            server_nickname = null,
            server_avatar = null,
        }
    ) {
        this.id = id;
        this.username = username;
        this.discriminator = discriminator;
        this.display_name = display_name;
        this.avatar = avatar && this.#generateImageUrl(ImageCategoryEnum.AVATAR, avatar);
        this.joined_at = joined_at && new Date(joined_at).toLocaleString();
        this.roles = roles;
        this.is_bot = is_bot;
        this.banner = banner && this. #generateImageUrl(ImageCategoryEnum.BANNER, banner);
        this.locale = locale;
        this.accent_color = accent_color;
        this.verified = verified;
        this.flags = flags;
        this.premium_type = premium_type;
        this.server_nickname = server_nickname;
        this.server_avatar = server_avatar && this.#generateImageUrl(ImageCategoryEnum.AVATAR, server_avatar);
    }

    #generateImageUrl(category, avatarId) {
        return `${this.#BASE_URL}/${category.name}/${this.id}/${avatarId}.webp`;
    }
  
}