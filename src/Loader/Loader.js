import $ from 'jquery';
import {Response} from "./Response";
import {Request} from "./Request";

/**
 * Három féle kérés külömböztetünk meg
 *  1 ) Van egy űralap és az elküldve vissza kapunk egy nézetet
 *  2 ) Egy gomb nyomására történik valami amit nem követ nézet betöltés (csak állapot változás) pl. követés gomb megnyomása
 *  3 ) Egyszerű oldal lekérés, oldalak közti navigáció pl fő oldalről elmegyünk a profile oldalra
 *
 *  .loader .lader-append .loader-massonry .loader-action
 *
 * @example
 * <form action="<url>"
 *      data-method="<method=(GET|POST|DELETE|PUT)>"
 *      data-token="<csrf-token>"
 *      data-type="<type=(HTML|JSON)>"
 *      data-callback="<function=object.function>"
 *
 * @since 0.1
 * @access publicx
 * @param {jQuery} $box
 * @constructor
 */
export class Loader {
    /**
     * Feldolgozás alatt
     *
     * @access public
     * @returns {boolean}
     */
    isLoading() {
        return this.loading;
    }

    constructor($box) {
        /**
         * Fő doboz
         *
         * @access private
         * @type {jQuery}
         */
        this.$box = $box;

        /**
         * Tartalom doboz meghatározása
         *
         * @access private
         * @type {jQuery}
         */
        this.$content = $box.children('.loader-content').first();
        if (this.$content.length === 0) {
            this.$content = $box.find('.loader-content').first();
        }

        /**
         * Töltő ikon meghatározása, megkeresése
         *
         * @access private
         * @type {jQuery}
         */
        this.$loading = this.$content.siblings('.loader-loading').first().hide();

        /**
         * Ajax kérés feldolgozás alatt
         *
         * @access private
         * @type {boolean}
         */
        this.loading = false;

        /**
         * Gomb vagy a form elküldése előtt futó függvény
         *
         * @access public
         * @type {function}
         * @return boolean
         */
        this.eventCallback = null;

        /**
         * Kérés lefutása után futó függvény
         *
         * @access public
         * @type {function}
         */
        this.callback = null;
        this.init($box);
    }

    /**
     * Töltő icon
     *
     * @access public
     * @returns {jQuery}
     */
    getLoading() {
        return this.$loading;
    }

    /**
     * Doboz amelynek a tartalma cserélődni fog
     *
     * @access public
     * @returns {jQuery}
     */
    getContent() {
        return this.$content;
    }

    /**
     * Tartalom megjelenítését definiálhatjuk itt
     *
     * @access public
     * @param {function} callback
     * @return void
     */
    showContent(callback) {
        if ($.isFunction(callback)) {
            callback();
        }
    }

    /**
     * Tartalom eltünését definiálhatjuk itt
     *
     * @access public
     * @param {function} callback
     * @return void
     */
    hideContent(callback) {
        if ($.isFunction(callback)) {
            callback();
        }
    }

    /**
     * Töltő ikon megjelenítése
     *
     * @access public
     * @param {function} callback
     * @return void
     */
    showLoading(callback) {
        this.$loading.stop().fadeIn('fast', callback);
    }

    /**
     * Töltő ikon elrejtése
     *
     * @access public
     * @param {function} callback
     * @return void
     */
    hideLoading(callback) {
        this.$loading.stop().fadeOut('fast', callback);
    }

    /**
     * A Loader azonósítóját a befoglaló doboz id szármasztatjuk
     *
     * @access public
     * @return {string}
     */
    getId() {
        return this.$box.data('id') || this.$box.attr('id');
    }

    /**
     * Ha sikeresen lefutott a kérés akkor a string-ként kapot függvény meg kereése és lefuttatása
     * data-callback="action.callback"
     *
     * @access public
     * @param {Request} request
     * @param {Response} response
     * @return void
     */
    executeCallback(request, response) {
        let fn = null;
        let callback = request.callback;
        if (typeof callback === 'string') {
            let functions = callback.split('.');
            if (functions.length > 0) {
                fn = window[functions[0]];
                for (let i = 1; i < functions.length; i++) {
                    fn = fn[functions[i]];
                }
            }
        } else {
            fn = callback;
        }
        if ($.isFunction(fn)) {
            fn(response, request);
        }
    }

    /**
     * JSON válasz feldolgozása
     *
     * @access public
     * @param {Response} response
     * @param {XMLHttpRequest} jqXHR
     * @return void
     */
    parseResponseJSON(response, jqXHR) {
        console.log(response.data, jqXHR);
        // Fragmentek cserélése
        // if(!!data.fragments)
        // {
        //     for(var name in data.fragments)
        //     {
        //         var $fragment = $(data.fragments[name]);
        //         var $target = $('.fragment-' + name);
        //
        //         $target.replaceWith($fragment);
        //     }
        // }
    }

