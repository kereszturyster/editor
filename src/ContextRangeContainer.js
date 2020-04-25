import $ from "jquery";
import {ContextRange} from "./ContextRange";

export class ContextRangeContainer
{
  /**
   * @public
   * @param containerSelector {String}
   * @constructor
   */
  constructor(containerSelector)
  {
    /**
     * @protected
     * @type {Array<ContextRange>}
     */
    this.ranges = [];

    /**
     * @protected
     * @type {jQuery}
     */
    this.$container = $(containerSelector);
    this.$container.keydown(function (e)
    {
      if (e.keyCode === 13) {
        if (e.shiftKey) {
          console.log('Shift Enter');
        } else {
          console.log('Enter');
        }
      }
    });

    this.$container.keyup((e) =>
    {
      if (e.keyCode === 13
        || e.keyCode === 37 || e.keyCode === 38
        || e.keyCode === 39 || e.keyCode === 40) {
        this.createRanges();
      }

    });
    // focusout || mouseup
    this.$container.mouseup((e) =>
    {
      this.createRanges();
    });

    this.$container.find('img').mousedown((e) =>
    {
      const range = document.createRange();
      range.setStart(e.target, 0);
      range.setEnd(e.target, e.target.childNodes.length);

      this.tmpRange = range;
      e.preventDefault();
    });
  }

  /**
   * <div id="module-live-editor" contenteditable="true" >
   *      <p> fsdfsdsdfsd  sd fdfds  <span >fsdfdsf|dssdf</span> sdfsdffdssdfdfs <span>fs|dfdsfd</span></p>
   * </div>
   *
   * Multi kijelölés legalább két monjuk span keresztül van a kijelőlés,
   * de ezek csak testvérelemek lehetnek az adott feltétellel
   *
   * @access private
   * @param {Range} range
   * @return {boolean}
   */
  isMultiRange(range)
  {
    // TODO ez most csak két vagy több testvér elemre igaz, ezért ha egymásba vannak az elemek ágyazva rossz lesz a kijelölés
    return range.startContainer.parentNode !== range.endContainer.parentNode &&
      range.startContainer.parentNode.parentNode === range.endContainer.parentNode.parentNode
  }

  /**
   * A kijelölés az adott container-ben van
   *
   * @access private
   * @param {Range} range
   * @returns {boolean}
   */
  isInContainerRange(range)
  {
    let node = range.commonAncestorContainer;
    const container = this.$container.get(0);
    while (node !== container) {
      node = node.parentNode;
    }

    return (!!node);
  }

  /**
   * @access public
   * @return {Array<ContextRange>}
   */
  getRanges()
  {
    return this.ranges;
  }

  /**
   * @access public
   * @param index {Number}
   * @return {ContextRange}
   */
  getRange(index)
  {
    index = index || 0;
    return this.ranges[index];
  }

  /**
   * @access public
   * @param range {Range}
   * @return {ContextRange}
   */
  addRange(range)
  {
    if (range.startContainer !== range.endContainer && range.endOffset === 0) {
      // TODO nem a kezdő konténert kell nézni hanem az elözó testvér elemet
      range.setEnd(range.startContainer.parentNode, range.startContainer.parentNode.childNodes.length);
    }
    // kijelöléshez tartozó elem meghatározása
    let context = range.commonAncestorContainer;
    // ha szöveg, akkor veszük a szülő elemet
    if (context.nodeType === Node.TEXT_NODE) {
      context = range.commonAncestorContainer.parentNode;
    }
    this.ranges.push(new ContextRange(range, context));
  }

  /**
   * @access public
   * @return {void}
   */
  createRanges()
  {
    const selection = window.getSelection();

    let range = this.tmpRange;
    this.tmpRange = null;

    if (!range && selection.rangeCount > 0) {
      range = selection.getRangeAt(0);
    }
    if (range && this.isInContainerRange(range)) {
      this.ranges = [];
      if (this.isMultiRange(range)) {
        let node = range.startContainer.parentNode;

        let clone = range.cloneRange();
        clone.setEnd(node, node.childNodes.length);

        this.addRange(clone);
        // köztes elemek kijelölései
        node = node.nextSibling;
        while (node !== range.endContainer.parentNode) {
          // szövegköszti kijelölésnél szükséges a szöveg elem
          // bekezdések kijelölésnél pedig nem !!!!!!!
          if (node.nodeType !== Node.TEXT_NODE) {
            clone = range.cloneRange();
            clone.setStart(node, 0);
            clone.setEnd(node, node.childNodes.length);
            this.addRange(clone);
          }
          node = node.nextSibling;
        }
        // az utolsó elem kijelölésének létrehozása
        clone = range.cloneRange();
        clone.setStart(node, 0);
        this.addRange(clone);
      } else {
        this.addRange(range);
      }
      $.event.trigger('ContextRangeContainer::createRanges');
    }
  }

  /**
   * Függvény amely vissza adja jQuery objektumban a kijelölt elemeket
   *
   * @access public
   * @return {jQuery}
   */
  getTextElements()
  {
    let $elements = $();
    for (let i = 0; i < this.ranges.length; i++) {
      const element = this.ranges[i].createTextElement();
      $elements = $elements.add(element);
    }
    return $elements;
  }

  /**
   * Függvény amely vissza adja jQuery objektumban a kijelölt elemek context-át  (szülő elemét)
   *
   * @access public
   * @return {jQuery}
   */
  getContexts()
  {
    let $contexts = $();
    for (let i = 0; i < this.ranges.length; i++) {
      const context = this.ranges[i].getContext();
      $contexts = $contexts.add(context);
    }
    return $contexts;
  }

  /**
   * Képek lekérdezése
   *
   * @access public
   * @return {jQuery}
   */
  getImages()
  {
    return this.getContexts().filter('img');
  }

  /**
   * Container-ek visszaadása
   *
   * @access public
   * @return {jQuery}
   */
  getContainers()
  {
    const $contexts = this.getContexts();
    let $results = $contexts.filter('p,h1,h2,h3,h4,h5,h6,div,td').not(this.$container);
    if ($results.length === 0) {
      $results = $contexts.parents('p,h1,h2,h3,h4,h5,h6,div,td').not(this.$container);
    }
    return $results;
  }

  onCreateRanges(callback)
  {
    if (typeof callback === 'function') {
      $(document).bind('ContextRangeContainer::createRanges', () =>
      {
        callback(this);
      });
    }
  }
}
