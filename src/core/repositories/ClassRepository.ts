import { FilterQuery, UpdateQuery } from 'mongoose';
import { IClass, IRecordedClass } from '../interfaces/class';
import { IClassModel, Class } from '../models/Classes/live';
import { IRecordedClassModel, RecordedClass } from '../models/Classes/recorded';

export class ClassRepository {
  async createClass(payload: Omit<IClass, '_id'>): Promise<IClass> {
    const newClass = await Class.create(payload);
    return this.convertToIClass(newClass);
  }

  async findClassById(id: string): Promise<IClass | null> {
    const classDoc = await Class.findOne({ _id: id, startDateTime: { $gte: new Date() } });
    return classDoc ? this.convertToIClass(classDoc) : null;
  }

  async findAllClasses(filter: FilterQuery<IClassModel> = {}, page: number, limit: number): Promise<{ classes: IClass[]; total: number }> {
    const skip = (page - 1) * limit;

    const total = await Class.countDocuments(filter);

    const classes = await Class.find(filter).sort({ startDateTime: 1 }).skip(skip).limit(limit);
    return {
      classes: classes.map((classDoc) => this.convertToIClass(classDoc)),
      total: Number(total)
    };
  }

  async updateClass(id: string, update: UpdateQuery<IClassModel>): Promise<IClass | null> {
    const updatedClass = await Class.findByIdAndUpdate(id, update, { new: true });
    return updatedClass ? this.convertToIClass(updatedClass) : null;
  }

  async deleteClass(filter: FilterQuery<IClassModel>): Promise<{ deletedCount: number }> {
    const result = await Class.deleteMany(filter);
    return { deletedCount: result.deletedCount };
  }

  async createRecorded(payload: Omit<IRecordedClass, '_id'>): Promise<IRecordedClass> {
    const newClass = await RecordedClass.create(payload);
    return this.convertRecorededClass(newClass);
  }

  async findOneRecorded(filter: FilterQuery<IRecordedClassModel>): Promise<IRecordedClass | null> {
    const classDoc = await RecordedClass.findOne(filter);
    return classDoc ? this.convertRecorededClass(classDoc) : null;
  }

  async findRecordedById(id: string): Promise<IRecordedClass | null> {
    const classDoc = await RecordedClass.findById(id);
    return classDoc ? this.convertRecorededClass(classDoc) : null;
  }

  async findAllRecorded(
    filter: FilterQuery<IRecordedClassModel> = {},
    page: number,
    limit: number
  ): Promise<{ classes: IRecordedClass[]; total: number }> {
    const skip = (page - 1) * limit;
    const total = await RecordedClass.countDocuments(filter);

    const classes = await RecordedClass.find(filter).sort({ date: -1 }).skip(skip).limit(limit);
    return {
      classes: classes.map((classDoc) => this.convertRecorededClass(classDoc)),
      total: Number(total)
    };
  }

  async updateRecorded(id: string, update: UpdateQuery<IRecordedClassModel>): Promise<IRecordedClass | null> {
    const updatedClass = await RecordedClass.findByIdAndUpdate(id, update, { new: true });
    return updatedClass ? this.convertRecorededClass(updatedClass) : null;
  }

  async deleteRecorded(filter: FilterQuery<IRecordedClassModel>): Promise<{ deletedCount: number }> {
    const result = await RecordedClass.deleteMany(filter);
    return { deletedCount: result.deletedCount };
  }

  private convertToIClass(classDoc: IClassModel): IClass {
    return {
      _id: classDoc._id.toString(),
      title: classDoc.title,
      description: classDoc.description,
      startDateTime: classDoc.startDateTime,
      endDateTime: classDoc.endDateTime,
      classLink: classDoc.classLink,
      location: classDoc.location,
      stack: classDoc.stack
    };
  }

  private convertRecorededClass(classDoc: IRecordedClassModel): IRecordedClass {
    return {
      _id: classDoc._id.toString(),
      title: classDoc.title,
      description: classDoc.description,
      videoLink: classDoc.videoLink,
      date: classDoc.date,
      stack: classDoc.stack
    };
  }
}
