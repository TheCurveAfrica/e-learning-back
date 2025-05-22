import DomainError from './DomainError';

export default class ForbiddenError extends DomainError {
  protected error_name = 'not_authorized';

  protected httpCode = 403;

  public constructor(
    props: { message: string; reason?: string; data?: any } = {
      message: 'Forbidden. You do not have permission to access this resource'
    }
  ) {
    const { message, reason = '', data = null } = props;
    super({ message, reason, data, status: false });
  }
}
