import { setConfig } from './utils/Config.js';

// Mirrored variables passed through jinja: currentPage, config, data
const jinja = {
  currentPage: currentPage,
  config: config,
  data: (typeof data !== 'undefined') ? data : undefined
};

setConfig(jinja.config);

let pageComponent = null;

const pageComponentName = `${jinja.currentPage.toLowerCase()}-page`;
const root = document.getElementById('root');

// Dynamically import the corresponding view and controller based on the current page
import(`./view/pages/${jinja.currentPage}.js`) // Import the view template
  .then(viewModule => {
    // Create an instance of the view component
    pageComponent = document.createElement(pageComponentName);
    // Set data obtained from jinja as a property
    pageComponent.data = jinja.data;

    document.title = `${jinja.currentPage} - Big Table App`;

    // Add the component instance to the root node of the DOM
    root.append(pageComponent);

  })
  .catch(error => {
    console.error(`Error loading ${jinja.currentPage} component:`, error);
    throw error;
  });
