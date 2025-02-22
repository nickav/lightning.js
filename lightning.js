(function() {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
        return;
    }

    if (window.Lightning) return;

    const defaultConfig = {
        linkSelector: 'a:not([data-lightning="false"])',
        contentSelector: 'body',
        prefetch: true,
        prefetchDelay: 20,
        cache: true,
        cacheTimeout: 0,
        scrollToTop: true,
        restoreClassName: true,
        debug: false,
    };

    function Lightning(config) {
        const options = Object.assign({}, defaultConfig, config || {});

        const instance = {
            generation: 0,
            pageCache: {},
            debug: false,
        };

        Lightning.instance = instance;
        Lightning.VERSION = '1.0.0';

        const debug = (...args) => {
            if (options.debug || instance.debug) console.log(...args);
        };

        const getElement = (root) => {
            return root.querySelector(options.contentSelector);
        }

        const getState = () => {
            const el = getElement(document);
            const result = {
                html: el ? el.innerHTML : null,
                title: document.title,
                bodyClassName: document.body.className,
                className: el ? el.className : null,
            };
            return result;
        };

        const setState = (state) => {
            document.title = state.title;
            if (options.restoreClassName) {
                document.body.className = state.bodyClassName;
            }

            const el = getElement(document);
            if (el) {
                el.innerHTML = state.html;
                if (options.restoreClassName) {
                    el.className = state.className;
                }
            }

            LightningLinks();
        };

        const getPage = (path) => {
            return fetch(path).then((resp) => resp.text());
        };

        const getPageCached = (path) => {
            if (!options.cache)
            {
                return getPage(path);
            }

            if (instance.pageCache[path]) {
                const cache = instance.pageCache[path];
                if (cache.promise) {
                    return cache.promise;
                }

                if (cache.data) {
                    if (options.cacheTimeout > 0)
                    {
                        const now = window.performance.now()/1000.0;
                        if (now - cache.time > options.cacheTimeout) {
                            cache.data = null;
                        }
                    }

                    if (cache.data) {
                        return Promise.resolve(cache.data);
                    }
                }
            }
                            
            const promise = getPage(path);

            instance.pageCache[path] = instance.pageCache[path] || {};
            instance.pageCache[path].promise = promise;

            return promise.then((text) => {
                const cache = instance.pageCache[path];
                cache.data = text;
                cache.time = window.performance.now()/1000.0;
                cache.promise = null;
                return text;
            });
        }

        function LightningLinks() {
            Array.from(document.querySelectorAll(options.linkSelector)).forEach((link) => {
                const origin = window.location.origin;
                const isExternal = !link.href.startsWith(origin);

                if (isExternal) return;
                if (link.target == "_blank") return;

                if (link.lightning) return;
                link.lightning = true;

                const path = link.href.slice(origin.length);

                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    debug("⚡");

                    const generation = ++instance.generation;

                    getPageCached(path).then((text) => {
                        if (instance.generation !== generation) return;

                        let html = null;
                        try {
                            const dom = new DOMParser();
                            html = dom.parseFromString(text, 'text/html');         
                        } catch (err) {
                            console.error(err);
                            window.location.href = link.href;
                            return;
                        }

                        if (html)
                        {
                            const el = getElement(html);
                            if (el)
                            {
                                const body = html.body;
                                const title = html.title;

                                setState({
                                    title: html.title,
                                    html: el.innerHTML,
                                    className: el.className,
                                    bodyClassName: body.className,
                                });

                                if (options.scrollToTop)
                                {
                                    window.scrollTo(0, 0);
                                }

                                const state = getState();
                                debug("push state", state);
                                window.history.pushState(state, title, path);
                            }
                            else
                            {
                                debug("Missing element from response!", path);
                            }
                        }
                        else
                        {
                            debug("Failed to parse html from string:", text);
                        }
                    }).catch((err) => {
                        console.error(err);
                        window.location.href = link.href;
                    });

                    return false;
                });

                link.addEventListener('mouseenter', (e) => {
                    if (options.prefetch) {
                        link.lightningPrefetch = setTimeout(() => {
                            link.lightningPrefetch = null;

                            getPageCached(path);

                        }, options.prefetchDelay);
                    }
                });

                link.addEventListener('mouseleave', (e) => {
                    if (link.lightningPrefetch) {
                        clearTimeout(link.lightningPrefetch);
                        link.lightningPrefetch = null;
                    }
                });
            });
        }

        window.addEventListener('popstate', (event) => {
            const state = event.state;
            if (state) {
                debug("pop state", state);
                setState(state);
            }
        });

        const init = () => {
            const initialState = getState();
            window.history.pushState(initialState, initialState.title, '');

            debug("⚡Lightning Links⚡- v" + Lightning.VERSION);
            debug("init", { initialState, element: getElement(document) });

            if (options.cache)
            {
                const path = window.location.pathname;
                instance.pageCache[path] = {
                    data: document.documentElement.innerHTML,
                    promise: null,
                    time: 0
                };
            }

            LightningLinks();
        };

        if (document.readyState === 'complete') {
            init();
        } else {
            window.addEventListener('load', init);
        }
    };

    window.Lightning = Lightning;

    if (document.currentScript && document.currentScript.src.indexOf("run=1") >= 0) {
        const options = window["LIGHTNING_OPTIONS"] || {};
        Lightning(options);
    }
})();
