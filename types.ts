
export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  note: string;
}

export interface Student {
  id: string;
  name: string;
  generalNotes: string;
  attendance: AttendanceRecord[];
}

export interface Classroom {
  id: string;
  name: string;
  schedule: string;
  students: Student[];
}

export interface AppState {
  classrooms: Classroom[];
  isLoading: boolean;
  error: string | null;
}

export interface AppContextType extends AppState {
  // Navigation
  view: ViewState;
  navigateHome: () => void;
  navigateToClass: (classId: string) => void;
  navigateToStudent: (classId: string, studentId: string) => void;

  // Classroom Actions
  addClassroom: (name: string, schedule: string) => void;
  updateClassroom: (id: string, name: string, schedule: string) => void;
  deleteClassroom: (id: string) => void;
  
  // Student Actions
  addStudent: (classId: string, name: string) => void;
  updateStudent: (classId: string, studentId: string, name: string, generalNotes: string) => void;
  deleteStudent: (classId: string, studentId: string) => void;

  // Attendance Actions
  addAttendanceRecords: (classId: string, studentIds: string[], date: string, note: string) => void;
  addSingleAttendanceRecord: (classId: string, studentId: string, date: string, note: string) => void;
  updateAttendanceRecord: (classId: string, studentId: string, recordId: string, date: string, note: string) => void;
  deleteAttendanceRecord: (classId: string, studentId: string, recordId: string) => void;
}

export type ViewState = {
  page: 'main' | 'classDetails' | 'studentDetails';
  classId?: string;
  studentId?: string;
}
