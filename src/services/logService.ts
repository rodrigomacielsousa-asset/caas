import { db } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  where, 
  onSnapshot 
} from 'firebase/firestore';

export enum LogLevel {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

export const logService = {
  async log(userId: string, level: LogLevel, message: string, context?: any) {
    try {
      await addDoc(collection(db, 'systemLogs'), {
        userId,
        level,
        message,
        context,
        timestamp: serverTimestamp()
      });
    } catch (err) {
      // Fallback to console if DB write fails
      console.error("Logging Error:", err);
    }
  },

  info: (uid: string, msg: string, ctx?: any) => logService.log(uid, LogLevel.INFO, msg, ctx),
  warn: (uid: string, msg: string, ctx?: any) => logService.log(uid, LogLevel.WARN, msg, ctx),
  error: (uid: string, msg: string, ctx?: any) => logService.log(uid, LogLevel.ERROR, msg, ctx)
};
