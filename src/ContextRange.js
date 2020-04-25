export class ContextRange
{
  /**
   * @access public
   * @param {Range} origin
   * @param {HTMLElement} context
   * @constructor
   */
  constructor(origin, context)
  {
    /**
     * @private
     * @type {Range}
     */
    this.origin = origin;

    /**
     * @private
     * @type {HTMLElement}
     */
    this.context = context;

    /**
     * @private
     * @type {HTMLElement}
     */
    this.element = null;

    /**
     * @private
     * @type {boolean}
     */
    this.createElement = false;
  }

  /**
   * @access public
   * @return {String}
   */
  html()
  {
    if (this.element) {
      return this.element.outerHTML;
    } else {
      const tmp = document.createElement('div');
      tmp.appendChild(this.origin.cloneContents());
      return tmp.innerHTML;
    }
  }

  /**
   * @access public
   * @return {HTMLElement}
   */
  getContext()
  {
    return this.context;
  }

  /**
   * Node lekérdezése a kijelölés alapján. Bekezdésben a teljes szöveg kivan jelölve akor a Node a bekezdés lesz,
   * ha nem akkor létrejön a DOM egy span és azt kapjuk vissza,
   * ha pedig kép akkor azt mivel akkor üres a kijelölés és a $contextus a kép
   * TODO Kép esetén a perent a Text element
   *
   * @access public
   * @return {HTMLElement}
   */
  getTextElement()
  {
    if (!this.element) {
      const contextLength = this.context.textContent.length;
      const content = this.origin.cloneContents();

      if (content.textContent.length === 0 || contextLength === content.textContent.length) {
        this.element = this.context;

        this.createElement = false;
      } else {
        this.element = document.createElement('span');
        this.element.appendChild(content);

        this.createElement = true;
      }
    }

    return this.element;
  }

  /**
   * @access public
   * @return {HTMLElement}
   */
  createTextElement()
  {
    if(this.createElement) {
      this.origin.deleteContents();
      this.origin.insertNode(this.element);
    }
  }
}
