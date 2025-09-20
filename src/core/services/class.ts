import { ClassRepository } from '../repositories/ClassRepository';
import { FilterQuery } from 'mongoose';
import { IClass, IClassReq, IPaginatedResponse, IRecordedClass } from '../interfaces/class';
import { formatDateTime } from '../helpers/dateFormats';
import { IClassModel } from '../models/Classes/live';
import { IRecordedClassModel } from '../models/Classes/recorded';

class ClassService {
  private classRepository: ClassRepository;

  constructor(_classRepository: ClassRepository) {
    this.classRepository = _classRepository;
  }

  async createClass(payload: Omit<IClass, '_id'>): Promise<IClassReq> {
    const newClass = await this.classRepository.createClass(payload);

    return this.convertToIClassReq(newClass);
  }

  async getClassById(id: string): Promise<IClassReq | null> {
    const result = await this.classRepository.findClassById(id);
    return result ? this.convertToIClassReq(result) : null;
  }

  async getAllClasses(page: number, limit: number, filter?: FilterQuery<IClassModel>): Promise<IPaginatedResponse<IClassReq>> {
    const { classes, total } = await this.classRepository.findAllClasses(filter, page, limit);
    const totalPages = Math.ceil(total / limit);
    return {
      data: classes.map((classDoc) => this.convertToIClassReq(classDoc)),
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  }

  async updateClass(id: string, payload: Partial<Omit<IClass, '_id'>>): Promise<IClassReq | null> {
    const updated = await this.classRepository.updateClass(id, payload);
    return updated ? this.convertToIClassReq(updated) : null;
  }

  async deleteClass(filter: FilterQuery<IClassModel>): Promise<{ deletedCount: number }> {
    return await this.classRepository.deleteClass(filter);
  }

  async addRecordedClass(payload: Omit<IRecordedClass, '_id'>): Promise<IRecordedClass> {
    return await this.classRepository.createRecorded(payload);
  }

  async findOneRecorded(filter: FilterQuery<IRecordedClassModel>): Promise<IRecordedClass | null> {
    return await this.classRepository.findOneRecorded(filter);
  }

  async getRecordedClass(id: string): Promise<IRecordedClass | null> {
    return await this.classRepository.findRecordedById(id);
  }

  async getAllRecordedClasses(page: number, limit: number, filter?: FilterQuery<IRecordedClassModel>): Promise<IPaginatedResponse<IRecordedClass>> {
    const { classes, total } = await this.classRepository.findAllRecorded(filter, page, limit);
    const totalPages = Math.ceil(total / limit);
    return {
      data: classes,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  }

  async updateRecordedClass(id: string, payload: Partial<Omit<IRecordedClass, '_id'>>): Promise<IRecordedClass | null> {
    return await this.classRepository.updateRecorded(id, payload);
  }

  async deleteRecordedClass(filter: FilterQuery<IRecordedClassModel>): Promise<{ deletedCount: number }> {
    return await this.classRepository.deleteRecorded(filter);
  }

  private convertToIClassReq(classDoc: IClass): IClassReq {
    return {
      _id: classDoc._id.toString(),
      title: classDoc.title,
      description: classDoc.description,
      startDate: formatDateTime(new Date(classDoc.startDateTime), 'MM/DD/YYYY'),
      endDate: formatDateTime(new Date(classDoc.endDateTime), 'MM/DD/YYYY'),
      startTime: formatDateTime(new Date(classDoc.startDateTime), 'HH:mm'),
      endTime: formatDateTime(new Date(classDoc.endDateTime), 'HH:mm'),
      classLink: classDoc.classLink,
      location: classDoc.location,
      stack: classDoc.stack
    };
  }
}

export default ClassService;
