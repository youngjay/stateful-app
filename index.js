var ko = require('knockout');
var mixin = require('mixin-class');
var slice = [].slice;

var WRAPPER_VIEW = '<!-- ko template: { if: visible, foreach: components, name: function(component) { return component.__view } } --><!-- /ko -->';

var pathIsMatch = function(currentPath, modelPaths) {
    return !modelPaths.length || modelPaths.some(function(modelPath) {
        return suffixSlash(currentPath || '').indexOf(suffixSlash(modelPath)) === 0;
    });
};

// force suffix slash
var suffixSlash = function(s) {
    if (s.charAt(s.length - 1) !== '/') {
        return s + '/';
    }
    return s;
};

var App = mixin(
        function(hashState, container) {
            this.hashState = hashState;
            if (!container) {
                container = document.body;
            }

            this.components = ko.observableArray();
            this.root = this._getComponentWrapper(this.components);

            container.innerHTML = this.root.__view;
            ko.applyBindings(this.root, container);        
        },
        {

            add: function(paths, components, handleStateChange) {
                var wrapper = this._getComponentWrapper(components);

                if (!paths) {
                    paths = [];
                }
                else {
                    if (typeof paths === 'string') {
                        paths = [paths];
                    }
                }

                var visible = wrapper.visible;
                var hashState = this.hashState;
                ko.computed(function() {
                    var data = hashState.data();
                    var path = data.path;
                    var query = data.query;

                    if (pathIsMatch(path, paths)) {
                        visible(true);
                        if (handleStateChange) {
                            ko.dependencyDetection.ignore(function() {
                                handleStateChange(query, path);
                            });
                        }
                    }
                    else {
                        visible(false);
                    }

                }, this);
                
                this.components.push(wrapper);
            },

            _getComponentWrapper: function(components) {
                if (!Array.isArray(ko.unwrap(components))) {
                    components = [components];
                }

                return {
                    visible: ko.observable(true),
                    components: components,
                    __view: WRAPPER_VIEW
                }
            }
        }
    )

module.exports = App;