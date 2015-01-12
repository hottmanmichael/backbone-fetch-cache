describe('Collection.fetch', function () {
  var Collection;

  Collection = Backbone.Collection.extend({});

  describe('with Backbone.fetchCache.enabled:false', function () {
    var values, url;
    values = null;

    beforeEach(function (done) {
      var id, collection, requests;
      id = _.uniqueId();

      // This is the flag we're testing:
      Backbone.fetchCache.enabled = false;

      // Initialize a new collection:
      collection = new Collection([{
        id: id,
        codename: '005'
      }]);
      // Make the URL unique so we don't collide with other tests.
      collection.url = '/fetch/cache/collection-'+ id;

      requests = [
        { response: [{ id: id, codename: '006' }] },
        { response: [{ id: id, codename: '007' }] }
      ];

      // Set the response when done.
      function onresponse(res) {
        values = res;
        return done();
      }

      // Mock the actual fetches:
      UTILS.fetch({
        entity: collection,
        requests: requests
      }, onresponse);
    });

    afterEach(function () {
      Backbone.fetchCache.enabled = true;
    });

    it('returns a resolved deferred', function () {
      var rv_1 = values[0].returns,
          rv_2 = values[1].returns;
      expect(rv_1).toBeADeferred();
      expect(rv_1).toBeResolved();
      expect(rv_2).toBeADeferred();
      expect(rv_2).toBeResolved();
    });

    it('fires request event', function () {
      var events_1 = values[0].events,
          events_2 = values[1].events;

      expect(events_1.request).toBeDefined();
      expect(events_2.request).toBeDefined();
    });

    it('fires sync event', function () {
      var events_1 = values[0].events,
          events_2 = values[1].events;

      expect(events_1.sync).toBeDefined();
      expect(events_2.sync).toBeDefined();
    });

    it('does not fire cachesync event', function () {
      var events_1 = values[0].events,
          events_2 = values[1].events;

      expect(events_1.cachesync).toBeUndefined();
      expect(events_2.cachesync).toBeUndefined();
    });

    it('uses new values from server', function () {
      var first = values[0].synced,
          second = values[1].synced;
      expect(first.codename).toEqual('006');
      expect(second.codename).toEqual('007');
    });
  });

  describe('with cache:false on subsequent requests', function () {
    var values = null;

    beforeEach(function (done) {
      var id, collection, requests;
      id = _.uniqueId();

      // Initialize a new collection:
      collection = new Collection([{
        id: id,
        codename: '005'
      }]);
      // Make the URL unique so we don't collide with other tests.
      collection.url = '/fetch/cache/collection-'+ id;

      requests = [
        { response: [{ id: id, codename: '006' }] },
        { response: [{ id: id, codename: '007' }] }
      ];

      // Set the response when done.
      function onresponse(res) {
        values = res;
        return done();
      }

      // Mock the actual fetches:
      UTILS.fetch({
        entity: collection,
        requests: requests
      }, onresponse);
    });

    it('returns a resolved deferred', function () {
      var rv_1 = values[0].returns,
          rv_2 = values[1].returns;
      expect(rv_1).toBeADeferred();
      expect(rv_1).toBeResolved();
      expect(rv_2).toBeADeferred();
      expect(rv_2).toBeResolved();
    });

    it('fires request event', function () {
      var events_1 = values[0].events,
          events_2 = values[1].events;

      expect(events_1.request).toBeDefined();
      expect(events_2.request).toBeDefined();
    });

    it('fires sync event', function () {
      var events_1 = values[0].events,
          events_2 = values[1].events;

      expect(events_1.sync).toBeDefined();
      expect(events_2.sync).toBeDefined();
    });

    it('does not fire cachesync event', function () {
      var events_1 = values[0].events,
          events_2 = values[1].events;

      expect(events_1.cachesync).toBeUndefined();
      expect(events_2.cachesync).toBeUndefined();
    });

    it('does not use cached values', function () {
      var first = values[0].synced,
          second = values[1].synced;
      expect(first.codename).toEqual('006');
      expect(second.codename).toEqual('007');
    });
  });

  describe('with cache:true on second request only', function () {
    var values = null,
        collection = null,
        options = { cache: true };

    beforeEach(function (done) {
      var id, requests;
      id = _.uniqueId();

      // Initialize a new collection:
      collection = new Collection([{
        id: _.uniqueId(),
        codename: '005'
      }]);
      // Make the URL unique so we don't collide with other tests.
      collection.url = '/fetch/cache/collection-'+ id;

      requests = [
        { response: [{ id: id, codename: '006' }] },
        { response: [{ id: id, codename: '007' }], options: options }
      ];

      // Set the response when done.
      function onresponse(res) {
        values = res;
        return done();
      }

      // Set spies
      sinon.spy(Backbone.fetchCache, 'getCacheKey');

      // Mock the actual fetches:
      UTILS.fetch({
        entity: collection,
        requests: requests
      }, onresponse);
    });

    afterEach(function (done) {
      // Need timeout to fully clear out the spies for some reason.
      window.setTimeout(function () {
        Backbone.fetchCache.getCacheKey.restore();
        done();
      }, 10);
    });

    it('returns a resolved deferred', function () {
      var rv_1 = values[0].returns,
          rv_2 = values[1].returns;
      expect(rv_1).toBeADeferred();
      expect(rv_1).toBeResolved();
      expect(rv_2).toBeADeferred();
      expect(rv_2).toBeResolved();
    });

    it('fires request event', function () {
      var events_1 = values[0].events,
          events_2 = values[1].events;

      expect(events_1.request).toBeDefined();
      expect(events_2.request).toBeDefined();
    });

    it('fires sync event', function () {
      var events_1 = values[0].events,
          events_2 = values[1].events;

      expect(events_1.sync).toBeDefined();
      expect(events_2.sync).toBeDefined();
    });

    it('does not fire cachesync event', function () {
      var events_1 = values[0].events,
          events_2 = values[1].events;

      expect(events_1.cachesync).toBeUndefined();
      expect(events_2.cachesync).toBeUndefined();
    });

    it('calls Backbone.fetchCache.getCacheKey', function () {
      var firstCall, secondCall;
      expect(Backbone.fetchCache.getCacheKey.called).toBeTruthy();
      // Called once in Utils, and twice in the library.
      firstCall = Backbone.fetchCache.getCacheKey.getCall(1);
      secondCall = Backbone.fetchCache.getCacheKey.getCall(4);
      expect(firstCall.calledWith(collection)).toBeTruthy();
      expect(secondCall.calledWith(collection, options)).toBeTruthy();
    });

    it('has no cached value', function () {
      var first = values[0].synced,
          second = values[1].synced;
      expect(first.codename).toEqual('006');
      expect(second.codename).toEqual('007');
    });
  });

  describe('with cache:true on first request only', function () {
    var collection = null,
        options = { cache: true },
        values = null;

    beforeEach(function (done) {
      var id, requests;
      id = _.uniqueId();

      // Initialize a new collection:
      collection = new Collection([{
        id: id,
        codename: '005'
      }]);
      // Make the URL unique so we don't collide with other tests.
      collection.url = '/fetch/cache/collection-'+ id;

      requests = [
        { response: [{ id: id, codename: '006' }], options: options },
        { response: [{ id: id, codename: '007' }] }
      ];

      // Set the response when done.
      function onresponse(res) {
        values = res;
        return done();
      }

      // Set spies
      sinon.spy(Backbone.fetchCache, 'getCacheKey');

      // Mock the actual fetches:
      UTILS.fetch({
        entity: collection,
        requests: requests
      }, onresponse);
    });

    afterEach(function (done) {
      // Need timeout to fully clear out the spies for some reason.
      window.setTimeout(function () {
        Backbone.fetchCache.getCacheKey.restore();
        done();
      }, 10);
    });

    it('returns a resolved deferred', function () {
      var rv_1 = values[0].returns,
          rv_2 = values[1].returns;
      expect(rv_1).toBeADeferred();
      expect(rv_1).toBeResolved();
      expect(rv_2).toBeADeferred();
      expect(rv_2).toBeResolved();
    });

    it('fires request event', function () {
      var events_1 = values[0].events,
          events_2 = values[1].events;

      expect(events_1.request).toBeDefined();
      expect(events_2.request).toBeDefined();
    });

    it('fires sync event', function () {
      var events_1 = values[0].events,
          events_2 = values[1].events;

      expect(events_1.sync).toBeDefined();
      expect(events_2.sync).toBeDefined();
    });

    it('does not fire cachesync event', function () {
      var events_1 = values[0].events,
          events_2 = values[1].events;

      expect(events_1.cachesync).toBeUndefined();
      expect(events_2.cachesync).toBeUndefined();
    });

    it('calls Backbone.fetchCache.getCacheKey', function () {
      var firstCall, secondCall;
      expect(Backbone.fetchCache.getCacheKey.called).toBeTruthy();
      // Called once in Utils, and twice in the library.
      firstCall = Backbone.fetchCache.getCacheKey.getCall(1);
      secondCall = Backbone.fetchCache.getCacheKey.getCall(4);
      expect(firstCall.calledWith(collection, options)).toBeTruthy();
      expect(secondCall.calledWith(collection)).toBeTruthy();
    });

    it('uses new values from server', function () {
      var first = values[0].synced,
          second = values[1].synced;
      expect(first.codename).toEqual('006');
      expect(second.codename).toEqual('007');
    });
  });

  describe('with cache:true on subsequent requests', function () {
    var collection = null,
        options = { cache: true },
        values = null;

    beforeEach(function (done) {
      var id, requests;
      id = _.uniqueId();

      // Initialize a new collection:
      collection = new Collection({
        id: id,
        codename: '005'
      });
      // Make the URL unique so we don't collide with other tests.
      collection.url = '/fetch/cache/collection-'+ id;

      requests = [
        { response: [{ id: id, codename: '006' }], options: options },
        { response: [{ id: id, codename: '007' }], options: options }
      ];

      // Set the response when done.
      function onresponse(res) {
        values = res;
        return done();
      }

      // Set spies
      sinon.spy(Backbone.fetchCache, 'getCacheKey');

      // Mock the actual fetches:
      UTILS.fetch({
        entity: collection,
        requests: requests
      }, onresponse);
    });

    afterEach(function (done) {
      // Need timeout to fully clear out the spies for some reason.
      window.setTimeout(function () {
        Backbone.fetchCache.getCacheKey.restore();
        done();
      }, 10);
    });

    it('returns a resolved deferred', function () {
      var rv_1 = values[0].returns,
          rv_2 = values[1].returns;
      expect(rv_1).toBeADeferred();
      expect(rv_1).toBeResolved();
      expect(rv_2).toBeADeferred();
      expect(rv_2).toBeResolved();
    });

    it('fires request event on first fetch', function () {
      var events_1 = values[0].events;
      expect(events_1.request).toBeDefined();
    });

    it('does not fire request event on second fetch', function () {
      var events_2 = values[1].events;
      expect(events_2.request).toBeUndefined();
    });

    it('fires sync event', function () {
      var events_1 = values[0].events,
          events_2 = values[1].events;

      expect(events_1.sync).toBeDefined();
      expect(events_2.sync).toBeDefined();
    });

    it('does not fire cachesync event on first request', function () {
      var events_1 = values[0].events;
      expect(events_1.cachesync).toBeUndefined();
    });

    it('fires cachesync event on second request', function () {
      var events_2 = values[1].events;
      expect(events_2.cachesync).toBeDefined();
    });

    it('calls Backbone.fetchCache.getCacheKey', function () {
      var firstCall, secondCall;
      expect(Backbone.fetchCache.getCacheKey.called).toBeTruthy();
      // Called once in Utils, and twice in the library.
      firstCall = Backbone.fetchCache.getCacheKey.getCall(1);
      secondCall = Backbone.fetchCache.getCacheKey.getCall(4);
      expect(firstCall.calledWith(collection, options)).toBeTruthy();
      expect(secondCall.calledWith(collection, options)).toBeTruthy();
    });

    it('uses cached value', function () {
      var first = values[0].synced,
          second = values[1].synced;
      expect(first.codename).toEqual('006');
      expect(second.codename).toEqual('006');
    });
  });
});

