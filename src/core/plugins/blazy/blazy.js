!function (t, e) {
    "function" == typeof define && define.amd ? define(e) : "object" == typeof exports ? module.exports = e() : t.Blazy = e()
}(this, function () {
    function n(t) {
        var e = t._util;
        e.elements = function (t) {
            for (var e = [], o = (t = t.root.querySelectorAll(t.selector)).length; o--; e.unshift(t[o]))
                ;
            return e
        }(t.options),
            e.count = e.elements.length,
            e.destroyed && (e.destroyed = !1,
                t.options.container && h(t.options.container, function (t) {
                    v(t, "scroll", e.validateT)
                }),
                v(window, "resize", e.saveViewportOffsetT),
                v(window, "resize", e.validateT),
                v(window, "scroll", e.validateT)),
            s(t)
    }
    function s(t) {
        for (var e = t._util, o = 0; o < e.count; o++) {
            var n, s = e.elements[o], i = s;
            n = t.options;
            var r = i.getBoundingClientRect();
            n.container && y && (i = i.closest(n.containerClass)) ? n = !!a(i = i.getBoundingClientRect(), w) && a(r, {
                top: i.top - n.offset,
                right: i.right + n.offset,
                bottom: i.bottom + n.offset,
                left: i.left - n.offset
            }) : n = a(r, w),
                (n || p(s, t.options.successClass)) && (t.load(s),
                    e.elements.splice(o, 1),
                    e.count-- ,
                    o--)
        }
        0 === e.count && t.destroy()
    }
    function a(t, e) {
        return t.right >= e.left && t.bottom >= e.top && t.left <= e.right && t.top <= e.bottom
    }
    function r(t, e, n) {
        if (!p(t, n.successClass) && (e || n.loadInvisible || 0 < t.offsetWidth && 0 < t.offsetHeight))
            if (e = t.getAttribute(g) || t.getAttribute(n.src)) {
                var o = (e = e.split(n.separator))[b && 1 < e.length ? 1 : 0]
                    , s = t.getAttribute(n.srcset)
                    , i = "img" === t.nodeName.toLowerCase()
                    , r = (e = t.parentNode) && "picture" === e.nodeName.toLowerCase();
                if (i || void 0 === t.src) {
                    var a = new Image
                        , c = function () {
                            n.error && n.error(t, "invalid"),
                                d(t, n.errorClass),
                                m(a, "error", c),
                                m(a, "load", l)
                        }
                        , l = function () {
                            i ? r || f(t, o, s) : t.style.backgroundImage = 'url("' + o + '")',
                                u(t, n),
                                m(a, "load", l),
                                m(a, "error", c)
                        };
                    r && (a = t,
                        h(e.getElementsByTagName("source"), function (t) {
                            var e = n.srcset
                                , o = t.getAttribute(e);
                            o && (t.setAttribute("srcset", o),
                                t.removeAttribute(e))
                        })),
                        v(a, "error", c),
                        v(a, "load", l),
                        f(a, o, s)
                } else
                    t.src = o,
                        u(t, n)
            } else
                "video" === t.nodeName.toLowerCase() ? (h(t.getElementsByTagName("source"), function (t) {
                    var e = n.src
                        , o = t.getAttribute(e);
                    o && (t.setAttribute("src", o),
                        t.removeAttribute(e))
                }),
                    t.load(),
                    u(t, n)) : (n.error && n.error(t, "missing"),
                        d(t, n.errorClass))
    }
    function u(e, t) {
        d(e, t.successClass),
            t.success && t.success(e),
            e.removeAttribute(t.src),
            e.removeAttribute(t.srcset),
            h(t.breakpoints, function (t) {
                e.removeAttribute(t.src)
            })
    }
    function f(t, e, o) {
        o && t.setAttribute("srcset", o),
            t.src = e
    }
    function p(t, e) {
        return -1 !== (" " + t.className + " ").indexOf(" " + e + " ")
    }
    function d(t, e) {
        p(t, e) || (t.className += " " + e)
    }
    function c(t) {
        w.bottom = (window.innerHeight || document.documentElement.clientHeight) + t,
            w.right = (window.innerWidth || document.documentElement.clientWidth) + t
    }
    function v(t, e, o) {
        t.attachEvent ? t.attachEvent && t.attachEvent("on" + e, o) : t.addEventListener(e, o, {
            capture: !1,
            passive: !0
        })
    }
    function m(t, e, o) {
        t.detachEvent ? t.detachEvent && t.detachEvent("on" + e, o) : t.removeEventListener(e, o, {
            capture: !1,
            passive: !0
        })
    }
    function h(t, e) {
        if (t && e)
            for (var o = t.length, n = 0; n < o && !1 !== e(t[n], n); n++)
                ;
    }
    function l(e, o, n) {
        var s = 0;
        return function () {
            var t = +new Date;
            t - s < o || (s = t,
                e.apply(n, arguments))
        }
    }
    var g, w, b, y;
    return function (t) {
        if (!document.querySelectorAll) {
            var i = document.createStyleSheet();
            document.querySelectorAll = function (t, e, o, n, s) {
                for (s = document.all,
                    e = [],
                    o = (t = t.replace(/\[for\b/gi, "[htmlFor").split(",")).length; o--;) {
                    for (i.addRule(t[o], "k:v"),
                        n = s.length; n--;)
                        s[n].currentStyle.k && e.push(s[n]);
                    i.removeRule(0)
                }
                return e
            }
        }
        var e = this
            , o = e._util = {};
        o.elements = [],
            o.destroyed = !0,
            e.options = t || {},
            e.options.error = e.options.error || !1,
            e.options.offset = e.options.offset || 100,
            e.options.root = e.options.root || document,
            e.options.success = e.options.success || !1,
            e.options.selector = e.options.selector || ".b-lazy",
            e.options.separator = e.options.separator || "|",
            e.options.containerClass = e.options.container,
            e.options.container = !!e.options.containerClass && document.querySelectorAll(e.options.containerClass),
            e.options.errorClass = e.options.errorClass || "b-error",
            e.options.breakpoints = e.options.breakpoints || !1,
            e.options.loadInvisible = e.options.loadInvisible || !1,
            e.options.successClass = e.options.successClass || "b-loaded",
            e.options.validateDelay = e.options.validateDelay || 25,
            e.options.saveViewportOffsetDelay = e.options.saveViewportOffsetDelay || 50,
            e.options.srcset = e.options.srcset || "data-srcset",
            e.options.src = g = e.options.src || "data-src",
            y = Element.prototype.closest,
            b = 1 < window.devicePixelRatio,
            (w = {}).top = 0 - e.options.offset,
            w.left = 0 - e.options.offset,
            e.revalidate = function () {
                n(e)
            }
            ,
            e.load = function (t, e) {
                var o = this.options;
                void 0 === t.length ? r(t, e, o) : h(t, function (t) {
                    r(t, e, o)
                })
            }
            ,
            e.destroy = function () {
                var e = this._util;
                this.options.container && h(this.options.container, function (t) {
                    m(t, "scroll", e.validateT)
                }),
                    m(window, "scroll", e.validateT),
                    m(window, "resize", e.validateT),
                    m(window, "resize", e.saveViewportOffsetT),
                    e.count = 0,
                    e.elements.length = 0,
                    e.destroyed = !0
            }
            ,
            o.validateT = l(function () {
                s(e)
            }, e.options.validateDelay, e),
            o.saveViewportOffsetT = l(function () {
                c(e.options.offset)
            }, e.options.saveViewportOffsetDelay, e),
            c(e.options.offset),
            h(e.options.breakpoints, function (t) {
                if (t.width >= window.screen.width)
                    return g = t.src,
                        !1
            }),
            setTimeout(function () {
                n(e)
            })
    }
});
var bLazy = new Blazy;