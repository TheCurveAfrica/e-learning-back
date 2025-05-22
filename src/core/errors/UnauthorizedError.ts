import DomainError from './DomainError';

export default class UnauthorizedError extends DomainError {
  protected error_name: 'unauthorized';

  protected httpCode = 401;

  public constructor(
    props: { message: string; reason?: string; data?: any; error_name?: string } = {
      message: 'Unauthorized access. Please log in to continue'
    }
  ) {
    const { message, reason = '', data = null } = props;
    super({ message, reason, data, status: false });
  }
}
