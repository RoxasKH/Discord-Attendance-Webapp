export class User {
  
    constructor(
        {
            joined_at, 
            nick,
            discriminator,
            id,
            username,
            avatar,
            roles,
        }
    ) {
        this.joined_at = joined_at;
        this.nick = nick;
        this.discriminator = discriminator;
        this.id = id;
        this.username = username;
        this.avatar = avatar;
        this.roles = roles;
    }
  
}