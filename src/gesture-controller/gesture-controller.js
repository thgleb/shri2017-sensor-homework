ym.modules.define('shri2017.imageViewer.GestureController', [
    'shri2017.imageViewer.EventManager'
], function (provide, EventManager) {

    var DBL_TAB_STEP = 0.2,
        WHEEL_SCALE_STEP = DBL_TAB_STEP / 100,
        MIN_WHEEL_SCALE = 0.01,
        ONE_TOUCH_SCALE_STEP = DBL_TAB_STEP / 50;

    var Controller = function (view) {
        this._view = view;
        this._eventManager = new EventManager(
            this._view.getElement(),
            this._eventHandler.bind(this)
        );
        this._lastEventTypes = '';
    };

    function drawPoint(coords, color) {
        var SIDE_SIZE = 10;

        var p = document.createElement("div");

        p.style.width = SIDE_SIZE + "px";
        p.style.height = SIDE_SIZE + "px";

        p.style.position = "absolute";

        p.style.left = (coords.x - SIDE_SIZE / 2) + "px";
        p.style.top = (coords.y - SIDE_SIZE / 2) + "px";

        p.style.background = color || "white";
        p.style.boxShadow = "0 0 3px rgba(0,0,0,.8)";
        p.style.borderRadius = "50%";

        var container = document.querySelector("image-viewer");
        
        container.appendChild(p);
        container.style.position = "relative";
    }

    Object.assign(Controller.prototype, {
        destroy: function () {
            this._eventManager.destroy();
        },

        _eventHandler: function (event) {
            var state = this._view.getState();

            // dblclick
            if (!this._lastEventTypes) {
                setTimeout(function () {
                    this._lastEventTypes = '';
                }.bind(this), 500);
            }
            this._lastEventTypes += ' ' + event.type;

            if (this._lastEventTypes.indexOf('start end start end') > -1) {
                this._lastEventTypes = '';
                this._processDbltab(event);

                this._oneTouchZoom = false;
                return;
            } else if (this._lastEventTypes.indexOf('start end start move') > -1) {
                this._lastEventTypes = '';
                this._oneTouchZoom = true;
            }

            if (event.type === 'move') {
                if (event.distance > 1 && event.distance !== this._initEvent.distance) {
                    this._processMultitouch(event);
                } else if (this._oneTouchZoom) {
                    this._processOneTouch(event);
                } else {
                    this._processDrag(event);
                }
            } else if (event.type === "wheel") {
                this._processWheel(event);

                this._oneTouchZoom = false;
            } else {
                this._initState = this._view.getState();
                this._initEvent = event;

                this._oneTouchZoom = false;
            }
        },

        _processDrag: function (event) {
            this._view.setState({
                positionX: this._initState.positionX + (event.targetPoint.x - this._initEvent.targetPoint.x),
                positionY: this._initState.positionY + (event.targetPoint.y - this._initEvent.targetPoint.y)
            });
        },

        _processMultitouch: function (event) {
            this._scale(
                event.targetPoint,
                this._initState.scale * (event.distance / this._initEvent.distance)
            );
        },

        _processDbltab: function (event) {
            var state = this._view.getState();
            this._scale(
                event.targetPoint,
                state.scale + DBL_TAB_STEP
            );
        },

        _processWheel: function (event) {
            var state = this._view.getState(),
                scale = state.scale + WHEEL_SCALE_STEP * event.currentDelta;

            if (scale < MIN_WHEEL_SCALE) {
                scale = MIN_WHEEL_SCALE;
            }

            this._scale(event.targetPoint, scale);
        },

        _processOneTouch: function(event) {
            // TODO: allow only by touch (finger)

            var sign = this._initEvent.targetPoint.y - event.targetPoint.y > 0 ? 1 : -1;
            var state = this._view.getState();

            this._scale(this._initEvent.targetPoint, state.scale + sign * ONE_TOUCH_SCALE_STEP);
        },

        _scale: function (targetPoint, newScale) {
            var imageSize = this._view.getImageSize();
            var state = this._view.getState();
            // Позиция прикосновения на изображении на текущем уровне масштаба
            var originX = targetPoint.x - state.positionX;
            var originY = targetPoint.y - state.positionY;
            // Размер изображения на текущем уровне масштаба
            var currentImageWidth = imageSize.width * state.scale;
            var currentImageHeight = imageSize.height * state.scale;
            // Относительное положение прикосновения на изображении
            var mx = originX / currentImageWidth;
            var my = originY / currentImageHeight;
            // Размер изображения с учетом нового уровня масштаба
            var newImageWidth = imageSize.width * newScale;
            var newImageHeight = imageSize.height * newScale;
            // Рассчитываем новую позицию с учетом уровня масштаба
            // и относительного положения прикосновения
            state.positionX += originX - (newImageWidth * mx);
            state.positionY += originY - (newImageHeight * my);
            // Устанавливаем текущее положение мышки как "стержневое"
            state.pivotPointX = targetPoint.x;
            state.pivotPointY = targetPoint.y;
            // Устанавливаем масштаб и угол наклона
            state.scale = newScale;
            this._view.setState(state);
        }
    });

    provide(Controller);
});
