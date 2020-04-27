class ContextRangeElement {

  /**
   * @access public
   * @param {HTMLElement} element
   * @param {Range} range
   * @constructor
   */
  constructor(element, range)
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
   * @return {Range}
   */
  getRange()
  {
    return this.range;
  }
}

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
     * @type {Array<ContextRangeElement>}
     */
    this.elements = [];

    /**
     * @private
     * @type {boolean}
     */
    this.isCreateElements = false;

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
      this.isCreateElements = false;
      this.elements.push(new ContextRangeElement(context, this.origin));
    } else {
      this.isCreateElements = true;
      // content.childNodes ha  nincs container elem div, p, h1 stb
      if(this.origin.startContainer === this.origin.endContainer) {
        const element = document.createElement('span');
        element.appendChild(content);

        this.elements.push(new ContextRangeElement(element, this.origin));
      }

      // let nodes = [];
      // for (let i = 0; i < content.childNodes.length; i++) {
      //   nodes.push(content.childNodes[i]);
      // }
      // // TODO több range kell
      // for (let i = 0; i < nodes.length; i++){
      //   let element = nodes[i];
      //   if(nodes[i].nodeType === Node.TEXT_NODE) {
      //     element = document.createElement('span');
      //     element.appendChild(nodes[i]);
      //   }
      //   else if(i === 0 || i === nodes.length - 1){
      //     element = document.createElement('span');
      //     while(nodes[i].firstChild) {
      //       element.appendChild(nodes[i].firstChild);
      //     }
      //   }
      //
      //   this.elements.push(element);
      // }
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
   * @return {Array<ContextRangeElement>}
   */
  getHTMLElements()
  {
    const elements = this.getElements();
    const htmlElements = [];
    for (let i = 0; i < elements.length; i++) {
      htmlElements.push(elements[i].getElement());
    }

    return htmlElements;
  }

  /**
   * Kijelölt elemek
   *
   * @access public
   * @return {Array<ContextRangeElement>}
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
    if(this.isCreateElements) {
      const elements = this.getElements();
      for (let i = 0; i < elements.length; i++) {
        const range = elements[i].getRange();
        const element = elements[i].getElement();

        range.deleteContents();
        range.insertNode(element);
      }
    }
  }
}
