import DomainError from './DomainError';

export default class RequestValidationError extends DomainError {
  protected error_name = 'validation_error';

  protected httpCode = 422;

  public constructor(
    props: { message: string; reason?: string; data?: any } = {
      message: 'There was an issue with your request. Please check the provided information and try again'
    }
  ) {
    const { message, reason = '', data = null } = props;
    super({ message, reason, data, status: false });
  }
}
