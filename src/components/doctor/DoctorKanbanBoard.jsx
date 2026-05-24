import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Calendar, Clock, User, FileText, X } from 'lucide-react';
import axios from 'axios';
import { useSelector } from 'react-redux';

const DoctorKanbanBoard = () => {
  const { token } = useSelector((state) => state.auth);
  const [data, setData] = useState({
    tasks: {},
    columns: {
      'column-1': { id: 'column-1', title: 'Upcoming', taskIds: [] },
      'column-2': { id: 'column-2', title: 'In Progress', taskIds: [] },
      'column-3': { id: 'column-3', title: 'Completed', taskIds: [] },
    },
    columnOrder: ['column-1', 'column-2', 'column-3'],
  });
  const [selectedTask, setSelectedTask] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/doctor/appointments', {
          headers: { Authorization: token }
        });

        if (response.data.success) {
          const appointments = response.data.appointments;
          
          const newTasks = {};
          const col1TaskIds = [];
          const col2TaskIds = [];
          const col3TaskIds = [];

          appointments.forEach(apt => {
            newTasks[apt.id] = {
              id: apt.id,
              patientName: apt.patient_name,
              time: apt.appointment_time,
              reason: apt.reason,
              age: apt.patient_age,
              gender: apt.patient_gender,
              contact: apt.patient_contact,
              status: apt.status
            };

            if (apt.status === 'Upcoming') col1TaskIds.push(apt.id);
            else if (apt.status === 'In Progress') col2TaskIds.push(apt.id);
            else if (apt.status === 'Completed') col3TaskIds.push(apt.id);
          });

          setData(prev => ({
            ...prev,
            tasks: newTasks,
            columns: {
              'column-1': { ...prev.columns['column-1'], taskIds: col1TaskIds },
              'column-2': { ...prev.columns['column-2'], taskIds: col2TaskIds },
              'column-3': { ...prev.columns['column-3'], taskIds: col3TaskIds },
            }
          }));
        }
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (token) fetchAppointments();
  }, [token]);

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const startColumn = data.columns[source.droppableId];
    const finishColumn = data.columns[destination.droppableId];

    // Optimistic UI update
    if (startColumn === finishColumn) {
      const newTaskIds = Array.from(startColumn.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newColumn = { ...startColumn, taskIds: newTaskIds };
      setData({ ...data, columns: { ...data.columns, [newColumn.id]: newColumn } });
      return;
    }

    const startTaskIds = Array.from(startColumn.taskIds);
    startTaskIds.splice(source.index, 1);
    const newStart = { ...startColumn, taskIds: startTaskIds };

    const finishTaskIds = Array.from(finishColumn.taskIds);
    finishTaskIds.splice(destination.index, 0, draggableId);
    const newFinish = { ...finishColumn, taskIds: finishTaskIds };

    setData({
      ...data,
      columns: { ...data.columns, [newStart.id]: newStart, [newFinish.id]: newFinish },
    });

    // Make API call to update status
    try {
      const newStatus = finishColumn.title; // 'Upcoming', 'In Progress', 'Completed'
      await axios.put(`http://localhost:5000/api/doctor/appointments/${draggableId}/status`, {
        status: newStatus
      }, {
        headers: { Authorization: token }
      });
    } catch (error) {
      console.error('Error updating status:', error);
      // Ideally revert the optimistic UI update here if it failed
    }
  };

  if (isLoading) {
    return <div className="h-full flex items-center justify-center text-gray-500">Loading appointments...</div>;
  }

  return (
    <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Appointments Board</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Drag and drop appointments to update their status.</p>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex flex-col md:flex-row gap-6 flex-1 overflow-x-auto pb-4">
          {data.columnOrder.map((columnId) => {
            const column = data.columns[columnId];
            const tasks = column.taskIds.map((taskId) => data.tasks[taskId]);

            return (
              <div key={column.id} className="flex-1 min-w-[300px] flex flex-col bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800 rounded-t-xl">
                  <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${
                      column.id === 'column-1' ? 'bg-blue-500' : 
                      column.id === 'column-2' ? 'bg-amber-500' : 'bg-green-500'
                    }`}></span>
                    {column.title}
                  </h3>
                  <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold px-2 py-1 rounded-full">
                    {tasks.length}
                  </span>
                </div>

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 p-4 space-y-4 transition-colors min-h-[150px] ${snapshot.isDraggingOver ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                    >
                      {tasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => setSelectedTask(task)}
                              className={`bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm cursor-pointer hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all ${
                                snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-500 rotate-2' : ''
                              }`}
                            >
                              <div className="flex justify-between items-start mb-3">
                                <h4 className="font-semibold text-gray-900 dark:text-white">{task.patientName}</h4>
                                <span className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-md">
                                  <Clock size={12} />
                                  {task.time}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <FileText size={14} className="shrink-0" />
                                <span className="truncate">{task.reason}</span>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Patient Details Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedTask(null)}>
          <div 
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <User className="text-blue-500" /> Patient Details
              </h3>
              <button 
                onClick={() => setSelectedTask(null)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 border-b border-gray-100 dark:border-gray-700 pb-4">
                <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-2xl font-bold">
                  {selectedTask.patientName.charAt(0)}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">{selectedTask.patientName}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{selectedTask.age || '-'} Yrs • {selectedTask.gender || '-'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Time</label>
                  <p className="text-gray-900 dark:text-white font-medium flex items-center gap-1 mt-1">
                    <Clock size={14} className="text-blue-500" /> {selectedTask.time}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact</label>
                  <p className="text-gray-900 dark:text-white font-medium mt-1">{selectedTask.contact || '-'}</p>
                </div>
                <div className="col-span-2 mt-2">
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reason for Visit</label>
                  <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700">
                    {selectedTask.reason || 'No reason provided'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorKanbanBoard;
