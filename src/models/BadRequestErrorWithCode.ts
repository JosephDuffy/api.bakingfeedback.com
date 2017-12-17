import { BadRequestError } from 'routing-controllers';

export class BadRequestErrorWithCode extends BadRequestError {

  public readonly code: number;

  constructor(code: number, message?: string) {
    super(message);

    this.code = code;
  }

}
