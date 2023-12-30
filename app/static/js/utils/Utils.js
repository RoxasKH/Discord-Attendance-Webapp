export const rgba2hex = (rgba) => `#${rgba.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+\.{0,1}\d*))?\)$/).slice(1).map((n, i) => (i === 3 ? Math.round(parseFloat(n) * 255) : parseFloat(n)).toString(16).padStart(2, '0').replace('NaN', '')).join('')}`

// Vanilla debounce function: triggers the function once after a certain amount of times, even if called multiple times
// Limits the rate at which a function can fire
export function debounce(func, wait, immediate) {
  let timeout;
  return function() {
    let context = this, args = arguments;
    let later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    let callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};

export function arraysEqual(array1, array2) {
  return JSON.stringify(array1) == JSON.stringify(array2);
}

export function index(list, element) {
  let i = list.length;
        
  while(i--) {
    if( list[i] == element ) {
      return i;
    }
  }
}

// https://gist.github.com/Spencer-Doak/9954daae8a859337a08f0022293313a6
export function findRoots(ele) {
    return [
        ele,
        ...ele.querySelectorAll('*')
    ].filter(e => !!e.shadowRoot)
        .flatMap(e => [e.shadowRoot, ...findRoots(e.shadowRoot)])
}

Object.defineProperty(String.prototype, 'capitalize', {
  value: function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
  },
  enumerable: false
});

export { };