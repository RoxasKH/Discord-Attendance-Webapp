// https://discord.com/developers/docs/topics/permissions#role-object

export class Role {

    constructor(
        id,
        name,
        color,
        position,
        permissions,
        icon = null,
        unicode_emoji = null,
    ) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.position = position;
        this.permissions = permissions;
        this.icon = icon;
        this.unicode_emoji = unicode_emoji;
    }

}