    /**
     * Nézet feldolgozása
     * Fragmentek feldolgozása
     * Data adathalmaz lekérdezése a fejlécből
     * Script-ek futtatása
     *
     * @access public
     * @param {Response} response
     * @param {XMLHttpRequest} jqXHR
     * @param {function} initContent
     * @return void
     */
    parseResponseView(response, jqXHR, initContent) {
        /**
         * Nézet objektumok visszaadása
         * text node nélkül és fragmentek nélkül
         */
        let $view = $(response.data).filter(function () {
            return this.nodeType !== Node.TEXT_NODE;
        });
        response.$view = $view.not('.fragment').not('script');

        /**
         * Fragmentek feldolgozása
         */
        $view.filter('.fragment').each(function (index, element) {
            let $fragment = $(element);
            let $target = $('.fragment-' + $fragment.data('fragment'));

            let method = $target.data('method');
            if ($.isFunction($fragment[method])) {
                $fragment[method]($target);
            } else {
                $target.replaceWith($fragment);
            }
        });

        /**
         * További adatok kivétele a headerból
         */
        response.data = JSON.parse(jqXHR.getResponseHeader('Data'));

        /**
         * Adatok ráilesztése a DOM-ra
         */
        if ($.isFunction(initContent)) {
            initContent(response);
        }
        this.init(this.$content);
        this.initAction(this.$content);

        /**
         * Scriptek futtatása
         */
        this.$content.append($view.filter('script'));
    }

    /**
     * @access public
     */
    unauthorized() {
        // Popup.open(this.newRequest('/login'));
    }

    /**
     * Tartalom betöltése
     *
     * @param {Request} request
     * @param {function|undefined} callback
     * @param {function|undefined} afterCallback
     * @param {function|undefined} beforeCallback
     * @return void
     */
    load(request, callback, afterCallback, beforeCallback) {
        // adatok meghatározása
        let data = request.data || [];
        if (request.token) {
            data.push({name: '_token', value: request.token});
        }

        /**
         * Ha nincs elküldve kérés
         * Ha érvényes cím van megadva
         * Ha küldő gomb, nincs megadva vagy nem 'disabled' státuszban van
         */
        if (!this.loading && !!request.url && request.url !== '' && request.url !== '#' && (!!request.$send || !request.$send.attr('disabled'))) {
            this.loading = true;
            if ($.isFunction(beforeCallback)) {
                beforeCallback(request);
            }

            // url előkészítése encodeURIComponent
            let url = request.url;
            url += (url.indexOf('?') === -1) ? '?' : '&';
            url += 'action=' + this.getId();
            url += (request.query === '') ? '' : '&' + request.query;

            // kérés elküldése
            $.ajax({
                dataType: request.type,
                type: request.method,
                data: data,
                url: url,
                success: (data, status, jqXHR) => {
                    // válasz fogadása
                    let response = new Response();
                    response.data = data;
                    response.status = 200;

                    // callback meghhívása
                    if ($.isFunction(callback)) {
                        callback(response, request, jqXHR);
                    }
                    this.executeCallback(request, response);
                    if ($.isFunction(afterCallback)) {
                        afterCallback(response, request);
                    }
                    this.loading = false;
                },
                error: (jqXHR) => {
                    let response = new Response();
                    response.status = jqXHR.status;
                    response.data = jqXHR.responseText;
                    if (request.type === 'JSON') {
                        response.data = JSON.parse(response.data);
                    }
                    if (response.status === 401) {
                        this.unauthorized();
                    } else {
                        // callback meghhívása
                        if ($.isFunction(callback)) {
                            callback(response, request, jqXHR);
                        }
                        this.executeCallback(request, response);
                        if ($.isFunction(afterCallback)) {
                            afterCallback(response, request);
                        }
                    }
                    this.loading = false;
                },
            });
        }
    }

    /**
     * @access public
     * @param {Request} request
     * @return void
     */
    loadAction(request) {
        this.load(request, null,
            () => {
                this.hideLoading();
            },
            () => {
                this.showLoading();
            }
        );
    }

    /**
     * Nézet vissza adása
     *
     * @access public
     * @param {Request} request
     * @param {function} callback
     * @return void
     */
    loadView(request, callback) {
        this.load(request, (response, request, jqXHR) => {
                this.parseResponseView(response, jqXHR, (response) => {
                    if (response.$view.length > 0) {
                        this.$content.html(response.$view);
                    }
                });
                if ($.isFunction(callback)) {
                    callback(response, request);
                }
            },
            () => {
                this.hideLoading(() => {
                    this.showContent();
                });
            },
            () => {
                this.showLoading(() => {
                    this.hideContent();
                });
            });
    }

