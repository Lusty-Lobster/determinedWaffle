[![Stories in Ready](https://badge.waffle.io/determinedWaffle/determinedWaffle.png?label=ready&title=Ready)](https://waffle.io/determinedWaffle/determinedWaffle)
# Thumbs Check

> Enhanced real-time classroom interaction and analytics

## Team

  - __Product Owner__: Mike Yao
  - __Scrum Master__: Andy Sponring
  - __Development Team Members__: Austin Liu, David Trinh, Mike Yao, Andy Sponring

## Table of Contents

1. [Usage](#Usage)
1. [Requirements](#requirements)
2. [Tech Stack](#tech-stack)
1. [Development](#development)
    1. [Installing Dependencies](#installing-dependencies)
    1. [Set up Firebase](#set-up-firebase)
    1. [Start local server](#start-local-server)
    1. [Deploy to production](#deploy-to-production)
1. [Team](#team)
1. [Contributing](#contributing)

## Usage

To view a live hosted instance of the app, visit [this link](https://waffleup.firebaseapp.com/).

You will be asked to login via GitHub. Once you have authorized the application, you will be taken to the main view for a student. When an instructor initiates a poll (either a thumbs check or a mini-quiz), this page will be updated with the poll.

If you would like to use the app as an instructor, you will need to add your GitHub user id to the 'instructors' object in Firebase. Contact the team for details.

## Requirements

- Node 0.10.x
- Express 4.x
- Firebase Instance (set up at www.firebase.com)
- Bower

## Tech stack

We use an Angular client on top of a Firebase backend. We use the official Firebase integration with Angular, called [AngularFire](https://www.firebase.com/docs/web/libraries/angular/), to gain access to objects stored on Firebase and manage authentication. 

[Firebase](https://www.firebase.com/) is a 'backend as a service'. It allows us to write very little server-side code and is really nifty for syncing real-time data. Firebase is essentially a Mongo database that stores all data as JSON.

The very thin server we have is based on Node and Express.

The UI is based on [Bootstrap](http://getbootstrap.com/).

Bower will install all the front-end dependencis for you. Grunt automates some tasks for us. Unit testing (just a stub for now) is done with Karma and uses [Angular-Mocks](https://github.com/angular/bower-angular-mocks) (included in the Bower dependencies).

## Development

### Installing Dependencies

From within the root directory:

```sh
npm install -g grunt-cli
npm install
cd app
bower install
```

### Set up Firebase

Create your own Firebase instance and change the Firebase URL in /app/scripts/angularfire/config.js. The Firebase URL is stored in the constant 'FBURL'. 

In firebase.json change the 'firebase' property value to your firebase app name.

Navigate to 'https://your_app_name.firebaseio.com/' and do the following: 

**Create a key called 'instructors'**

The value of this key will be an object with keys in this format: 'github:{github_user_id}' (eg, 'github:123456). The value of this latter key should be a string containing the instructor's display name, eg "Fred Zirdung". The full entry should look like this: **github:123456:** "Fred Zirdung".

**Setup GitHub authentication**

Click 'Login & Auth' and follow instructions to set up GitHub authentication.

### Start local server

In the root directory:

```sh
grunt deploy
```

This will start a grunt process that watches all your client and server files for changes and restarts the server if changes are detected.

Now just open your browser to 'http://localhost:3000'.

### Deploy to production

Deploying your app using Firebase is a snap! From the root directory run:

```sh
grunt deploy --prod
```

You will be prompted to enter your Firebase login credentials. Once completed, just navigate to 'https://your_app_name.firebaseapp.com/' where 'your_app_name' is the the name you configured in Firebase for your app. We used 'https://waffleup.firebaseapp.com/'.


## Roadmap

View the project roadmap [here](https://github.com/determinedWaffle/determinedWaffle/issues).


## Contributing

See [CONTRIBUTING.md](https://github.com/determinedWaffle/determinedWaffle/blob/master/_CONTRIBUTING.md) for contribution guidelines.

