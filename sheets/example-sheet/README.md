# Advanced Beacon Example Sheet

This is an advanced sheet example, it is setup as with Vue framework, Typescript, Vite, SCSS and has some basic testing setup.
Comments have been added to the files in this project to better explain their intent and suggested implementation.

![an example of the default sheet homepage](preview.png)
 
## Getting Started

### Accessing the Beacon SDK

Since the beacon SDK is currently hosted on github, you will need access to the github package registry.

In order to do so you will need to generate a [Personal Access Token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#personal-access-tokens-classic):
* Under the github user account drop down, go to Settings → Developer Settings → Personal Access Tokens.
* Generate a new token with `read:packages` scopes.
* In your terminal, run export `GITHUB_TOKEN="<YOUR_SUPER_SECRET_TOKEN>"`.
* To avoid having to re-run this command every time you restart your computer, add it to your `.zshenv` file. 
  * (Bash users can add it to either .bashrc or .profile., or add it to the profile for the environment you are using)
* Close the current shell and open a new one to start using the new token.


### What is the .npmrc file?
The .npmrc file in this folder, contains the logic for looking up the beacon sdk package through the github package registry. 

You shouldn't have to edit this file but you would need to copy it to your own project if you would like to access the beacon sdk package.

### Install Dependencies

Before doing anything else and after you have gotten the beacon sdk access token, you have to install the packages this project depends on. 

```sh
npm install
```

Now that you have the project's dependencies installed you can run the vite server, to start testing changes to the project. To do so there are two ways you can boot up the server:

### Offline development
```sh
npm run dev
```

This will run the vite server, with the default port and environment set to development. What this means is that the project will read a mock Relay that allows you to open your project in any web browser by going to `http://localhost:5173`.

This is useful when you do not have access to the Roll20 website or would like to work on parts of your project that do not depend on a connect to the VTT or Roll20 Characters. Such as when working on stying, mocking up environment, building Vue components, testing functionality, etc..

While in development mode, you will not be able to save or access existing character data, or use the Beacon SDK functions that depend on VTT or Roll20 Characters functionality such as dice rolling and token manipulation.

### Sandbox development
```sh
npm run sandbox
```

This command will firstly build the SCSS files and then run the vite server with the port set to 7620 and environment set to staging mode. This sets the server up for connecting to a VTT custom sheet sandbox as well as through the sandbox in Roll20 Characters.

In order to test your changes in the VTT custom sheet sandbox, you will need to add the follwoing to the sheet.json editor in the games settings:
```
{
  "advanced": true,
  "advancedPort": 7620
}
```

### Ci Check
```sh
npm run ci-check
```

This command will run a number of things to make sure your code is as optimal as possible including formatting, linting, type checking, unit tests, and end to end tests.
Think of this as a sanity check that you can leverage when pushing a big release for your sheet!


## Below is a list of other available commands for this project  
### Hot reload and build css for roll templates
```sh
npm run watch-scss
```

### Eslint Files
```sh
npm run lint
```

### Format with prettier
```sh
npm run format
```

### Type Check with typescript
```sh
npm run type-check
```

### Unit Test with Vitest
```sh
npm run test:unit
```

### Open up and develop local End To End Tests with Cypress
```sh
npm run test:e2e:open:local
```

### Run local End To End Tests with Cypress
```sh
npm run test:e2e:local
```

### Run CDN Hosted End To End Tests with Cypress
```sh
npm run test:e2e
```

## Deploying your sheet

Details for this coming soon!
