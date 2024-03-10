// https://discord.com/developers/docs/reference#image-formatting-cdn-endpoints

export class ImageCategoryEnum {

    static AVATAR = new ImageCategoryEnum('avatars');
    static BANNER = new ImageCategoryEnum('banner');
  
    constructor(name) {
      this.name = name;
    }
  
  }