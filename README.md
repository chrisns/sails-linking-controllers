# sails-linking-controllers

[![Build](https://travis-ci.org/chrisns/sails-linking-controllers.png)](https://travis-ci.org/chrisns/sails-linking-controllers)
[![Coverage](https://coveralls.io/repos/chrisns/sails-linking-controllers/badge.png)](https://coveralls.io/r/chrisns/sails-linking-controllers)
[![Quality](https://codeclimate.com/github/chrisns/sails-linking-controllers.png)](https://codeclimate.com/github/chrisns/sails-linking-controllers)
[![Dependencies](https://david-dm.org/chrisns/sails-linking-controllers.png)](https://david-dm.org/chrisns/sails-linking-controllers)


## Description

Ability to generate hateoas-compatible links to actions (list/create) on controllers.

## Install

```bash
$ npm install sails-linking-cotronllers
```

## Usage
Add a links array to your controller's _config object, like so (in yourController.js)
```js
    module.exports = {
      ...
      _config: {
          ...
          links: ['action1', 'action2', ...],
          ...
      },
      ...
   }
```

Links to perform those actions will then be added to your responseses.



## Tests

```bash
$ npm install
$ npm test
```
