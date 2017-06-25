ym.modules.define('shri2017.imageViewer.View', [
    'shri2017.imageViewer.util.imageLoader',
    'view.css'
], function (provide, imageLoader) {
    var View = function (params) {
        this._state = {
            size: {
                width: 0,
                height: 0
            },
            position: {
                x: 0,
                y: 0
            }
        };

        this._setupDOM(params);
        this.setURL(params.url);
    };

    Object.assign(View.prototype, {
        setURL: function (url) {
            this._curURL = url;
            if (this._holderElem) {
                imageLoader(url).then(this._onImageLoaded, this);
            }
        },

        getElement: function () {
            return this._holderElem.parentElement;
        },

        getPosition: function () {
            return this._state.position;
        },

        setPosition: function (position) {
            this._state.position = Object.assign(this._state.position, position);
            this._setTransform(this._state.position);
        },

        destroy: function () {
            this._teardownDOM();
            this._state = {
                size: {
                    width: 0,
                    height: 0
                },
                position: {
                    x: 0,
                    y: 0
                }
            };
        },

        _onImageLoaded: function (data) {
            if (this._curURL === data.url) {
                var image = data.image;
                this._setImage(image);
                this.setPosition({
                    x: - (image.width - this._state.size.width) / 2,
                    y: - (image.height - this._state.size.height) / 2
                });
            }
        },

        _setupDOM: function (params) {
            this._state.size.width = params.size.width;
            this._state.size.height = params.size.height;

            var containerElem = document.createElement('image-viewer');
            this._holderElem = document.createElement('image-viewer-inner');

            containerElem.className = 'image-viewer__view';
            this._holderElem.className = 'image-viewer__inner';

            containerElem.style.width = params.size.width + 'px';
            containerElem.style.height = params.size.height + 'px';

            containerElem.appendChild(this._holderElem);
            params.elem.appendChild(containerElem);
        },

        _teardownDOM: function () {
            var containerElem = this._holderElem.parentElement;
            containerElem.parentElement.removeChild(containerElem);
            this._holderElem = null;
            this._curURL = null;
        },

        _setImage: function (image) {
            this._holderElem.style.width = image.width + 'px';
            this._holderElem.style.height = image.height + 'px';
            this._holderElem.style.backgroundImage = 'url(\'' + image.src + '\')';
        },

        _setTransform: function (position) {
            this._holderElem.style.transform = [
                'translate3d(',
                position.x, 'px,',
                position.y, 'px,',
                '0)'
            ].join('');
        }
    });

    provide(View);
});
