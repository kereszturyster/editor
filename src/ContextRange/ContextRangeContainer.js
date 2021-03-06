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
     * @type {ContextRange}
     */
    this.range = null;

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
        this.createRange();
      }

    });
    // focusout || mouseup
    this.$container.mouseup((e) =>
    {
      this.createRange();
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
   * @access public
   * @return {ContextRange}
   */
  getRange()
  {
    return this.range;
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
   * @return {void}
   */
  createRange()
  {
    const selection = window.getSelection();

    let range = this.tmpRange;
    this.tmpRange = null;

    if (!range && selection.rangeCount > 0) {
      range = selection.getRangeAt(0);
    }
    if (range && this.isInContainerRange(range)) {
      this.range = new ContextRange(range);
      $.event.trigger('ContextRangeContainer::createRange');
    }
  }

  /**
   * Függvény amely vissza adja jQuery objektumban a kijelölt elemeket
   *
   * @access public
   * @return {jQuery}
   */
  getHTMLElements()
  {
    return $(this.range.getHTMLElements());
  }

  /**
   * Függvény amely vissza adja jQuery objektumban a kijelölt elemeket
   *
   * @access public
   * @return {jQuery}
   */
  getTextElements()
  {
    // TODO ContextRange.TEXT_ELEMENTS
    return this.getHTMLElements();
  }

  /**
   * Függvény amely vissza adja jQuery objektumban a kijelölt elemek context-át  (szülő elemét)
   *
   * @access public
   * @return {jQuery}
   */
  getContext()
  {
    return $(this.range.getContext());
  }

  /**
   * Kép lekérdezése
   *
   * @access public
   * @return {jQuery}
   */
  getImages()
  {
    return this.getHTMLElements().filter('img');
  }

  /**
   * Container visszaadása
   *
   * @access public
   * @return {jQuery}
   */
  getContainers()
  {
    // Elemek között van container
    const $elements = this.getHTMLElements();
    let $result = $elements.filter(ContextRange.CONTAINER_ELEMENTS).not(this.$container);
    if ($result.length > 0) {
      return $result;
    }

    // Ha context container
    const $context = this.getContext();
    $result = $context.filter(ContextRange.CONTAINER_ELEMENTS).not(this.$container);
    if ($result.length > 0) {
      return $result;
    }

    return $context.closest(ContextRange.CONTAINER_ELEMENTS).not(this.$container);
  }

  onCreateRange(callback)
  {
    if (typeof callback === 'function') {
      $(document).bind('ContextRangeContainer::createRange', () =>
      {
        callback(this);
      });
    }
  }
}