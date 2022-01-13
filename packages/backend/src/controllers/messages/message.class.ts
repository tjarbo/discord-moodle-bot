import { compile } from 'handlebars';

/**
 * Abstract class for notification messages.
 *
 * @export
 * @abstract
 * @class Message
 */
export abstract class Message {

  /**
   * handlebars.js template for Markdown messages.
   *
   * @protected
   * @abstract
   * @type {Template}
   * @memberof Message
   */
  protected abstract readonly markdownTemplate: string;

  /**
   * Content for the templates.
   *
   * ! Content depends on the used template class
   *
   * @protected
   * @abstract
   * @type {*}
   * @memberof Message
   */
  protected context: any;

  /**
   * Creates an instance of Message.
   *
   * @param {any} context Contains properties for the template class
   * @memberof Message
   */
  constructor(context: any) {
    this.context = context;
  }

  /**
   * Returns the message as Markdown.
   *
   * @readonly
   * @type {string}
   * @memberof Message
   */
  public get markdown(): string {
    return compile(this.markdownTemplate)(this.context);
  }
}
