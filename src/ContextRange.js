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

      let nodes = [];
      for (let i = 0; i < content.childNodes.length; i++) {
        nodes.push(content.childNodes[i]);
      }
      for (let i = 0; i < nodes.length; i++){
        let element = nodes[i];

        // let clone = range.cloneRange();
        // clone.setEnd(node, node.childNodes.length);
        // clone.setStart(node, 0);

        if(nodes[i].nodeType === Node.TEXT_NODE) {
          element = document.createElement('span');
          element.appendChild(nodes[i]);
        }
        else {
          // if(i === 0){
          //   element = document.createElement('span');
          //   for (let j = 0; j < nodes[i].childNodes.length; j++) {
          //     element.appendChild(nodes[i].childNodes[j]);
          //   }
          // }
        }

        // if(i === 0){
        //   node = this.origin.startContainer;
        // }
        // if(i === content.childNodes.length - 1){
        //   node = this.origin.startContainer;
        // }


        this.elements.push(element);
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
