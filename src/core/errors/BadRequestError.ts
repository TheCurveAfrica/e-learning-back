import DomainError from './DomainError';

export default class BadRequestError extends DomainError {
  protected error_name = 'bad_request';

  protected httpCode = 400;

  public constructor(props: { message: string; reason?: string; data?: any } = { message: 'Invalid data provided for the request' }) {
    const { message, reason = '', data = null } = props;
    super({ message, reason, data, status: false });
  }
}
