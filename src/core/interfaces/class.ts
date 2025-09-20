export interface IClass {
  _id: string;
  title: string;
  description: string;
  startDateTime: Date;
  endDateTime: Date;
  classLink: string;
  location: string;
  stack: string;
}

export interface IClassReq {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  classLink: string;
  location: string;
  stack: string;
}

export interface IRecordedClass {
  _id: string;
  title: string;
  videoLink: string;
  description: string;
  date: Date;
  stack: string;
}

export interface IPaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
