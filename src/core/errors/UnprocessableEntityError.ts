import DomainError from './DomainError';

export default class UnprocessableEntityError extends DomainError {
  protected error_name = 'unprocessable_entity';

  protected httpCode = 422;

  public constructor(
    props: { message: string; reason?: string; data?: any } = {
      message: 'Unprocessable Entity. The request was well-formed but was unable to be followed due to semantic errors'
    }
  ) {
    const { message, reason = '', data = null } = props;
    super({ message, reason, data, status: false });
  }
}
