import { IClassReq } from './class';

export interface IDashboardStats {
  totalAdmins: number;
  students: {
    total: number;
    byStack: Partial<Record<string, number>>;
  };
  upcomingClasses: IClassReq[];
  Assessment: [];
  topPerfomance: [];
}
