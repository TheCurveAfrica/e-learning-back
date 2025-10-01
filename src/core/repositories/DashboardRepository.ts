import { Admin } from '../models/admin';
import { Class } from '../models/Classes/live';
import { User } from '../models/user';
import { USER_ROLES, STACK } from '../constants/user';
import { IDashboardStats } from '../interfaces/dashboard';
import { formatDateTime } from '../helpers/dateFormats';
import { IClassReq } from '../interfaces/class';

export class DashboardRepository {
  async adminDashboard(): Promise<IDashboardStats> {
    const [classStats] = await Class.aggregate([
      { $match: { startDateTime: { $gte: new Date() } } },
      {
        $facet: {
          upcomingClasses: [{ $sort: { startDateTime: 1 } }, { $limit: 5 }]
        }
      }
    ]);

    const [studentStats] = await User.aggregate([
      { $match: { role: USER_ROLES.STUDENT } },
      {
        $facet: {
          totalStudents: [{ $count: 'count' }],
          totalStudentsByStack: [
            {
              $group: {
                _id: '$stack',
                count: { $sum: 1 }
              }
            }
          ]
        }
      }
    ]);

    const totalAdmin = await Admin.countDocuments();
    const totalStudents = studentStats.totalStudents[0]?.count ?? 0;
    const byStackArray = studentStats.totalStudentsByStack as Array<{ _id: STACK; count: number }>;
    const classArray = (classStats?.upcomingClasses || []) as any[];

    const byStackMapEnum = byStackArray.reduce(
      (acc, { _id, count }) => {
        acc[_id] = count;
        return acc;
      },
      {} as Partial<Record<STACK, number>>
    );

    return {
      totalAdmins: totalAdmin,
      students: {
        total: totalStudents,
        byStack: byStackMapEnum
      },
      upcomingClasses: classArray.map((cls) => this.convertUpcomingClasses(cls)),
      Assessment: [],
      topPerfomance: []
    };
  }

  private convertUpcomingClasses(classDoc: any): IClassReq {
    return {
      _id: classDoc._id.toString() ?? '',
      title: classDoc.title ?? '',
      description: classDoc.description ?? '',
      startDate: formatDateTime(new Date(classDoc.startDateTime), 'MM/DD/YYYY') ?? '',
      startTime: formatDateTime(new Date(classDoc.startDateTime), 'HH:mm') ?? '',
      endTime: formatDateTime(new Date(classDoc.endDateTime), 'HH:mm') ?? '',
      classLink: classDoc.classLink ?? '',
      location: classDoc.location ?? '',
      stack: classDoc.stack ?? ''
    };
  }
}
