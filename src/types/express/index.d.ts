import { File as MulterFile } from 'multer';

declare module 'express-serve-static-core' {
  interface Request {
    file?: MulterFile; // for req.file from .single()
    files?: MulterFile[] | { [fieldname: string]: MulterFile[] }; // for .array() or .fields()
  }
}
