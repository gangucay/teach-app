
import React, { createContext, useState, useEffect, useContext, useCallback, ReactNode } from 'react';
import type { AppContextType, Classroom, ViewState, Student } from '../types';
import { generateInitialData } from '../services/geminiService';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<ViewState>({ page: 'main' });

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const initialData = await generateInitialData();
        setClassrooms(initialData);
        setError(null);
      } catch (e) {
        setError("Không thể tải dữ liệu.");
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const navigateHome = () => setView({ page: 'main' });
  const navigateToClass = (classId: string) => setView({ page: 'classDetails', classId });
  const navigateToStudent = (classId: string, studentId: string) => setView({ page: 'studentDetails', classId, studentId });

  const addClassroom = (name: string, schedule: string) => {
    const newClass: Classroom = { id: crypto.randomUUID(), name, schedule, students: [] };
    setClassrooms(prev => [...prev, newClass]);
  };

  const updateClassroom = (id: string, name: string, schedule: string) => {
    setClassrooms(prev => prev.map(c => c.id === id ? { ...c, name, schedule } : c));
  };

  const deleteClassroom = (id: string) => {
    setClassrooms(prev => prev.filter(c => c.id !== id));
    navigateHome();
  };

  const addStudent = (classId: string, name: string) => {
    const newStudent: Student = { id: crypto.randomUUID(), name, generalNotes: "", attendance: [] };
    setClassrooms(prev => prev.map(c => c.id === classId ? { ...c, students: [...c.students, newStudent] } : c));
  };
  
  const updateStudent = (classId: string, studentId: string, name: string, generalNotes: string) => {
    setClassrooms(prev => prev.map(c => {
      if (c.id === classId) {
        const updatedStudents = c.students.map(s => 
          s.id === studentId ? { ...s, name, generalNotes } : s
        );
        return { ...c, students: updatedStudents };
      }
      return c;
    }));
  };

  const deleteStudent = (classId: string, studentId: string) => {
     setClassrooms(prev => prev.map(c => {
      if (c.id === classId) {
        return { ...c, students: c.students.filter(s => s.id !== studentId) };
      }
      return c;
    }));
  };
  
  const addAttendanceRecords = (classId: string, studentIds: string[], date: string, note: string) => {
      setClassrooms(prev => prev.map(c => {
          if (c.id === classId) {
              const updatedStudents = c.students.map(s => {
                  if (studentIds.includes(s.id)) {
                      const newRecord = { id: crypto.randomUUID(), date, note };
                      // Avoid duplicate records for the same date
                      if (!s.attendance.some(a => a.date === date)) {
                          return { ...s, attendance: [...s.attendance, newRecord] };
                      }
                  }
                  return s;
              });
              return { ...c, students: updatedStudents };
          }
          return c;
      }));
  };
  
  const addSingleAttendanceRecord = (classId: string, studentId: string, date: string, note: string) => {
      addAttendanceRecords(classId, [studentId], date, note);
  };
  
  const updateAttendanceRecord = (classId: string, studentId: string, recordId: string, date: string, note: string) => {
      setClassrooms(prev => prev.map(c => {
          if (c.id === classId) {
              const updatedStudents = c.students.map(s => {
                  if (s.id === studentId) {
                      const updatedAttendance = s.attendance.map(a => 
                          a.id === recordId ? { ...a, date, note } : a
                      );
                      return { ...s, attendance: updatedAttendance };
                  }
                  return s;
              });
              return { ...c, students: updatedStudents };
          }
          return c;
      }));
  };
  
  const deleteAttendanceRecord = (classId: string, studentId: string, recordId: string) => {
      setClassrooms(prev => prev.map(c => {
          if (c.id === classId) {
              const updatedStudents = c.students.map(s => {
                  if (s.id === studentId) {
                      return { ...s, attendance: s.attendance.filter(a => a.id !== recordId) };
                  }
                  return s;
              });
              return { ...c, students: updatedStudents };
          }
          return c;
      }));
  };

  const value: AppContextType = {
    classrooms,
    isLoading,
    error,
    view,
    navigateHome,
    navigateToClass,
    navigateToStudent,
    addClassroom,
    updateClassroom,
    deleteClassroom,
    addStudent,
    updateStudent,
    deleteStudent,
    addAttendanceRecords,
    addSingleAttendanceRecord,
    updateAttendanceRecord,
    deleteAttendanceRecord,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
