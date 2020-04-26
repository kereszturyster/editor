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
    this.elements = [];

    /**
     * @private
     * @type {boolean}
     */
    this.createElements = false;

    /**
     * Elemek létrehozása
     */
    this.initElements();
  }

  initElements() {
    const context = this.getContext();
    const contextLength = context.textContent.length;
    const content = this.origin.cloneContents();

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
   * Kijelölt elemek
   *
   * @access public
   * @return {Array<HTMLElement>}
   */
  getElements()
  {
    return this.elements;
  }

  /**
   * @access public
   * @return {HTMLElement}
   */
  createElements()
  {
    if(this.createElements) {
      this.origin.deleteContents();

      const elements = this.getElements();
      for (let i = 0; i < elements.length; i++) {
        this.origin.insertNode(elements[i]);
      }
    }
  }
}
