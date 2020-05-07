/**
 * Kérés követően ezt az objektumot kapjuk a válasz esetén
 *
 * @access public
 * @constructor
 */
export class Response {
    constructor() {
        /**
         * Adathallmaz a válasz után, lehet nézet vagy JSON object
         * Ha header-ben kapunk egy 'Data' kulcsú értéket akkor az tzal töltödik be a kérés feldolgozása után
         * A nézet egy jQuery objektumban lesz elérhető: $view
         *
         * @access public
         * @type {string|object}
         */
        this.data = null;

        /**
         * Nézet amelyet vissza kaptunk
         *
         * @access public
         * @type {jQuery}
         */
        this.$view = null;

        /**
         * Válasz státusz kódja
         *
         * @access public
         * @type {Number}
         */
        this.status = null;
    }
}
