import BadRequestError from '../errors/BadRequestError';
import { IClass, IClassReq, IPaginatedResponse, IRecordedClass } from '../interfaces/class';
import { ClassRepository } from '../repositories/ClassRepository';
import { validateEventDates } from '../helpers/dateFormats';
import ClassService from '../services/class';

class ClassController {
  private classRepository: ClassRepository;
  private classService: ClassService;

  constructor() {
    this.classRepository = new ClassRepository();
    this.classService = new ClassService(this.classRepository);
  }

  async createClass(body: Omit<IClassReq, '_id'>): Promise<IClassReq> {
    const startDateTime = `${body.startDate!} ${body.startTime!}`;
    const endDateTime = `${body.startDate!} ${body.endTime!}`;

    const validateDate = validateEventDates(startDateTime, endDateTime);
    if (!validateDate.isValid) {
      throw new BadRequestError({ message: 'Invalid date range', reason: validateDate.errors[0] });
    }

    const { startDate, startTime, endTime, ...rest } = body;

    const requestData: Omit<IClass, '_id'> = {
      ...rest,
      startDateTime: new Date(startDateTime),
      endDateTime: new Date(endDateTime)
    };

    const newClass = await this.classService.createClass(requestData);

    return newClass;
  }

  async getClassById(id: string): Promise<IClassReq> {
    const classData = await this.classService.getClassById(id);
    if (!classData) {
      throw new BadRequestError({ message: 'Class not found', reason: 'Invalid class ID' });
    }
    return classData;
  }

  async getAllClasses(page: number, limit: number): Promise<IPaginatedResponse<IClassReq>> {
    const paginationPage = page && page > 0 ? page : 1;
    const paginationLimit = limit && limit > 0 ? limit : 10;
    const classes = await this.classService.getAllClasses(paginationPage, paginationLimit, { startDateTime: { $gte: new Date() } });
    if (classes.data.length === 0) {
      throw new BadRequestError({ message: 'No class found', reason: 'No class available' });
    }
    return classes;
  }

  async updateClass(id: string, body: Partial<Omit<IClassReq, '_id'>>): Promise<IClassReq | null> {
    const existing = await this.classService.getClassById(id);
    if (!existing) {
      throw new BadRequestError({ message: 'Class not found', reason: 'Invalid class ID' });
    }

    const hasStartDate = body.startDate !== undefined;
    const hasStartTime = body.startTime !== undefined;
    const hasEndTime = body.endTime !== undefined;

    if (!hasStartDate && !hasStartTime && !hasEndTime) {
      const { startTime, endTime, ...patch } = body as any;
      const updated = await this.classService.updateClass(id, patch);
      return updated;
    }

    const key = (hasStartDate ? 4 : 0) | (hasStartTime ? 2 : 0) | (hasEndTime ? 1 : 0);

    let StartDateTimeStr: string;
    let EndDateTimeStr: string;

    switch (key) {
      case 7:
        StartDateTimeStr = `${body.startDate!} ${body.startTime!}`;
        EndDateTimeStr = `${body.startDate!} ${body.endTime!}`;
        break;

      case 6:
        StartDateTimeStr = `${body.startDate!} ${body.startTime!}`;
        EndDateTimeStr = `${body.startDate!} ${existing.endTime}`;
        break;

      case 5:
        StartDateTimeStr = `${body.startDate!} ${existing.startTime}`;
        EndDateTimeStr = `${body.startDate!} ${body.endTime!}`;
        break;

      case 4:
        StartDateTimeStr = `${body.startDate!} ${existing.startTime}`;
        EndDateTimeStr = `${body.startDate!} ${existing.endTime}`;
        break;

      case 3:
        StartDateTimeStr = `${existing.startDate} ${body.startTime!}`;
        EndDateTimeStr = `${existing.startDate} ${body.endTime!}`;
        break;

      case 2:
        StartDateTimeStr = `${existing.startDate} ${body.startTime!}`;
        EndDateTimeStr = `${existing.startDate} ${existing.endTime}`;
        break;

      case 1:
        StartDateTimeStr = `${existing.startDate} ${existing.startTime}`;
        EndDateTimeStr = `${existing.startDate} ${body.endTime!}`;
        break;

      case 0:
      default:
        StartDateTimeStr = `${existing.startDate} ${existing.startTime}`;
        EndDateTimeStr = `${existing.startDate} ${existing.endTime}`;
        break;
    }

    const validateDate = validateEventDates(StartDateTimeStr, EndDateTimeStr);
    if (!validateDate.isValid) {
      throw new BadRequestError({
        message: 'Invalid date range',
        reason: validateDate.errors[0]
      });
    }

    const { startDate, endDate, startTime, endTime, ...rest } = body as any;

    const patch: Partial<Omit<IClass, '_id'>> = { ...rest };

    if (hasStartDate || hasStartTime) {
      patch.startDateTime = new Date(StartDateTimeStr);
    }
    if (hasEndTime || hasStartDate || hasStartTime) {
      patch.endDateTime = new Date(EndDateTimeStr);
    }

    const updated = await this.classService.updateClass(id, patch);
    return updated;
  }

