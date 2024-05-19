export const rgba2hex = (rgba) => `#${
  rgba
    .match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+\.{0,1}\d*))?\)$/)
    .slice(1).map((n, i) => 
      (i === 3 
        ? Math.round(parseFloat(n) * 255) 
        : parseFloat(n)
      ).toString(16)
        .padStart(2, '0')
        .replace('NaN', '')
      ).join('')
  }`

// https://gist.github.com/Spencer-Doak/9954daae8a859337a08f0022293313a6
export function findRoots(element) {
  return [
      element,
      ...element.querySelectorAll('*')
  ].filter(e => !!e.shadowRoot)
      .flatMap(e => [e.shadowRoot, ...findRoots(e.shadowRoot)])
}

export function deepEqual(x, y) {

  if (Array.isArray(x) && Array.isArray(y)) {
    
    if (x.length !== y.length) return false;
    
    for (let index = 0; index < x.length; index++) {
      if (!deepEqual(x[index], y[index])) return false;
    }
    return true;
  }

  if ((typeof x === 'object' && x !== null) && (typeof y === 'object' && y !== null)) {

    const keysX = Object.keys(x);
    const keysY = Object.keys(y);

    if (keysX.length !== keysY.length) return false;

    for (const prop of keysX) {
      if (y.hasOwnProperty(prop)) {
        if (!deepEqual(x[prop], y[prop])) return false;
      } else return false
    }

    return true;
  }

  return x === y;

}

export function deepCopy(object) {
  if (typeof object !== 'object' || object === null) {
    return object; // Return primitives and null directly
  }

  // Preserve prototype chain
  const copy = Array.isArray(object) ? [] : Object.create(Object.getPrototypeOf(object)); 

  for (const key in object) {
    if (object.hasOwnProperty(key)) {
      if (typeof object[key] === 'object' && object[key] !== null) {
        if (object[key].constructor && isEnum(object[key].constructor)) {
          // Copy enums by reference
          copy[key] = object[key];
        } else if (Array.isArray(object[key])) {
          copy[key] = object[key].map(item => deepCopy(item)); // Deep copy array elements
        } else {
          copy[key] = deepCopy(object[key]); // Recursively copy nested objects
        }
      } else {
        copy[key] = object[key]; // Copy primitive values
      }
    }
  }

  return copy;
}

function isEnum(constructor) {
  // You may need to adjust this condition based on how enums are defined in your codebase
  return constructor && 
    constructor.prototype && 
    constructor.prototype.constructor && 
    constructor.prototype.constructor.name.endsWith('Enum');
}

Object.defineProperty(String.prototype, 'capitalize', {
  value: function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
  },
  enumerable: false
});

// Triggers code execution, so that the custom methods to built-in prototypes are loaded up
export {};