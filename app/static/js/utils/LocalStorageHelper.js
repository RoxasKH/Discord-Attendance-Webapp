export class LocalStorageHelper {

    SEPARATOR = '|';

    // SET

    #setItem(key, value) { localStorage.setItem(key, value); }

    setString(key, string) {
        if (typeof string !== 'string') {
            throw TypeError('The value passed is not a string');
        }
        this.#setItem(key, string);
    }

    setArray(key, array) {
        if (!Array.isArray(array)) {
            throw TypeError('The value passed is not an array');
        }
        this.#setItem(key, array.join(this.SEPARATOR));
    }

    setObject(key, object) {
        // Arrays are considered a special type of object in JS
        // typeof null also returns 'object'
        if (object && (typeof object !== 'object' || Array.isArray(object))) {
            throw TypeError('The value passed is not an object');
        }
        this.#setItem(key, JSON.stringify(object));
    }
    
    setBoolean(key, bool) {
        if (typeof bool !== 'boolean') {
            throw TypeError('The value passed is not a boolean');
        }
        this.#setItem(key, bool);
    }

    setNumber(key, number) {
        if (typeof number !== 'number') {
            throw TypeError('The value passed is not a number');
        }
        this.#setItem(key, number);
    }

    // GET

    #getItem(key) { localStorage.getItem(key); }

    getString(key) { return this.#getItem(key); }

    getArray(key) { return this.#getItem(key).split(this.SEPARATOR); }

    getObject(key) { return JSON.parse(this.#getItem(key)); }

    getBoolean(key, bool) { return this.#getItem(key, bool) === 'true'; }

    setNumber(key, number) { return Number(this.#getItem(key, number)); }

    // REMOVE

    removeItem(key) { localStorage.removeItem(key); }

    clear() { localStorage.clear(); }

    // MISC

    exists(key) { return localStorage.getItem(key) !== null; }

}
