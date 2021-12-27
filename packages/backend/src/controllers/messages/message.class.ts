import { compile } from 'handlebars';
import { config } from '../../configuration/environment';

/**
 * Interface for internationalized templates
 *
 * ! If you add a new language here, do not forget to update
 * ! the available languages in environment.ts
 *
 * @export
 * @interface Template
 */
export interface Template {
  EN: string;
  DE: string;
}

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
  protected abstract readonly markdownTemplate: Template;

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
   * Target language in which the messages will be translated
   *
   * @protected
   * @type {keyof Template}
   * @memberof Message
   */
  protected language: keyof Template;

  constructor(lang: keyof Template = config.moodle.messageLanguage) {
    this.language = lang;
  }

  /**
   * Return the message as Markdown
   *
   * @readonly
   * @type {string}
   * @memberof Message
   */
  public get Markdown() : string {
    const template = compile(this.markdownTemplate[this.language] ?? this.markdownTemplate.EN);
    return template(this.context);
  }
}
