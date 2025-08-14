
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Classroom, Student } from '../types';
import { PlusIcon, TrashIcon, ChevronLeftIcon, CheckSquareIcon, RefreshCwIcon } from '../components/Icons';
import Modal from '../components/Modal';

interface StudentListPageProps {
  classId: string;
}

const StudentListPage = ({ classId }: StudentListPageProps) => {
  const { classrooms, navigateHome, navigateToStudent, addStudent, deleteStudent, addAttendanceRecords } = useAppContext();
  
  const classroom = useMemo(() => classrooms.find(c => c.id === classId), [classrooms, classId]);

  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceNote, setAttendanceNote] = useState('');
  const [isNoteVisible, setIsNoteVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');

  if (!classroom) {
    return <div className="p-4 text-center text-red-500">Lớp học không tìm thấy.</div>;
  }
  
  const handleSelectStudent = (studentId: string) => {
    setSelectedStudentIds(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudentIds.length === classroom.students.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(classroom.students.map(s => s.id));
    }
  };

  const handleInvertSelection = () => {
    const allIds = classroom.students.map(s => s.id);
    setSelectedStudentIds(allIds.filter(id => !selectedStudentIds.includes(id)));
  };

  const handleAddStudent = () => {
    if (newStudentName.trim()) {
      addStudent(classId, newStudentName.trim());
      setNewStudentName('');
      setIsModalOpen(false);
    }
  };
  
  const handleDeleteSelected = () => {
    if (window.confirm(`Bạn có chắc muốn xoá ${selectedStudentIds.length} học sinh đã chọn?`)) {
      selectedStudentIds.forEach(id => deleteStudent(classId, id));
      setSelectedStudentIds([]);
    }
  };

  const handleConfirmAttendance = () => {
    if (attendanceNote.trim() && selectedStudentIds.length > 0) {
      addAttendanceRecords(classId, selectedStudentIds, attendanceDate, attendanceNote);
      setAttendanceNote('');
      setSelectedStudentIds([]);
      setIsNoteVisible(false);
    } else {
        alert("Vui lòng chọn ít nhất một học sinh và nhập ghi chú.");
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="flex items-center justify-between mb-4">
        <button onClick={navigateHome} className="flex items-center text-blue-600 hover:text-blue-800 font-medium">
          <ChevronLeftIcon className="w-5 h-5 mr-1" />
          Tất cả lớp học
        </button>
      </header>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="border-b pb-4 mb-4">
          <h1 className="text-3xl font-bold text-gray-800">{classroom.name}</h1>
          <p className="text-gray-500">Sĩ số: {classroom.students.length}</p>
        </div>

        <div className="flex flex-wrap gap-2 items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
           <div className="flex flex-wrap gap-2">
              <button onClick={() => setIsModalOpen(true)} className="flex items-center px-3 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600"><PlusIcon className="w-4 h-4 mr-1" /> Thêm học sinh</button>
              <button onClick={handleDeleteSelected} disabled={selectedStudentIds.length === 0} className="flex items-center px-3 py-2 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 disabled:bg-red-300"><TrashIcon className="w-4 h-4 mr-1" /> Xoá đã chọn</button>
              <button onClick={handleSelectAll} className="flex items-center px-3 py-2 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300"><CheckSquareIcon className="w-4 h-4 mr-1" /> Chọn tất cả</button>
              <button onClick={handleInvertSelection} className="flex items-center px-3 py-2 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300"><RefreshCwIcon className="w-4 h-4 mr-1" /> Đảo ngược chọn</button>
           </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-center mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex-grow">
            <label htmlFor="attendance-date" className="text-sm font-medium text-gray-700 mr-2">Ngày điểm danh:</label>
            <input type="date" id="attendance-date" value={attendanceDate} onChange={e => setAttendanceDate(e.target.value)} className="p-2 border border-gray-300 rounded-md"/>
          </div>
          <button onClick={() => setIsNoteVisible(true)} disabled={selectedStudentIds.length === 0} className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-green-300">
            <PlusIcon className="w-5 h-5 mr-2"/> Thêm mới đánh vắng ({selectedStudentIds.length})
          </button>
        </div>

        {isNoteVisible && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg animate-fade-in">
            <h3 className="font-semibold mb-2">Ghi chú cho {selectedStudentIds.length} học sinh đã chọn vào ngày {attendanceDate}:</h3>
            <div className="flex flex-col sm:flex-row gap-2">
              <input type="text" value={attendanceNote} onChange={e => setAttendanceNote(e.target.value)} placeholder="Nhập ghi chú, ví dụ: Vắng có phép" className="flex-grow p-2 border border-gray-300 rounded-md"/>
              <button onClick={handleConfirmAttendance} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Xác nhận</button>
              <button onClick={() => setIsNoteVisible(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">Hủy</button>
            </div>
          </div>
        )}

        <ul className="space-y-2">
          {classroom.students.map(student => (
            <li key={student.id} className="flex items-center p-3 rounded-md hover:bg-gray-100 transition-colors duration-150">
              <input type="checkbox" checked={selectedStudentIds.includes(student.id)} onChange={() => handleSelectStudent(student.id)} className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-4"/>
              <div className="flex-grow cursor-pointer" onClick={() => navigateToStudent(classId, student.id)}>
                <p className="font-semibold text-gray-800">{student.name}</p>
                <p className="text-sm text-gray-500">Số buổi có ghi chú: {student.attendance.length}</p>
              </div>
            </li>
          ))}
          {classroom.students.length === 0 && <p className="text-center text-gray-500 py-4">Chưa có học sinh nào trong lớp. Hãy thêm học sinh mới.</p>}
        </ul>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Thêm học sinh mới">
        <div className="space-y-4">
          <div>
            <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 mb-1">Họ và tên học sinh</label>
            <input type="text" id="studentName" value={newStudentName} onChange={e => setNewStudentName(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" placeholder="Nguyễn Văn A"/>
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">Hủy</button>
            <button onClick={handleAddStudent} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Thêm</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StudentListPage;
