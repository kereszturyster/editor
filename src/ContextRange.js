export class ContextRange
{
  /**
   * @access public
   * @param {Range} origin
   * @constructor
   */
  constructor(origin)
  {
    /**
     * @private
     * @type {Range}
     */
    this.origin = origin;

    /**
     * @private
     * @type {Array<HTMLElement>}
     */
    this.elements = null;

    /**
     * @private
     * @type {boolean}
     */
    this.createElements = false;
  }

  /**
   * @access public
   * @return {HTMLElement}
   */
  getContext()
  {
    // kijelöléshez tartozó elem meghatározása
    let context = this.origin.commonAncestorContainer;
    // ha szöveg, akkor veszük a szülő elemet
    if (context.nodeType === Node.TEXT_NODE) {
      context = this.origin.commonAncestorContainer.parentNode;
    }
    return context;
  }

  /**
   * Node lekérdezése a kijelölés alapján. Bekezdésben a teljes szöveg kivan jelölve akor a Node a bekezdés lesz,
   * ha nem akkor létrejön a DOM egy span és azt kapjuk vissza,
   * ha pedig kép akkor azt mivel akkor üres a kijelölés és a $contextus a kép
   *
   * @access public
   * @return {Array<HTMLElement>}
   */
  getTextElements()
  {
    if (!this.elements) {
      const context = this.getContext();
      const contextLength = context.textContent.length;
      const content = this.origin.cloneContents();

      this.elements = [];
      if (content.textContent.length === 0 || contextLength === content.textContent.length) {
        this.createElements = false;
        this.elements.push(context);
      } else {
        this.createElements = true;

        const content = this.origin.cloneContents();
        console.log(content.childNodes);
        const element = document.createElement('span');
        element.appendChild(content);

        this.elements.push(element);
      }
    }

    return this.elements;
  }

  /**
   * @access public
   * @return {HTMLElement}
   */
  createTextElements()
  {
    if(this.createElements) {
      this.origin.deleteContents();

      const elements = this.getTextElements();
      for (let i = 0; i < elements.length; i++) {
        this.origin.insertNode(elements[i]);
      }
    }
  }
}
