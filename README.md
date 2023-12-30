# Discord Attendance Webapp
> A webapp that allows discord server owners to keep track of their staff teams attendance, exploiting Discord Oauth2.

The application allows you to keep track of the state of the attendance of your Discord staff. Moderators can log into the app through discord authentication, and have their account automatically created.  
At that point, they're able to choose a month and set their availability for any day of the month, in addition to be able to check other moderators' attendance.

This allows for an overall better moderation team organization.

At the moment, the application defaults to 4 different attendance states:
- &#x1F7E2;: Available
- &#x1F7E1;: Partially available
- &#x1F534;: Unavailable
- &#x26AB;: Unspecified

## Table of Contents

- [Implementation languages](#implementation-languages)
	- [Quick setup](#quick-setup)
    - [Frontend Architecture](#frontend-architecture)
    - [Backend Architecture](#backend-architecture)

## Implementation languages
The languages used are:
- Python 3 and its [Flask framework](https://flask.palletsprojects.com/en/2.3.x/) for the backend
- Vanilla JavaScript for the frontend, with HTML5 for templates and CSS3 for styling

### Quick setup
To get the application to run to test it or work with you need to follow a few steps.

1. Creating the discord application
A Discord applicatino is needed to be able to exploit Discord Oauth2.

First, log in to the [Discord Developer Portal applications page](https://discord.com/developers/applications).

Then, click on "New Application" in the top-right corner of the page to create your Discord application.
It will require you to insert a name for your application, and to select if you want it to be personal or team-shared; make it personal.
Lastly, flag the check-box regarding the terms of service and click on "Create".

Now, access your newly created application and head to the "OAuth2" section: here, you will be able to obtain `client id` and `client secret` of your application, which you will need later for the webapp configuration.

*Note: you may have to hit "Reset" before you can actually copy the `client secret` value*

2. Install Python dependencies
Open a terminal in the application folder and launch the following command:
```sh
pip install -r requirements.txt
```
3. Initialize configuration files
In the terminal you opened before, launch now this commands
```sh
cp .env.template .env
cp app/config.ini.template app/config.ini
```

If you're on Windows, use the `copy` command instead:
```sh
copy .env.template .env
copy "app\config.ini.template" "app\config.ini"
```

Now open the `.env` and `app/config.ini` files and compile them accordingly with the required Discord application and MongoDB informations.

*Note: in a real production environment, you should use environment variables instead of a .env file*

4. Launch the Flask server
Once again in the same terminal, launch the following command to start the Flask server:
```sh
flask --app app run
```

5. Open the application
You can now open the application at http://localhost:5000/

### Frontend Architecture
The application aims at performance and lightness by avoiding frameworks overheaed and using only vanilla JavaScript. While this provides advantages, it also generated some issues while trying to keep the code organized.
The application also aims at separation of concerns, modularizing most of the codebase to keep it clear, scalable and maintainable.

Giving these premises, let's get to the actual architecture. The frontend layer of the software follows a custom architecture, inspired by the base concepts of the popular MVC architecture.

Here's a summarized view of it:

```
static/
├── images/
├── js/
│   ├── controller/
│   ├── model/
│   ├── repository/
│   ├── utils/
│   │   └── enums/
│   └── view/
│       ├── components/
│       └── pages/
└── styles/
    ├── components/
    └── pages/
templates/
├── components/
├── layouts/
└── pages/
```

Let's start talking about the view layer, which is the trickiest one: to facilitate modularization and reusability, it makes use of JavaScript Web Components.

Here some of the first issues arise: by default, JS web components are studied in a way where their HTML structure needs to be placed in the same file. This makes it harder tho to write and maintain the HTML code.
The only way to locate web components HTML structure in a separate file and import them without using frameworks or webpack and similar tools, it's to fetch their content from the templates the backend exposes.
This add some complications: as it's now all managed asynchronously, and as every component can contain other components inside of it, to synchronize everything correctly, every component needs to emit a signal when it's ready, so that any component that has it inside of it can wait until it gets the signal to start correctly initializing itself and emitting its own "ready" signal as well.

This is managed using a `SignalComponent` class, which other components have to inherit from. Components now have to register their children components at the end of their `connectedCallback()` method using the inherited `registerChildComponents()` method and passing them to it.
This method manages adding `'component-initialized'` signal listeners and emitting a `'component-initialized'` signal for the component itself when all children components are ready. For this reason, it's important to call the method in every component, even when they don't have children components. Calling the method with no parameters will still in fact emit the ready signal correctly.

Any component needs then to follow this pattern:

```js
import { SignalComponent } from '../components/SignalComponent.js'

class ExampleComponent extends SignalComponent {

  #childComponent = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const htmlPath = this.TEMPLATES_PATH + 'components/example-component.html';

    fetch(htmlPath)
      .then(response => response.text())
      .then(html => {
        this.shadowRoot.innerHTML = html;
        this.#childComponent = this.shadowRoot.querySelector('.loader');
        this.registerChildComponents([this.childComponent]);
      })
      .catch(error => console.error('Error loading HTML file:', error));
  }

  disconnectedCallback() {}


  customMethod() { ... }

}

if ('customElements' in window) {
  customElements.define('example-component', ExampleComponent);
}
```

Everything in the view layer is a web component, even pages: the app works in a way that, similarly to React, uses a single `main.html` template file with a root `div` node to which pages web components are attached to according to a parameter passed from the backend.
The logic that loads and sets up the correct page component and its controller happens in the `main.js` file.
Also, page components inherit from the same `base.html` jinja layout which separates them in 3 blocks, for "header", "content" and "footer".

Now that we know how this works, the rest kind of follows MVC principles: components are defined in the view layer, and controllers manage initializing them and any event listener they need for user input.

Repository layer contain classes that communicate with the api endpoints exposed by the backend or any other external api, while the model layer contains the data classes the program needs.

The program then makes use of some helper classes located in utils, one to manage `localStorage` and the other to be able to keep track of the added listeners and therefore remove all of them on something at a time.

Styling makes use of CSS default `@import` statement, for a better code organization. This said, it has some downsides, as this way of importing makes them so that they're downloaded sequentially instead of in parallel when loading a page. This can cause some slow styling loads and artifact.
Ways to fix this are either importing CSS resources all directly in the HTML templates, which would make it for a worse code organization, or leaning on some technology like SCSS which would need some server-side preprocessing into CSS so that the browser can actually understand it, and add then some overhead.

### Backend Architecture

Backend architecture is less complicated, and follow Model-View-Template, which again is based off MVC.
This is basically the equivalent of the MVC pattern, but we don't have controllers here.

The blueprint layer, which is the presentation layer, is made and organized through the help of Flask Blueprints, which organize routes that expose data and render templates, and are then attached to the Flask application object when it's created through the factory `create_app()` method.

Blueprints communicate with services in the service layer which act as middlemen and retrieve data from repositories by communicating with the repository layer.
Services sometimes makes use of custom `Success`/`Error` classes when they have to propagate multiple errors, so that the blueprints can act accordingly.

Error handling is managed with Flask error handlers and a custom `HttpException` class.

The model once again contains the data classes the backend needs.

In the util layer it's present a config module, which contains a `Config` singleton that retrieves configuration data from both the `.env` (or environment variables) and the `config.ini` files and then makes them available for the backend to use.
Also, to render templates, a custom `render_page()` method is used, which also serve configuration data to the frontend.

The repository layer contains repository that communicate with external services, like Discord apis for Oauth2 or MongoDB api to write data to the external MongoDB database.

Here's a view of the backend architecture:

```
app/
├── blueprint/
├── model/
├── repository/
├── service/
├── static/
│   ├── images/
│   ├── js/
│   └── styles/
├── templates/
└── utils/
    └── enums/
```