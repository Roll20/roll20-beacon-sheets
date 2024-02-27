# Beacon Example Sheet

This is an example sheet setup to help you get started

## Getting Started

### Accessing the Beacon SDK

Since the beacon SDK is hosted on github, you will need access to the github package registry.

Firstly you will need to generate a [Personal Access Token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#personal-access-tokens-classic)
* Under the github user account dropdown, go to Settings → Developer Settings → Personal Access Tokens.
* Generate a new token with `read:packages` scopes.
* In your terminal, run export `GITHUB_TOKEN="<YOUR_SUPER_SECRET_TOKEN>"`.
* To avoid having to re-run this command every time you restart your computer, add it to your `.zshenv` file. 
  * (Bash users can add it to either .bashrc or .profile., or add it to the profile for the environment you are using)
* Close the current shell and open a new one to start using the new token.

Now that you have an access token, you can add a `.npmrc` file to the directory of your sheet from the Example Sheet `.npmrc`

That file should look very similar to this:

```
@roll20:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

### Install Dependencies

These are a list of commands to help you run your first sheet and get you started.

We recommend installing dependencies and being able to run your project from our example sheet template before diving into development.

```sh
npm install
```

### Run the vite server for sandbox development
This will allow you to set your sandbox port in a sandbox game or using the advanced settings for a character sheet in Roll20 Characters. That way you can test out your sheet live as you make development changes.
```sh
npm run sandbox
```

### Hot reload and build css for roll templates
```sh
npm run watch-scss
```

### Ci Check

This command will run a number of things to make sure your code is as optimal as possible including formatting, linting, type checking, unit tests, and end to end tests.
Think of this as a sanity check that you can leverage when pushing a big release for your sheet!

```sh
npm run ci-check
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