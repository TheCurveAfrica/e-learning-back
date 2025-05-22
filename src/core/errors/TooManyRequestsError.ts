import DomainError from './DomainError';

export default class TooManyRequestsError extends DomainError {
  protected error_name = 'too_many_requests';

  protected httpCode = 429;

  public constructor(
    props: { message: string; reason?: string; data?: any } = {
      message: 'Too many requests. Please slow down and try again later'
    }
  ) {
    const { message, reason = '', data = null } = props;
    super({ message, reason, data, status: false });
  }
}
