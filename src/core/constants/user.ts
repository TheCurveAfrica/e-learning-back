export enum USER_ROLES {
  ADMIN = 'admin',
  STUDENT = 'student',
  INSTRUCTOR = 'instructor'
}

export enum USER_GENDER {
  MALE = 'male',
  FEMALE = 'female',
  OTHERS = 'others'
}

export enum USER_STATUS {
  Suspended = 'suspended',
  Active = 'active',
  Inactive = 'inactive'
}

export enum VerificationTokenStatus {
  Expired = 'expired',
  Valid = 'valid',
  Invalid = 'invalid'
}

export const EMAIL_STATUS = {
  VERIFIED: true,
  NOT_VERIFIED: false
};

export const PHONE_STATUS = {
  VERIFIED: true,
  NOT_VERIFIED: false
};

export enum STACK {
  FRONTEND = 'frontend',
  BACKEND = 'backend',
  PRODUCT_DESIGN = 'product_design'
}

export enum CLASS_QUERY {
  LIVE = 'live',
  RECORDED = 'recorded'
}
