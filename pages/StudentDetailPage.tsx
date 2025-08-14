
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Student, Classroom, AttendanceRecord } from '../types';
import { ChevronLeftIcon, TrashIcon, EditIcon, PlusIcon, CalendarIcon } from '../components/Icons';
import Modal from '../components/Modal';

interface StudentDetailPageProps {
  classId: string;
  studentId: string;
}

const StudentDetailPage = ({ classId, studentId }: StudentDetailPageProps) => {
  const { classrooms, navigateToClass, updateStudent, addSingleAttendanceRecord, updateAttendanceRecord, deleteAttendanceRecord } = useAppContext();
  
  const { classroom, student } = useMemo(() => {
    const classroom = classrooms.find(c => c.id === classId);
    const student = classroom?.students.find(s => s.id === studentId);
    return { classroom, student };
  }, [classrooms, classId, studentId]);

  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(student?.name || '');
  const [editedNotes, setEditedNotes] = useState(student?.generalNotes || '');

  const [isRecordModalOpen, setRecordModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<Partial<AttendanceRecord> | null>(null);

  if (!classroom || !student) {
    return <div className="p-4 text-center text-red-500">Học sinh hoặc lớp học không tìm thấy.</div>;
  }
  
  const handleSaveDetails = () => {
    updateStudent(classId, studentId, editedName, editedNotes);
    setIsEditing(false);
  };
  
  const openNewRecordModal = () => {
    setCurrentRecord({ date: new Date().toISOString().split('T')[0], note: '' });
    setRecordModalOpen(true);
  };

  const openEditRecordModal = (record: AttendanceRecord) => {
    setCurrentRecord(record);
    setRecordModalOpen(true);
  };

  const handleSaveRecord = () => {
    if (!currentRecord || !currentRecord.date || !currentRecord.note) return;
    if(currentRecord.id) { // Editing existing
      updateAttendanceRecord(classId, studentId, currentRecord.id, currentRecord.date, currentRecord.note);
    } else { // Adding new
      addSingleAttendanceRecord(classId, studentId, currentRecord.date, currentRecord.note);
    }
    setRecordModalOpen(false);
    setCurrentRecord(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="flex items-center justify-between mb-6">
        <button onClick={() => navigateToClass(classId)} className="flex items-center text-blue-600 hover:text-blue-800 font-medium">
          <ChevronLeftIcon className="w-5 h-5 mr-1" />
          Trở lại danh sách lớp
        </button>
      </header>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">{student.name}</h1>
                <p className="text-sm text-gray-500">Lớp: {classroom.name}</p>
            </div>
            {!isEditing && (
                <button onClick={() => setIsEditing(true)} className="flex items-center px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm">
                    <EditIcon className="w-4 h-4 mr-1" /> Sửa
                </button>
            )}
        </div>

        {isEditing ? (
            <div className="mt-4 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                    <input type="text" value={editedName} onChange={e => setEditedName(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md"/>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú chung</label>
                    <textarea value={editedNotes} onChange={e => setEditedNotes(e.target.value)} rows={3} className="w-full p-2 border border-gray-300 rounded-md"></textarea>
                </div>
                <div className="flex space-x-2">
                    <button onClick={handleSaveDetails} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Lưu thay đổi</button>
                    <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">Hủy</button>
                </div>
            </div>
        ) : (
            <div className="mt-4">
                <h3 className="font-semibold text-gray-700">Ghi chú chung:</h3>
                <p className="text-gray-600 mt-1 whitespace-pre-wrap">{student.generalNotes || 'Không có ghi chú.'}</p>
            </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
             <h2 className="text-xl font-bold text-gray-800">Lịch sử điểm danh</h2>
             <p className="text-gray-600">Tổng số buổi có ghi chú: {student.attendance.length}</p>
          </div>
          <button onClick={openNewRecordModal} className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">
            <PlusIcon className="w-5 h-5 mr-2" /> Thêm ghi chú
          </button>
        </div>
        
        <div className="space-y-3">
          {student.attendance.length > 0 ? (
            [...student.attendance].sort((a, b) => b.date.localeCompare(a.date)).map(record => (
              <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border">
                <div className="flex items-center">
                  <CalendarIcon className="w-5 h-5 mr-3 text-gray-500"/>
                  <div>
                    <p className="font-semibold text-gray-800">{record.date}</p>
                    <p className="text-gray-600">{record.note}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => openEditRecordModal(record)} className="p-1.5 text-gray-500 hover:text-blue-600"><EditIcon className="w-5 h-5"/></button>
                  <button onClick={() => deleteAttendanceRecord(classId, studentId, record.id)} className="p-1.5 text-gray-500 hover:text-red-600"><TrashIcon className="w-5 h-5"/></button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-4">Chưa có ghi chú điểm danh nào.</p>
          )}
        </div>
      </div>

      <Modal isOpen={isRecordModalOpen} onClose={() => setRecordModalOpen(false)} title={currentRecord?.id ? "Sửa ghi chú" : "Thêm ghi chú mới"}>
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày</label>
                <input type="date" value={currentRecord?.date || ''} onChange={e => setCurrentRecord(prev => ({...prev, date: e.target.value}))} className="w-full p-2 border border-gray-300 rounded-md"/>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung ghi chú</label>
                <input type="text" placeholder="Vắng có phép, đi trễ,..." value={currentRecord?.note || ''} onChange={e => setCurrentRecord(prev => ({...prev, note: e.target.value}))} className="w-full p-2 border border-gray-300 rounded-md"/>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
                <button onClick={() => setRecordModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">Hủy</button>
                <button onClick={handleSaveRecord} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Lưu</button>
            </div>
        </div>
      </Modal>
    </div>
  );
};

export default StudentDetailPage;
