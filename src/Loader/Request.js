/**
 * Loadernek áthadható kérés objektum
 * Loader::load() függvénynek átatható objektum,
 * ezzel paraméterezhetjük a kéréseket
 *
 * @access public
 * @constructor
 */
export class Request {
    constructor() {
        /**
         * Kérés elérése
         *
         * @access public
         * @type {string}
         */
        this.url = '';

        /**
         * Kérés paraméterek temp ez nem változik ez az origin
         *
         * @access public
         * @type {string}
         */
        this.tempQuery = '';

        /**
         * Kérés paraméterek
         *
         * @access public
         * @type {string}
         */
        this.query = '';

        /**
         * Kérés módja
         *
         * @access public
         * @type {string}
         */
        this.method = 'GET';

        /**
         * Kérés típusa, formátuma
         *
         * @access puublic
         * @type {string}
         */
        this.type = 'JSON';

        /**
         * Kéréshez tartozó adatok
         *
         * @access public
         * @type {Array}
         */
        this.data = [];

        /**
         * CSRF Token
         *
         * @access public
         * @type {string}
         */
        this.token = null;

        /**
         * Sikeres kérés és sikertelen kérés esetén lefutantandó függvény
         *
         * @access public
         * @type {function|string}
         */
        this.callback = null;

        /**
         * Küldő gomb, form
         *
         * @access public
         * @type {jQuery}
         */
        this.$send = null;
    }

    /**
     * Query string meghatározása: name1=value1&name2=value2
     * Eltárolodik az eredeti kérés paraméter amelyet vissza tudunk állítani ha megmódosításra került
     *
     * @access public
     * @param {string} query
     */
    setQuery(query) {
        this.tempQuery = query;
        this.query = query;
    }
}
