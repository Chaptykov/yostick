;(function($) {
    if (typeof window == 'undefined') {
        return;
    }

    var methods = {

        _getHandlers: function() {
            var y = this;

            y.listeners.push({
                eventType: 'scroll',
                selector: y.params.scroller,
                handler: function() {
                    var target = $(this);

                    y._onScroll(target);
                }
            });

            if (y.params.collapseOnClick) {
                y.listeners.push({
                    eventType: 'click',
                    selector: y.params.sectionHeader,
                    handler: function() {
                        var target = $(this);

                        y._onCollapse(target);
                    }
                });
            }
        },

        _setListeners: function() {
            var y = this;

            for (var i = 0, len = y.listeners.length; i < len; i++) {
                $(y.listeners[i].selector).on(
                    y.listeners[i].eventType,
                    y.listeners[i].handler
                );
            }
        },

        _getData: function(isInitial) {
            var y = this,
                data = [];

            y.elements.sections.each(function(i) {
                var section = $(this),
                    sectionHeaderWrapper = section.find(y.params.sectionHeaderWrapper),
                    sectionHeader = section.find(y.params.sectionHeader);

                data[i] = {
                    element:  sectionHeader,
                    position: sectionHeaderWrapper[0].offsetTop,
                    width:    sectionHeaderWrapper.outerWidth(),
                    height:   sectionHeaderWrapper.outerHeight()
                };

                if (isInitial) {
                    section.attr('data-yostick-section-id', i);
                }
            });

            return data;
        },

        _onScroll: function() {
            var y = this,
                position = y.elements.scroller.scrollTop();

            y._apply(y._getCurrentSection(position), position);
        },

        _getCurrentSection: function(position) {
            var y = this,
                current, next;

            for (var i = 0, len = y.data.length; i < len; i++) {
                current = y.data[i];
                next = y.data[i + 1];

                if (current.position < position && (next.position > position || i + 1 == len)) {
                    return i;
                }
            }
        },

        _apply: function(index, position) {
            var params = this.params,
                current = this.data[index],
                next = this.data[index + 1],
                styles, modifiers, top;

            for (var i = 0, len = this.data.length; i < len; i++) {
                modifiers = [];

                if (i == index) {
                    top = 0;
                    modifiers.push(params.sectionTitleIsSticked);

                    if (next.position < position + current.height) {
                        top = next.position - position - current.height;
                        modifiers.push(params.sectionTitleIsHustled);
                    }

                    styles = {
                        position: 'absolute',
                        top: 0,
                        width: this.data[i].width + 'px',
                        transform: 'translateY(' + top + 'px)'
                    };
                } else {
                    styles = {
                        position: 'relative',
                        top: 'auto',
                        transform: 'none'
                    };
                }

                this.data[i].element
                    .removeClass([
                        params.sectionTitleIsSticked,
                        params.sectionTitleIsHustled
                    ].join(' '))
                    .addClass(modifiers.join(' '))
                    .css(styles);
            }
        },

        _onCollapse: function(target) {
            var y = this,
                scroller = y.elements.scroller,
                position = scroller.scrollTop(),
                thisArticle = target.closest(y.params.section),
                id = +thisArticle.attr('data-yostick-section-id'),
                newPosition = position,
                current, next;

            if (thisArticle.hasClass(y.params.sectionIsCollapsed)) {
                thisArticle.removeClass(y.params.sectionIsCollapsed);
            } else {
                thisArticle.addClass(y.params.sectionIsCollapsed);
            }

            y.data = y._getData();

            current = y.data[id];
            next = y.data[id + 1];

            if (current.position < position) {
                newPosition = current.position;
            } else if (next && next.position < position + current.height) {
                newPosition = next.position - position - current.height;
            }

            scroller.scrollTop(newPosition);
            y._apply(y._getCurrentSection(newPosition), newPosition);
        }
    };

    Yostick.prototype = methods;

    function Yostick(root, options) {
        var instance = this instanceof Yostick ? this : $.extend({}, Yostick.prototype),
            y = instance;

        var params = $.extend({

            // Selectors
            scroller: '.yostick__scroller',
            section: '.yostick__section',
            sectionContent: '.yostick__list',
            sectionHeaderWrapper: '.yostick__section-header',
            sectionHeader: '.yostick__section-header-in',

            // Modifiers
            sectionIsCollapsed: '_collapsed',
            sectionTitleIsSticked: '_sticked',
            sectionTitleIsHustled: '_hustled',

            // Options
            collapseOnClick: true

        }, options);

        y.params = params;
        y.root = root;

        y.elements = {
            scroller: root.find(params.scroller),
            sections: root.find(params.section)
        };

        y.data = y._getData(true);
        y.listeners = [];

        y._getHandlers();
        y._setListeners();
    }

    window.yostick = Yostick;

    $.fn.yostick = function(method) {
        var args = arguments;

        if (methods[method]) {
            return this.each(function() {
                var instance = this && this.yostick;

                if (instance) {
                    methods[method].apply(instance, Array.prototype.slice.call(args, 1));
                }
            });
        } else if (typeof method == 'object' || !method) {
            return this.each(function() {
                this.yostick =  new Yostick($(this), args);
            });
        } else {
            $.error('Unknown method: ' +  method);
        }

    };

})(jQuery);