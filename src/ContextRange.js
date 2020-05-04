class ContextRangeElement {

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
     * Init
     */
    this.init();
  }

  /**
   * Elemek létrehozása
   *
   * @access public
   * @return {ChildNode}
   */
  getRealContext(){
    const context = this.getContext();

    let node = this.origin.startContainer;
    while (node.parentNode !== context) {
      node = node.parentNode;
    }

    return node;
  }

  /**
   * @access public
   * @param {ChildNode} node
   * @return {boolean}
   */
  isWhitespaceNode( node )
  {
    return node.nodeType === Node.TEXT_NODE && !(/[^\t\n\r ]/.test(node.textContent));
  }

  /**
   * @access public
   * @param {ChildNode} node
   * @return {boolean}
   */
  isTextElement( node )
  {
    return ContextRange.TEXT_ELEMENTS.includes(node.nodeName.toLowerCase());
  }

  /**
   * @access public
   * @param {ChildNode} node
   * @return {boolean}
   */
  isContainerElement( node )
  {
    return ContextRange.CONTAINER_ELEMENTS.includes(node.nodeName.toLowerCase());
  }

  /**
   * Init
   */
  init() {
    const context = this.getContext();
    const content = this.origin.cloneContents();

    console.log(content.childNodes, this.origin);

    let element = null;
    // Dupla kattintással kijelölödik a bekezdés
    if (this.origin.startContainer.nodeType === Node.TEXT_NODE && this.origin.endContainer.nodeType !== Node.TEXT_NODE && this.origin.endOffset === 0) {
      element = this.getRealContext();

      this.origin = document.createRange();
      this.origin.setStart(element, 0);
      this.origin.setEnd(element, element.childNodes.length);

      this.elements.push(new ContextRangeElement(element, this.origin, false));
    }
    // Kép van csak kijelölve
    else if(content.childNodes.length === 1 && content.childNodes[0].nodeName && content.childNodes[0].nodeName.toLowerCase() === 'img') {
      element = content.childNodes[0];
      this.elements.push(new ContextRangeElement(element, this.origin, true));
    }
    // Szöveges elemek vannak kijelölve első és utolsó elemnek
    else {
      const contextTextContent = context.textContent.replace(/[\t\n\r ]+/g, '');
      const contentTextContent = content.textContent.replace(/[\t\n\r ]+/g, '');

      console.log(contextTextContent.length, contentTextContent.length);
      // az egész bekezdés ki van jelölve
      if (contentTextContent.length === 0 || contextTextContent.length === contentTextContent.length ) {
        element = context;
        this.elements.push(new ContextRangeElement(element, this.origin, false));
      }
      else if(content.childNodes[0].nodeType === Node.TEXT_NODE && content.childNodes[content.childNodes.length-1].nodeType === Node.TEXT_NODE) {
        element = document.createElement('span');
        element.appendChild(content);

        this.elements.push(new ContextRangeElement(element, this.origin, true));
      }
      else {
        const nodes = [];
        // TODO childNode lehetnek további gyerek elemei
        // TODO [p, text, p, text, p] text enter stb. lehet.
        for(let i = 0; i < content.childNodes.length; i++) {
          if(!this.isWhitespaceNode(content.childNodes[i])) {
            nodes.push(content.childNodes[i]);
          }
        }

        element = document.createElement('span');
        while(nodes[0].firstChild) {
          element.appendChild(nodes[0].firstChild);
        }
        nodes[0] = element;

        element = document.createElement('span');
        while(nodes[nodes.length-1].firstChild) {
          element.appendChild(nodes[nodes.length-1].firstChild);
        }
        nodes[nodes.length-1] = element;

        for(let i = 0; i < nodes.length; i++) {
          this.elements.push(new ContextRangeElement(nodes[i], this.origin, true));
        }

        // this.createElements();
      }
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
   * @return {void}
   */
  createElements()
  {
    const elements = this.getElements();
    for (let i = 0; i < elements.length; i++) {
      elements[i].createElement();
    }
  }
}

ContextRange.CONTAINER_ELEMENTS = 'p,h1,h2,h3,h4,h5,h6,div';
ContextRange.TEXT_ELEMENTS = 'a,span,strong,em,img';
