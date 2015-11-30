"use strict";
var _ = require('lodash');
var Promise = require('bluebird');

module.exports = function (sails) {
  return {
    initialize: function (cb) {
      sails.pageLinks = {};
      sails.after(['reverseRouteService:ready', 'router:after'], this.addPageLinks);
      cb();
    },
    routes: {
      after: {
        '*': function (req, res, next) {
          const pageLinks = _.get(sails, 'pageLinks');
          res.pageLinks = _.get(pageLinks, req.originalUrl) || _.get(pageLinks, matchPaths(pageLinks, req.originalUrl)) || [];
          return next();
        }
      }
    },
    addPageLinks: function () {
      return Promise.each(_.keys(sails.reverseRoutes), (key) => {
        let links = controllerLinks(sails.reverseRoutes[key], key, reverseRouteService);
        sails.pageLinks = _.assign(sails.pageLinks, links);
      });
    }
  };
};

/**
 * Match paths, skipping arguments.
 * @param path1
 * @param path2
 * @returns {boolean}
 */
function matchPaths(pageLinks, path) {
  let result;
  path = _.compact(path.split('/'));
  result = _.filter(_.keys(pageLinks), key => {
    const path2 = _.compact(key.split('/'));
    const noMatch = _.filter(path2, fragment => {
      return fragment.substring(0, 1) !== ':' && _.indexOf(path, fragment) !== _.indexOf(path2, fragment);
    });
    return noMatch.length === 0;
  });
  return result[0];
}

/**
 * Create an array of pagelinks.
 * @param controllers
 * @param reverseRoute
 * @param controllerAction
 * @returns {Promise.<Function>}
 */
function controllerLinks(route, controllerAction, reverseRouteService) {
  const controllers = sails.controllers;
  const controller = _.first(controllerAction.split('.'));
  const path = route.path;
  const actions = _.get(controllers[controller], '_config.links') || [];
  let result = {};
  result[path] = [];
  _.each(actions, function (action) {
    return result[path].push({
      rel: action,
      link: reverseRouteService({controller: controller + '.' + action, args: []}, false)
    });
  });
  return result;
}
