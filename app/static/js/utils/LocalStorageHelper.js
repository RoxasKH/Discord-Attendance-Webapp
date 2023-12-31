/**
 * @author Script47
 * @version 12/07/2017 (1.0)
 * @github https://github.com/Script47/.js/blob/master/src/local_storage.js
 * @example https://github.com/Script47/.js/blob/master/examples/local_storage.html
 */

export function LocalStorageHelper() {
    this.set = {
        single: function (key, value, callback) {
            localStorage.setItem(key, value);

            return (typeof callback === 'function') ? callback() : true;
        },

        multiple: function (o, callback) {
            for (let key in o)
                if (o.hasOwnProperty(key))
                    localStorage.setItem(key, o[key]);

            return (typeof callback === 'function') ? callback() : true;
        },

        json: function (key, value, callback) {
            localStorage.setItem(key, JSON.stringify(value));

            return (typeof callback === 'function') ? callback() : true;
        }
    };

    this.get = {
        single: function (key, callback) {
            return (typeof callback === 'function') ? callback() : localStorage.getItem(key);
        },

        json: function (key, callback) {
            return (typeof callback === 'function') ? callback() : JSON.parse(localStorage.getItem(key));
        }
    };

    this.clear = {
        single: function (key, callback) {
            localStorage.removeItem(key);

            return (typeof callback === 'function') ? callback() : true;
        },

        multiple: function (a, callback) {
            for (let i = 0; i < a.length; i++)
                localStorage.removeItem(a[i]);

            return (typeof callback === 'function') ? callback() : true;
        },

        all: function (callback) {
            localStorage.clear();

            return (typeof callback === 'function') ? callback() : true;
        }
    };

    this.exists = function (key) {
        return (localStorage.getItem(key) !== null) ? true : false;
    };
}
