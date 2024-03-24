import { setConfig } from './utils/Config.js';

// Mirrored variables passed through jinja: currentPage, config, data
const jinja = {
  currentPage: currentPage,
  config: config,
  data: (typeof data !== 'undefined') ? data : undefined
};

setConfig(jinja.config);

let pageComponent = null;
let controller = null;

const pageComponentName = `${jinja.currentPage.toLowerCase()}-page`;
const root = document.getElementById('root');

// Dynamically import the corresponding view and controller based on the current page
import(`./view/pages/${jinja.currentPage}.js`) // Import the view template
  .then(viewModule => {
    // Create an instance of the view component
    pageComponent = document.createElement(pageComponentName);

    document.title = `${jinja.currentPage} - Big Table App`;

    // Now dynamically import the corresponding controller
    /*
    import(`./controller/pages/${jinja.currentPage}Controller.js`)
      .then(controllerModule => {
        const ControllerClass = controllerModule[`${jinja.currentPage}Controller`];

        if (ControllerClass) {

          // Wait for the page component to initialize
          pageComponent.addEventListener('component-initialized', () => {

            // Initialize the controller and pass any required dependencies
            controller = new ControllerClass(pageComponent, jinja.data);
            console.log(pageComponent);

            // Run any initialization logic for the controller
            controller.init();

          });
          
        }
      })
    .catch(error => {
      console.error(`Error loading controller for ${jinja.currentPage}:`, error);
    });*/

    // Add the component instance to the root node of the DOM
    root.append(pageComponent);

  })
  .catch(error => {
    console.error(`Error loading view for ${jinja.currentPage}:`, error);
  });