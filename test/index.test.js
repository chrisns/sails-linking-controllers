"use strict";
var lib = rewire('../lib/index');

describe('UNIT sails-linking-controllers', () => {
  let reverseRouteService, sailsMock, controllerLinksHook, afterStub, cb;
  before(() => {
    sailsMock = {};
    controllerLinksHook = lib(sailsMock);
  });

  describe('Initialize', () => {
    before(() => {
      afterStub = sinon.stub();
      sailsMock.after = afterStub;
      cb = sinon.stub();
      controllerLinksHook.initialize(cb);
    });
    it('should initialize the sails,pageLinks object', () => {
      expect(sailsMock.pageLinks).to.eql({});
    })
    it('should call sails.after with the right args.', () => {
      expect(sailsMock.after).to.be.calledWith(['reverseRouteService:ready', 'router:after'], controllerLinksHook.addPageLinks);
    });
    it('should call the callback', () => {
      expect(cb).to.be.called;
    })
  });

  describe('addPageLinks', () => {
      let controllerLinksStub, originalControllerLinks, reverseRouteServiceStub;
      before(() => {
        reverseRouteService = sinon.stub().returns('link');
        sailsMock.controllers = {controller1: {_config: {links: ['a', 'b']}}, controller2: {}};
        sailsMock.reverseRoutes = {'controller1.find': {}, 'controller2.destroy': {}};
        controllerLinksStub = sinon.stub().returns({key: 'value'});
        originalControllerLinks = lib.__get__('controllerLinks');
        lib.__set__('controllerLinks', controllerLinksStub);
        reverseRouteServiceStub = sinon.stub().returns(['links']);
        global.reverseRouteService = reverseRouteServiceStub;
        controllerLinksHook.addPageLinks();
      });

      after(() => {
        lib.__set__('controllerLinks', originalControllerLinks);
      });

      it("should call controllerLInks twice.", () => {
        expect(controllerLinksStub).to.have.callCount(2);
      });
      it('should add links to the sails.pageLinks object.', () => {
        expect(sailsMock.pageLinks).to.eql({key: 'value'});
      });
    }
  );

  describe('routes.after.*', () => {
    let res, req, next, originalMatchPaths, matchPathsMock;

    before(() => {
      sailsMock.pageLinks = {
        'path/to/something': [{rel: 'rel', link: 'link'}],
        "path/to/:arg": [{rel: 'rel1', link: 'link'}]
      };
      originalMatchPaths = lib.__get__('matchPaths');
      matchPathsMock = sinon.stub().returns('path/to/:arg');
      lib.__set__('matchPaths', matchPathsMock);
      next = sinon.stub();

      res = {};
    });

    beforeEach(() => {
    });

    after(() => {
      lib.__set__('matchPaths', originalMatchPaths);
    });

    describe('where path has no args...', () => {
      before(() => {
        req = {originalUrl: 'path/to/something'};
        controllerLinksHook.routes.after['*'](req, res, next);
      });

      it('shuold return pageLinks at [path].', () => {
        expect(res.pageLinks).to.eql([{rel: 'rel', link: 'link'}]);
        expect(matchPathsMock).to.have.callCount(0);
        expect(next).to.have.been.called;
      });
    });

    describe('where path has an arg...', () => {
      before(() => {
        req = {originalUrl: 'path/to/42'};
        controllerLinksHook.routes.after['*'](req, res, next);
      });

      it('shuold return pageLinks at [path].', () => {
        expect(res.pageLinks).to.eql([{rel: 'rel1', link: 'link'}]);
        expect(matchPathsMock).to.have.callCount(1);
        expect(next).to.have.been.called;
      });

    });

    describe('where pageLinks[path] is undefined...', () => {
      before(() => {
        req = {originalUrl: 'does/not/exist'};
        matchPathsMock = sinon.stub().returns('something');
        lib.__set__('matchPaths', matchPathsMock);
        controllerLinksHook.routes.after['*'](req, res, next);
      });

      it('shuold return an empty array. of pageLinks.', () => {
        expect(res.pageLinks).to.eql([]);
        expect(matchPathsMock).to.have.callCount(1);
        expect(next).to.have.been.called;
      });

    });

  });

  describe('matchPaths', () => {
    let pageLinks, matchPaths;
    before(() => {
      pageLinks = {
        'path/with/noargs': [],
        'path/to/:arg': [],
        'path/:arg1/to/:arg2': []
      };
      matchPaths = lib.__get__('matchPaths');
    });

    it('should return keys for paths that mach', () => {
      expect(matchPaths(pageLinks, 'path/with/noargs')).to.equal('path/with/noargs');
      expect(matchPaths(pageLinks, 'path/to/39')).to.equal('path/to/:arg');
      expect(matchPaths(pageLinks, 'path/23/to/33')).to.equal('path/:arg1/to/:arg2');
    })
  })

  describe('controllerLinks', () => {
    let controllerLinks, route, reverseRouteService;

    before(() => {
      sailsMock.controllers = {controller1: {_config: {links: ['action1', 'action2']}}, controller2: {}};
      global.sails = sailsMock;
      controllerLinks = lib.__get__('controllerLinks');
      route = {path: 'path'};
      reverseRouteService = sinon.stub().returns('link');
    });

    it('should add links if controller._config.links is an array of actions.', () => {
      expect(controllerLinks(route, 'controller1.findOne', reverseRouteService)).to.eql(
        {
          path: [
            {rel: 'action1', link: 'link'},
            {rel: 'action2', link: 'link'}
          ]
        });
    });
    it('should return an empty array if the controller._config.links isn\'t set.', () => {
      expect(controllerLinks(route, 'controller2.findOne', reverseRouteService)).to.eql({path: []});
    });
  });


});