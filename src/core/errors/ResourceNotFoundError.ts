import DomainError from './DomainError';

export default class ResourceNotFoundError extends DomainError {
  protected error_name = 'not_found';

  protected httpCode = 404;

  public constructor(
    props: { message: string; reason?: string; data?: any } = {
      message: 'The resource you are looking for could not be found'
    }
  ) {
    const { message, reason = '', data = null } = props;
    super({ message, reason, data, status: false });
  }
}
