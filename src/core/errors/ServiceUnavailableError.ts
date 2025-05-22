import DomainError from './DomainError';

export default class ServiceUnavailableError extends DomainError {
  protected error_name = 'service_unavailable';

  protected httpCode = 503;

  public constructor(
    props: { message: string; reason?: string; data?: any } = {
      message: 'Service unavailable. Please try again later'
    }
  ) {
    const { message, reason = '', data = null } = props;
    super({ message, reason, data, status: false });
  }
}
