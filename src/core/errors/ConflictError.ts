import DomainError from './DomainError';

export default class ConflictError extends DomainError {
  protected error_name = 'conflict';

  protected httpCode = 409;

  public constructor(
    props: { message: string; reason?: string; data?: any } = {
      message: 'The request could not be completed due to a conflict with the current state of the target resource'
    }
  ) {
    const { message, reason = '', data = null } = props;
    super({ message, reason, data, status: false });
  }
}
