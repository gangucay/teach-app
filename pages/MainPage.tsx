
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Classroom } from '../types';
import Modal from '../components/Modal';
import { PlusIcon, EditIcon, TrashIcon, UsersIcon, CalendarIcon } from '../components/Icons';

const ClassroomCard = ({ classroom }: { classroom: Classroom }) => {
  const { navigateToClass, deleteClassroom } = useAppContext();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if(window.confirm(`Bạn có chắc muốn xoá lớp "${classroom.name}" không? Mọi dữ liệu học sinh sẽ bị mất.`)){
      deleteClassroom(classroom.id);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditModalOpen(true);
  };

  return (
    <>
      <div 
        onClick={() => navigateToClass(classroom.id)}
        className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer p-5 flex flex-col justify-between border-l-4 border-blue-500"
      >
        <div>
            <h2 className="text-xl font-bold text-gray-800 truncate">{classroom.name}</h2>
            <div className="text-gray-600 mt-2 space-y-1 text-sm">
                <div className="flex items-center">
                    <UsersIcon className="w-4 h-4 mr-2 text-gray-500"/>
                    <span>Sĩ số: {classroom.students.length}</span>
                </div>
                <div className="flex items-center">
                    <CalendarIcon className="w-4 h-4 mr-2 text-gray-500"/>
                    <span>Lịch học: {classroom.schedule}</span>
                </div>
            </div>
        </div>
        <div className="flex justify-end space-x-2 mt-4">
            <button onClick={handleEdit} className="p-2 text-gray-500 hover:text-blue-600"><EditIcon className="w-5 h-5"/></button>
            <button onClick={handleDelete} className="p-2 text-gray-500 hover:text-red-600"><TrashIcon className="w-5 h-5"/></button>
        </div>
      </div>
      {isEditModalOpen && <ClassroomModal classroom={classroom} onClose={() => setIsEditModalOpen(false)} />}
    </>
  );
};

const ClassroomModal = ({ classroom, onClose }: { classroom?: Classroom, onClose: () => void }) => {
    const { addClassroom, updateClassroom } = useAppContext();
    const [name, setName] = useState(classroom?.name || '');
    const [schedule, setSchedule] = useState(classroom?.schedule || '');

    const handleSubmit = () => {
        if (name.trim() && schedule.trim()){
            if(classroom) {
                updateClassroom(classroom.id, name, schedule);
            } else {
                addClassroom(name, schedule);
            }
            onClose();
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={classroom ? "Sửa thông tin lớp" : "Thêm lớp mới"}>
            <div className="space-y-4">
                <div>
                    <label htmlFor="className" className="block text-sm font-medium text-gray-700 mb-1">Tên lớp</label>
                    <input type="text" id="className" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" placeholder="Ví dụ: Lớp 10A1"/>
                </div>
                <div>
                    <label htmlFor="classSchedule" className="block text-sm font-medium text-gray-700 mb-1">Lịch học</label>
                    <input type="text" id="classSchedule" value={schedule} onChange={e => setSchedule(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" placeholder="Ví dụ: Thứ 2, 4, 6 - 7:00 AM"/>
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">Hủy</button>
                    <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Lưu</button>
                </div>
            </div>
        </Modal>
    );
};


const MainPage = () => {
  const { classrooms } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
        <header className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Danh sách Lớp học</h1>
            <button onClick={() => setIsModalOpen(true)} className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors">
                <PlusIcon className="w-5 h-5 mr-2"/>
                Thêm lớp
            </button>
        </header>
        
        {classrooms.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {classrooms.map(c => <ClassroomCard key={c.id} classroom={c} />)}
            </div>
        ) : (
            <div className="text-center py-16 px-6 bg-white rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-700">Chưa có lớp học nào</h3>
                <p className="text-gray-500 mt-2">Bắt đầu bằng cách thêm lớp học đầu tiên của bạn.</p>
                <button onClick={() => setIsModalOpen(true)} className="mt-6 flex items-center mx-auto bg-blue-600 text-white px-5 py-2.5 rounded-lg shadow hover:bg-blue-700 transition-colors">
                    <PlusIcon className="w-5 h-5 mr-2"/>
                    Thêm lớp ngay
                </button>
            </div>
        )}

        {isModalOpen && <ClassroomModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};

export default MainPage;
