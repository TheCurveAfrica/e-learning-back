import { FilterQuery } from 'mongoose';
import { ILearningPath, ILessons, ILearningPathModel, IBulkResult } from '../interfaces/learningPath';
import * as XLSX from 'xlsx';
import { LearningPathRepository } from '../repositories/LearningPathRepository';
import { bulkLessonsSchema } from '../validations/learningPath';
import BadRequestError from '../errors/BadRequestError';
import ResourceNotFoundError from '../errors/ResourceNotFoundError';

class LearningPathService {
  private learningPathRepository: LearningPathRepository;

  constructor(_learningPathRepository: LearningPathRepository) {
    this.learningPathRepository = _learningPathRepository;
  }

  async createLearningPath(payload: Omit<ILearningPath, '_id'>): Promise<ILearningPath> {
    return await this.learningPathRepository.createLearningPath(payload);
  }

  async getLearningPathById(id: string): Promise<ILearningPath | null> {
    return await this.learningPathRepository.findLearningPathById(id);
  }

  async getAllLearningPaths(filter?: FilterQuery<ILearningPathModel>): Promise<ILearningPath[]> {
    return await this.learningPathRepository.findLearningPaths(filter);
  }

  async updateLearningPath(id: string, payload: Partial<ILearningPathModel>): Promise<ILearningPath | null> {
    return await this.learningPathRepository.updateLearningPath(id, payload);
  }

  async deleteLearningPath(id: string): Promise<{ deletedCount: number }> {
    return await this.learningPathRepository.deleteLearningPath(id);
  }

  async addLessons(learningPathId: string, lessons: Omit<ILessons, '_id' | 'completed'>[]): Promise<ILessons[] | null> {
    return await this.learningPathRepository.createLessons(learningPathId, lessons);
  }

  async getLessons(learningPathId: string): Promise<ILessons[] | null> {
    return await this.learningPathRepository.getLessons(learningPathId);
  }

  async LessonToggle(learningPathId: string, lessonId: string): Promise<ILessons | null> {
    return await this.learningPathRepository.toggleLessonCompleted(learningPathId, lessonId);
  }

  async updateLesson(learningPathId: string, lessonId: string, payload: Partial<Omit<ILessons, '_id' | 'completed'>>): Promise<ILessons | null> {
    return await this.learningPathRepository.updateLessons(learningPathId, lessonId, payload);
  }

  async deleteLesson(learningPathId: string, lessonId: string): Promise<string | null> {
    return await this.learningPathRepository.deleteLesson(learningPathId, lessonId);
  }

  async bulkAddLessonsFromExcel(learningPathId: string, fileBuffer: Buffer): Promise<IBulkResult> {
    if (!fileBuffer) throw new BadRequestError({ message: 'Excel file is required', reason: 'No file uploaded' });

    const rawRows = this.extractRows(fileBuffer);
    if (!rawRows.length) throw new BadRequestError({ message: 'No rows found in sheet', reason: 'Empty sheet' });

    const { formattedLessons, invalidRows, invalidSet } = this.normalizeLessonRows(rawRows);

    if (!formattedLessons.length) throw new BadRequestError({ message: 'No valid rows found in sheet', reason: 'All rows are invalid' });

    let validLessons: any[] = [];
    const parseResult = bulkLessonsSchema.safeParse(formattedLessons);

    if (parseResult.success) {
      validLessons = parseResult.data;
      console.log('✅ Valid lessons:', validLessons.length);
    } else {
      console.log('❌ Zod validation failed for lessons:', parseResult.error.errors);

      for (const issue of parseResult.error.errors) {
        const index = typeof issue.path[0] === 'number' ? issue.path[0] : -1;
        const row = formattedLessons[index];
        if (row && !invalidSet.has(`${row.week}-${row.title}`)) {
          invalidRows.push({
            ...row,
            reason: issue.message
          });
          invalidSet.add(`${row.week}-${row.title}`);
        }
      }

      const invalidKeys = new Set(invalidRows.map((u) => `${u.week}-${u.title}`));
      validLessons = formattedLessons.filter((u) => !invalidKeys.has(`${u.week}-${u.title}`));
    }

    const learningPath = await this.learningPathRepository.findLearningPathById(learningPathId);
    if (!learningPath) throw new ResourceNotFoundError({ message: 'Learning path not found', reason: 'Invalid learning path ID' });

    const existingWeeks = new Set<number>(learningPath.lessons.map((l: any) => Number(l.week)));
    const duplicates: number[] = [];
    const lessonsToAdd: Omit<ILessons, '_id' | 'completed'>[] = [];

    for (const lesson of validLessons) {
      const weekNum = Number(lesson.week);
      if (existingWeeks.has(weekNum)) {
        duplicates.push(weekNum);
      } else {
        lessonsToAdd.push({
          week: weekNum,
          title: lesson.title,
          description: lesson.description
        });
        existingWeeks.add(weekNum);
      }
    }

    const created = (await this.learningPathRepository.createLessons(learningPathId, lessonsToAdd)) || [];

    return { created, duplicates, invalidRows };
  }

  private extractRows(buffer: Buffer): any[] {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json(sheet, { defval: '' });
  }

  private normalizeLessonRows(rawRows: any[]): { formattedLessons: any[]; invalidRows: any[]; invalidSet: Set<string> } {
    const formattedLessons: any[] = [];
    const invalidRows: any[] = [];
    const invalidSet = new Set<string>();

    for (const row of rawRows) {
      const normalized: Record<string, any> = {};
      for (const key in row) {
        normalized[key.toLowerCase().trim()] = row[key];
      }

      const weekRaw = normalized['week'] ?? normalized['week number'] ?? normalized['week_no'] ?? normalized['wk'] ?? '';
      const title = (normalized['title'] ?? normalized['lesson title'] ?? normalized['name'] ?? '').toString().trim();
      const description = (normalized['description'] ?? normalized['details'] ?? normalized['lesson description'] ?? '').toString().trim();

      let week: number | null = null;
      if (weekRaw !== '' && weekRaw !== null && weekRaw !== undefined) {
        const n = Number(weekRaw);
        week = Number.isFinite(n) ? Math.trunc(n) : null;
      }

      if (week === null || !title || !description) {
        const ident = `${week ?? 'no-week'}-${title || 'no-title'}`;
        if (!invalidSet.has(ident)) {
          invalidRows.push({
            raw: row,
            week: weekRaw,
            title,
            description
          });
          invalidSet.add(ident);
        }
        continue;
      }

      formattedLessons.push({
        week,
        title,
        description
      });
    }

    return { formattedLessons, invalidRows, invalidSet };
  }
}

export default LearningPathService;
