import { compile } from 'handlebars';

/**
 * Abstract class for notification messages
 *
 * @export
 * @abstract
 * @class Message
 */
export abstract class Message {

  /**
   * Set of handlebar.js templates for Markdown messages
   *
   * @protected
   * @abstract
   * @type {Template}
   * @memberof Message
   */
  protected abstract readonly markdownTemplate: string;

  /**
   * Content for
   *
   * ! Content depends on the used template class
   *
   * @protected
   * @abstract
   * @type {*}
   * @memberof Message
   */
  protected abstract context: any;

  /**
   * Return the message as Markdown
   *
   * @readonly
   * @type {string}
   * @memberof Message
   */
  public get Markdown() : string {
    return compile(this.markdownTemplate)(this.context);
  }
}
