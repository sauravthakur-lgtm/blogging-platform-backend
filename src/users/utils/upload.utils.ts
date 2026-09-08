import * as fs from 'fs';
import * as path from 'path';

const uploadDir = path.join(process.cwd(), 'uploads', 'profiles');

export function ensureProfileUploadDir() {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
}

export function getProfileUploadDir() {
  return uploadDir;
}

export function deleteProfileFile(filePath?: string | null) {
  if (!filePath) {
    return;
  }

  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.join(process.cwd(), filePath);

  if (fs.existsSync(absolutePath)) {
    fs.unlinkSync(absolutePath);
  }
}