    /**
     * @access public
     * @param {Request} request
     * @param {function} callback
     * @return void
     */
    loadJSON(request, callback) {
        this.load(request, (response, request, jqXHR) => {
                this.parseResponseJSON(response, jqXHR);
                if ($.isFunction(callback)) {
                    callback(response, request);
                }
            },
            () => {
                this.hideLoading(() => {
                    this.showContent();
                });
            },
            () => {
                this.showLoading(() => {
                    this.hideContent();
                });
            });
    }

    /**
     * Töltési mód kiválasztása
     * Milyen módon fog a tartalom cserélődni betölteni
     *
     * @access public
     * @param {Request} request
     * @return void
     */
    loadRequest(request) {
        if (this.$box.hasClass('loader-view')) {
            request.type = 'HTML';
        }
        if (request.type === 'HTML') {
            this.loadView(request);
        } else {
            this.loadJSON(request);
        }
    }

    /**
     * Elemek betöltése felfelé
     *
     * @access public
     * @param {Request} request
     * @param {function} afterCallback
     * @param {function} beforeCallback
     * @return void
     */
    loadPrepend(request, afterCallback, beforeCallback) {
        this.showLoading(() => {
            this.load(request, (response, request, jqXHR) => {
                    this.parseResponseView(response, jqXHR, (response) => {
                        for (let i = response.$view.length; i >= 0; --i) {
                            this.$content.prepend(response.$view.get(i));
                        }
                    });
                },
                (response, request) => {
                    if ($.isFunction(afterCallback)) {
                        afterCallback(response, request);
                    }
                    this.hideLoading();
                }, beforeCallback);
        });
    }

    /**
     * Elemek betöltése lefelé
     *
     * @access public
     * @param {Request} request
     * @param {function} afterCallback
     * @param {function} beforeCallback
     * @return void
     */
    loadAppend(request, afterCallback, beforeCallback) {
        this.showLoading(() => {
            this.load(request, (response, request, jqXHR) => {
                    this.parseResponseView(response, jqXHR, (response) => {
                        this.$content.append(response.$view);
                    });
                },
                (response, request) => {
                    if ($.isFunction(afterCallback)) {
                        afterCallback(response, request);
                    }
                    this.hideLoading();
                }, beforeCallback);
        });
    }

    /**
     * Elemek betöltése lefelé
     *
     * @access public
     * @param {String} url
     * @return Request
     */
    newRequest(url) {
        let request = new Request();

        request.url = url;
        request.type = (this.$box.hasClass('loader-view')) ? 'HTML' : request.type;

        return request;
    }

    /**
     * @access public
     * @param {jQuery} $element
     * @return Request
     */
    parseRequest($element) {
        let request = new Request();

        request.url = $element.attr('action') || $element.attr('href') || $element.data('href') || request.url;
        request.method = $element.attr('method') || $element.data('method') || request.method;
        request.callback = $element.data('callback') || this.callback;
        request.query = $element.data('query') || request.query;
        request.type = $element.data('type') || ((this.$box.hasClass('loader-view')) ? 'HTML' : request.type);
        request.$send = $element || request.$send;

        return request;
    }


    /**
     * @access public
     * @param {jQuery} $element
     * @returns void
     */
    initAction($element) {
        $element.find('button.loader-action').add('a.loader-action').on('click', (event) => {
            const $target = $(event.currentTarget);

            let request = this.parseRequest($target);
            request.data.push({name: 'value', value: request.$send.data('value')});
            this.loadAction(request);

            event.preventDefault();
            return false;
        });
    }

    /**
     * @access public
     * @param {jQuery} $element
     * @returns void
     */
    init($element) {
        $element.find('form.loader-' + this.getId() + '-event').find('button[type="submit"]').click((event) => {
            const $target = $(event.currentTarget);
            let $form = $target.parents('form.loader-' + this.getId() + '-event');
            $form.children('[name="_send"]').val($target.attr('name'));
        });
        $element.find('form.loader-' + this.getId() + '-event').submit((event) => {
            let request = this.parseRequest($(event.currentTarget));
            request.data = request.$send.serializeArray();

            if ($.isFunction(this.eventCallback)) {
                this.eventCallback(request).then(() => {
                    this.loadRequest(request);
                });
            } else {
                this.loadRequest(request);
            }

            event.preventDefault();
            return false;
        });
        $element.find('button.loader-' + this.getId() + '-event').add('a.loader-' + this.getId() + '-event').on('click', (event) => {
            let request = this.parseRequest($(event.currentTarget));
            request.data.push({name: 'value', value: request.$send.data('value')});

            if ($.isFunction(this.eventCallback)) {
                this.eventCallback(request).then(() => {
                    this.loadRequest(request);
                });
            } else {
                this.loadRequest(request);
            }

            event.preventDefault();
            return false;
        });
    }
}
