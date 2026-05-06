import { useState, useEffect } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import TaskForm from './TaskForm';
import ConfirmDialog from './ConfirmDialog';
import toast from 'react-hot-toast';

const TaskList = () => {
  const { isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [filter, setFilter] = useState({ status: '', priority: '', overdue: '' });
  const [taskToDelete, setTaskToDelete] = useState(null);

  useEffect(() => { fetchTasks(); }, [filter]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter.status) params.append('status', filter.status);
      if (filter.priority) params.append('priority', filter.priority);
      if (filter.overdue) params.append('overdue', filter.overdue);
      const res = await API.get(`/tasks?${params.toString()}`);
      setTasks(res.data.tasks || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const confirmDelete = (task) => {
    setTaskToDelete(task);
  };

  const executeDelete = async () => {
    if (!taskToDelete) return;
    try {
      await API.delete(`/tasks/${taskToDelete.id}`);
      fetchTasks();
      toast.success('Task deleted successfully');
    } catch (err) { 
      toast.error(err.response?.data?.message || 'Failed to delete task'); 
    } finally {
      setTaskToDelete(null);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await API.put(`/tasks/${id}`, { status });
      fetchTasks();
    } catch (err) { console.error(err); }
  };

  const getPriorityStyle = (p) => {
    const m = { Low: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', Medium: 'text-amber-400 bg-amber-400/10 border-amber-400/20', High: 'text-orange-400 bg-orange-400/10 border-orange-400/20', Critical: 'text-red-400 bg-red-400/10 border-red-400/20' };
    return m[p] || m.Medium;
  };
  const getStatusStyle = (s) => {
    const m = { Pending: 'text-amber-400 bg-amber-400/10', 'In Progress': 'text-blue-400 bg-blue-400/10', Completed: 'text-emerald-400 bg-emerald-400/10' };
    return m[s] || m.Pending;
  };
  const isOverdue = (t) => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'Completed';

  const Arrow = () => (
    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
      <svg className="w-4 h-4 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-100">Tasks</h1>
          <p className="text-dark-400 text-sm mt-1">{tasks.length} task{tasks.length !== 1 ? 's' : ''} total</p>
        </div>
        {isAdmin && (
          <button onClick={() => { setEditTask(null); setShowForm(true); }} className="btn-primary flex items-center gap-2" id="create-task-btn">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            New Task
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <select value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value }))} className="select-field text-sm py-2 pl-3 pr-8 w-40" id="filter-status">
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
          <Arrow />
        </div>
        <div className="relative">
          <select value={filter.priority} onChange={e => setFilter(f => ({ ...f, priority: e.target.value }))} className="select-field text-sm py-2 pl-3 pr-8 w-40" id="filter-priority">
            <option value="">All Priority</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
          <Arrow />
        </div>
        <button onClick={() => setFilter(f => ({ ...f, overdue: f.overdue ? '' : 'true' }))}
          className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${filter.overdue ? 'bg-red-500/20 border-red-500/30 text-red-400' : 'bg-dark-800/60 border-dark-600/50 text-dark-400 hover:text-dark-200'}`} id="filter-overdue">
          🔥 Overdue Only
        </button>
      </div>

      {/* Task List */}
      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-24 loading-shimmer rounded-2xl" />)}</div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-20 glass rounded-2xl">
          <div className="w-16 h-16 rounded-2xl bg-dark-700/50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-dark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          </div>
          <p className="text-dark-400 font-medium">No tasks found</p>
          <p className="text-dark-500 text-sm mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map(task => (
            <div key={task.id} className={`glass rounded-2xl p-5 card-hover ${isOverdue(task) ? 'border-red-500/20' : ''}`}>
              <div className="flex items-start gap-4">
                {/* Status checkbox */}
                <button onClick={() => handleStatusChange(task.id, task.status === 'Completed' ? 'Pending' : 'Completed')}
                  className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${task.status === 'Completed' ? 'bg-emerald-500 border-emerald-500' : 'border-dark-500 hover:border-primary-400'}`}>
                  {task.status === 'Completed' && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className={`font-semibold text-dark-100 ${task.status === 'Completed' ? 'line-through opacity-60' : ''}`}>{task.title}</h3>
                      {task.description && <p className="text-dark-400 text-sm mt-1 line-clamp-2">{task.description}</p>}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`badge border ${getPriorityStyle(task.priority)}`}>{task.priority}</span>
                      <span className={`badge ${getStatusStyle(task.status)}`}>{task.status}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-3 flex-wrap">
                    {task.project_name && (
                      <span className="text-xs text-dark-500 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                        {task.project_name}
                      </span>
                    )}
                    {task.due_date && (
                      <span className={`text-xs flex items-center gap-1 ${isOverdue(task) ? 'text-red-400 font-semibold' : 'text-dark-500'}`}>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        {new Date(task.due_date).toLocaleDateString()} {isOverdue(task) && '(Overdue!)'}
                      </span>
                    )}
                    {task.assigned_to_name && (
                      <span className="text-xs text-dark-500 flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] font-bold" style={{ backgroundColor: task.assigned_to_color || '#6366f1' }}>{task.assigned_to_name.charAt(0)}</div>
                        {task.assigned_to_name}
                      </span>
                    )}
                    {isAdmin && (
                      <div className="ml-auto flex items-center gap-1">
                        <button onClick={() => { setEditTask(task); setShowForm(true); }} className="p-1.5 rounded-lg hover:bg-dark-700/50 text-dark-500 hover:text-primary-400 transition-all" title="Edit">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button onClick={() => confirmDelete(task)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-dark-500 hover:text-red-400 transition-all" title="Delete">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && <TaskForm task={editTask} onClose={() => setShowForm(false)} onSaved={fetchTasks} />}
      
      <ConfirmDialog 
        isOpen={!!taskToDelete}
        title="Delete Task"
        message={`Are you sure you want to delete "${taskToDelete?.title}"? This action cannot be undone.`}
        onConfirm={executeDelete}
        onCancel={() => setTaskToDelete(null)}
        confirmText="Delete Task"
      />
    </div>
  );
};

export default TaskList;
