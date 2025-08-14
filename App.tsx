
import React from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import MainPage from './pages/MainPage';
import StudentListPage from './pages/StudentListPage';
import StudentDetailPage from './pages/StudentDetailPage';

const LoadingSpinner = () => (
    <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
    </div>
);

const AppContent = () => {
    const { view, isLoading, error } = useAppContext();

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <div className="p-4 text-center text-red-500 bg-red-100 rounded-md m-4">{error}</div>;
    }
    
    const renderContent = () => {
        switch (view.page) {
            case 'classDetails':
                return view.classId ? <StudentListPage classId={view.classId} /> : <MainPage />;
            case 'studentDetails':
                return (view.classId && view.studentId) ? <StudentDetailPage classId={view.classId} studentId={view.studentId} /> : <MainPage />;
            case 'main':
            default:
                return <MainPage />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <main>
                {renderContent()}
            </main>
        </div>
    );
}

const App = () => {
  return (
    <AppProvider>
        <div className="antialiased text-slate-800">
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <h1 className="text-2xl font-bold text-blue-600">TeachApp</h1>
                        <p className="text-sm text-gray-500">Ứng dụng điểm danh học sinh</p>
                    </div>
                </div>
            </header>
            <AppContent />
        </div>
    </AppProvider>
  );
};

export default App;
