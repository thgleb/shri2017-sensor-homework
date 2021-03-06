ym.modules.define('shri2017.imageViewer.EventManager', [
    'util.extend'
], function (provide, extend) {

    var EVENTS = {
        mousedown: 'start',
        mousemove: 'move',
        mouseup: 'end',

        touchstart: 'start',
        touchmove: 'move',
        touchend: 'end',
        touchcancel: 'end',

        wheel: "wheel",
        mousewheel: "wheel",
        MozMousePixelScroll: "wheel",

        pointerdown: 'start',
        pointermove: 'move',
        pointerup: 'end'
    };

    function EventManager(elem, callback) {
        this._elem = elem;
        this._callback = callback;
        this._setupListeners();
    }

    extend(EventManager.prototype, {
        destroy: function () {
            this._teardownListeners();
        },

        _setupListeners: function () {
            this._mouseListener = this._mouseEventHandler.bind(this);
            this._touchListener = this._touchEventHandler.bind(this);
            this._mouseWheelListener = this._mouseWheelEventHandler.bind(this);
            this._pointerListener = this._pointerEventHandler.bind(this);

            this._addEventListeners('mousedown', this._elem, this._mouseListener);
            this._addEventListeners('wheel mousewheel MozMousePixelScroll', this._elem, this._mouseWheelListener);

            if ('onpointerdown' in window) {
                this._addEventListeners('pointerdown', this._elem, this._pointerListener);
            } else if ('ontouchstart' in window) {
                this._addEventListeners('touchstart touchmove touchend touchcancel', this._elem, this._touchListener);
            }
        },

        _teardownListeners: function () {
            this._removeEventListeners('mousedown mousemove mouseup', this._elem, this._mouseListener);
            this._removeEventListeners('touchstart touchmove touchend touchcancel', this._elem, this._touchListener);
            this._removeEventListeners('wheel mousewheel MozMousePixelScroll', this._elem, this._mouseWheelListener);
            this._removeEventListeners('pointerdown pointermove pointerup', this._elem, this._pointerListener);
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

        _mouseEventHandler: function (event) {
            event.preventDefault();

            if (event.type === 'mousedown') {
                this._addEventListeners('mousemove mouseup', document.documentElement, this._mouseListener);
            } else if (event.type === 'mouseup') {
                this._removeEventListeners('mousemove mouseup', document.documentElement, this._mouseListener);
            }

            var elemOffset = this._calculateElementOffset(this._elem);

            this._callback({
                eventSpec: "mouseevent",

                type: EVENTS[event.type],
                targetPoint: {
                    x: event.clientX - elemOffset.x,
                    y: event.clientY - elemOffset.y
                },
                distance: 1
            });
        },

        _touchEventHandler: function (event) {
            event.preventDefault();

            var touches = event.touches;
            // touchend/touchcancel
            if (touches.length === 0) {
                touches = event.changedTouches;
            }

            var targetPoint;
            var distance = 1;
            var elemOffset = this._calculateElementOffset(this._elem);

            if (touches.length === 1) {
                targetPoint = {
                    x: touches[0].clientX,
                    y: touches[0].clientY
                };
            } else {
                var firstTouch = touches[0];
                var secondTouch = touches[1];
                targetPoint = this._calculateTargetPoint(firstTouch, secondTouch);
                distance = this._calculateDistance(firstTouch, secondTouch);
            }

            targetPoint.x -= elemOffset.x;
            targetPoint.y -= elemOffset.y;

            this._callback({
                eventSpec: "touchevent",

                type: EVENTS[event.type],
                targetPoint: targetPoint,
                distance: distance
            });
        },

        _mouseWheelEventHandler: function (event) {
            event.preventDefault();

            var currentDelta = event.deltaY || event.detail || event.wheelDelta;
            this._wheelDelta = (this._wheelDelta || 0) + currentDelta;

            this._callback({
                eventSpec: "wheelevent",

                type: EVENTS[event.type],
                targetPoint: {
                    x: event.offsetX,
                    y: event.offsetY
                },
                delta: this._wheelDelta,
                currentDelta: currentDelta
            });
        },

        _pointerEventHandler: function (event) { // supporting only 1 pointer
            event.preventDefault();

            if (event.type === 'pointerdown') {
                this._addEventListeners('pointermove pointerup pointercancel', document.documentElement, this._pointerListener);
            } else if (event.type === 'pointerup' || event.type === 'pointercancel') {
                this._removeEventListeners('pointermove', document.documentElement, this._pointerListener);
            }

            var elemOffset = this._calculateElementOffset(this._elem);

            this._callback({
                eventSpec: "pointerevent",
                pointerType: event.pointerType,

                type: EVENTS[event.type],
                targetPoint: {
                    x: event.clientX - elemOffset.x,
                    y: event.clientY - elemOffset.y
                },
                distance: 1
            });
        },

        _calculateTargetPoint: function (firstTouch, secondTouch) {
            return {
                x: (secondTouch.clientX + firstTouch.clientX) / 2,
                y: (secondTouch.clientY + firstTouch.clientY) / 2
            };
        },

        _calculateDistance: function (firstTouch, secondTouch) {
            return Math.sqrt(
                Math.pow(secondTouch.clientX - firstTouch.clientX, 2) +
                Math.pow(secondTouch.clientY - firstTouch.clientY, 2)
            );
        },

        _calculateElementOffset: function (elem) {
            var bounds = elem.getBoundingClientRect();
            return {
                x: bounds.left,
                y: bounds.top
            };
        }
    });

    provide(EventManager);
});