  async deleteClass(id: string): Promise<{ deletedCount: number }> {
    const result = await this.classService.deleteClass({ _id: id });
    if (result.deletedCount === 0) {
      throw new BadRequestError({ message: 'Class not found or already deleted', reason: 'Invalid class ID' });
    }
    return result;
  }

  async addRecordedClass(body: Omit<IRecordedClass, '_id'>): Promise<IRecordedClass> {
    const classExists = await this.classService.findOneRecorded({ videoLink: body.videoLink, stack: body.stack });
    if (classExists) {
      throw new BadRequestError({ message: 'Recorded class already exists', reason: 'Duplicate video link for the same stack' });
    }
    const newClass = await this.classService.addRecordedClass(body);
    return newClass;
  }

  async getRecordedClass(id: string): Promise<IRecordedClass> {
    const classData = await this.classService.getRecordedClass(id);
    if (!classData) {
      throw new BadRequestError({ message: 'Recorded class not found', reason: 'Invalid recorded class ID' });
    }
    return classData;
  }

  async getAllRecordedClasses(page: number, limit: number): Promise<IPaginatedResponse<IRecordedClass>> {
    const paginationPage = page && page > 0 ? page : 1;
    const paginationLimit = limit && limit > 0 ? limit : 10;
    const classes = await this.classService.getAllRecordedClasses(paginationPage, paginationLimit);
    if (classes.data.length === 0) {
      throw new BadRequestError({ message: 'No recorded class found', reason: 'No recorded class available' });
    }
    return classes;
  }

  async updateRecordedClass(id: string, body: Partial<Omit<IRecordedClass, '_id'>>): Promise<IRecordedClass | null> {
    const existing = await this.classService.getRecordedClass(id);
    if (!existing) {
      throw new BadRequestError({ message: 'Recorded class not found', reason: 'Invalid recorded class ID' });
    }
    if (body.videoLink && body.videoLink !== existing.videoLink) {
      const classExists = await this.classService.findOneRecorded({ videoLink: body.videoLink, stack: body.stack || existing.stack });
      if (classExists) {
        throw new BadRequestError({ message: 'Recorded class already exists', reason: 'Duplicate video link for the same stack' });
      }
    }
    const updated = await this.classService.updateRecordedClass(id, body);
    return updated;
  }

  async deleteRecordedClass(id: string): Promise<{ deletedCount: number }> {
    const result = await this.classService.deleteRecordedClass({ _id: id });
    if (result.deletedCount === 0) {
      throw new BadRequestError({ message: 'Recorded class not found or already deleted', reason: 'Invalid recorded class ID' });
    }
    return result;
  }
}
export default ClassController;
