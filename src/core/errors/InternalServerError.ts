import DomainError from './DomainError';

export default class InternalServerError extends DomainError {
  protected error_name = 'server_error';

  protected httpCode = 500;

  public constructor(
    props: { message: string; reason?: string; data?: any } = {
      message: 'Oops! Something went wrong on our end. Please try again later or contact support if the issue persists'
    }
  ) {
    const { message, reason = '', data = null } = props;
    super({ message, reason, data, status: false });
  }
}
