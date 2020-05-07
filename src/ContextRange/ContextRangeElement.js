export class ContextRangeElement {

    /**
     * @access public
     * @param {ChildNode} element
     * @param {boolean} isCreateElement
     * @param {Range} range
     * @constructor
     */
    constructor(element, range, isCreateElement)
    {
        /**
         * @private
         * @type {Range}
         */
        this.range = range;

        /**
         * @private
         * @type {HTMLElement}
         */
        this.element = element;

        /**
         * @private
         * @type {boolean}
         */
        this.isCreateElement = !!isCreateElement;
    }

    /**
     * @access public
     * @return {HTMLElement}
     */
    getElement()
    {
        return this.element;
    }

    /**
     * @access public
     * @return {void}
     */
    createElement()
    {
        if(this.isCreateElement) {
            this.range.deleteContents();
            this.range.insertNode(this.element);
        }
    }
}