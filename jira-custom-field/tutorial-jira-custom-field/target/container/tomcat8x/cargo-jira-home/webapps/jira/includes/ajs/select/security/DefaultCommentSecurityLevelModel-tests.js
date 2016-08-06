AJS.test.require([], function() {

    require([
        'jira/ajs/select/security/default-comment-security-level-model'
    ],
    function(
        Model
    ) {

        module("DefaultCommentSecurityLevelModel");

        test('check if _isLvlObjValid() correctly validates LvlObj', function () {
            var model = new Model("9001");
            ok(model._isLvlObjValid({
                level: 'this is valid level value',
                levelName: 'this is valid level name'
            }), "object with level and levelName fields should be valid");

            ok(!model._isLvlObjValid({
                error: 'this is not valid LvlObj'
            }), "object with error field should not be valid");

            ok(!model._isLvlObjValid({
                level: 'it has level field',
                emaNlevel: 'but has no level name'
            }), "object with lvl field and one other field should not be valid");

            ok(!model._isLvlObjValid({
                levelName: 'it has level name'
            }), "object with only levelName should not be valid");
        });

        test('check if updateDefault() executes onSuccess callback when ajax request is successful', function () {
            var model = new Model("9001");
            model._getDefaultStoreRequest = function getDefaultStoreRequestMock(lvlObj) {
                var mock = {
                    done: function (onDone) {
                        onDone();
                        return mock;
                    },
                    fail: function (onFail) {
                        return mock;
                    }
                };
                return mock;
            };

            var successCallback = this.sandbox.spy();
            var errorCallback = this.sandbox.spy();

            model.updateDefault({level: 'foo', levelName: 'bar'}, successCallback, errorCallback);

            sinon.assert.calledOnce(successCallback, "success callback should be called once");
            sinon.assert.notCalled(errorCallback, "error callback should not be called");
            equal(model._currentDefault.level, "foo", "_currentDefault should be set to level: 'foo' and levelName: 'bar'");
        });

        test('check if updateDefault() executes onError callback when ajax request fails', function () {
            var model = new Model("9001");
            model._getDefaultStoreRequest = function getDefaultStoreRequestMock(lvlObj) {
                var mock = {
                    done: function (onDone) {
                        return mock;
                    },
                    fail: function (onFail) {
                        onFail("xhr placeholder");
                        return mock;
                    }
                };
                return mock;
            };

            var successCallback = this.sandbox.spy();
            var errorCallback = this.sandbox.spy();

            model.updateDefault({level: 'foo', levelName: 'bar'}, successCallback, errorCallback);

            sinon.assert.calledOnce(errorCallback, "error callback should be called once");
            sinon.assert.calledWith(errorCallback, "xhr placeholder");
            sinon.assert.notCalled(successCallback, "success callback should not be called");
            equal(model._currentDefault, null, "_currentDefault should be set to null");
        });

        test('check if getDefault() executes onSuccess callback when ajax request is successful', function () {
            var model = new Model("9001");
            model._isLvlObjValid = function () { return true; };
            model._getDefaultLoadRequest = function getDefaultLoadRequestMock() {
                var mock = {
                    done: function (onDone) {
                        onDone("level as a string");
                        return mock;
                    },
                    fail: function (onFail) {
                        return mock;
                    }
                };
                return mock;
            };

            var callback = this.sandbox.spy();

            model.getDefault(callback, null);

            sinon.assert.calledOnce(callback, "callback should be called once");
            sinon.assert.calledWith(callback, "level as a string");
            equal(model._currentDefault, "level as a string", "_currentDefault should be set to 'level as a string'");
        });

        test('check if getDefault() executes onError callback when ajax request fails', function () {
            var model = new Model("9001");
            model._getDefaultLoadRequest = function getDefaultLoadRequestMock() {
                var mock = {
                    done: function (onDone) {
                        return mock;
                    },
                    fail: function (onFail) {
                        onFail("oh crap");
                        return mock;
                    }
                };
                return mock;
            };

            var callback = this.sandbox.spy();

            model.getDefault(null, callback);

            sinon.assert.calledOnce(callback, "callback should be called once");
            sinon.assert.calledWith(callback, "oh crap");
            equal(model._currentDefault, null, "_currentDefault should be set to null");
        });
    });
});