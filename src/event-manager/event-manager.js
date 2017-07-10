ym.modules.define('shri2017.imageViewer.EventManager', [
], function (provide) {

    function EventManager(elem, callback) {
        this._elem = elem;
        this._callback = callback;
        this._setupListeners();
    }

    Object.assign(EventManager.prototype, {
        destroy: function () {
            this._teardownListeners();
        },

        _setupListeners: function () {

        },

        _teardownListeners: function () {

        },

        _addEventListeners: function (types, elem, callback) {
            types.split(' ').forEach(function (type) {
                elem.addEventListener(type, callback);
            }, this);
        },

        _removeEventListeners: function (types, elem, callback) {
            types.split(' ').forEach(function (type) {
                elem.removeEventListener(type, callback);
            }, this);
        },

        _calculateElementPreset: function (elem) {
            // !
            var result = {
                x: 0,
                y: 0
            };
            while (elem) {
                result.x += elem.offsetLeft;
                result.y += elem.offsetTop;
                elem = elem.offsetParent;
            }
            return result;
        }
    });

    provide(EventManager);
});
