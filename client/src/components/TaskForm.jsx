import { useState, useEffect } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const TaskForm = ({ task, onClose, onSaved }) => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'Pending',
    priority: task?.priority || 'Medium',
    due_date: task?.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
    project_id: task?.project_id || '',
    assigned_to: task?.assigned_to || '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [uRes, pRes] = await Promise.all([API.get('/users'), API.get('/projects')]);
        setUsers(uRes.data.users || []);
        setProjects(pRes.data.projects || []);
      } catch (err) { console.error(err); }
    };
    load();
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = { ...formData, project_id: parseInt(formData.project_id), assigned_to: formData.assigned_to ? parseInt(formData.assigned_to) : null };
      if (task) await API.put(`/tasks/${task.id}`, payload);
      else await API.post('/tasks', payload);
      onSaved?.();
      onClose?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save task.');
    } finally { setLoading(false); }
  };

  const Arrow = () => (
    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
      <svg className="w-4 h-4 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up shadow-2xl" id="task-form-modal">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-dark-100">{task ? 'Edit Task' : 'Create New Task'}</h2>
            <p className="text-dark-500 text-sm mt-0.5">{task ? 'Update task details' : 'Add a new task to your project'}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-dark-700/50 text-dark-400 hover:text-dark-200 transition-all" id="close-task-form">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {error && <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">Task Title *</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} className="input-field" placeholder="e.g., Design landing page" required id="task-title-input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} className="input-field min-h-[80px] resize-none" placeholder="Describe the task..." rows={3} id="task-desc-input" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1.5">Status</label>
              <div className="relative">
                <select name="status" value={formData.status} onChange={handleChange} className="select-field" id="task-status-select">
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
                <Arrow />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1.5">Priority</label>
              <div className="relative">
                <select name="priority" value={formData.priority} onChange={handleChange} className="select-field" id="task-priority-select">
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
                <Arrow />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">Due Date</label>
            <input type="date" name="due_date" value={formData.due_date} onChange={handleChange} className="input-field" id="task-due-date" />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">Project *</label>
            <div className="relative">
              <select name="project_id" value={formData.project_id} onChange={handleChange} className="select-field" required id="task-project-select">
                <option value="">Select a project</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <Arrow />
            </div>
          </div>

          {/* ADMIN-ONLY: Assignment Dropdown */}
          {isAdmin && (
            <div className="animate-fade-in">
              <label className="block text-sm font-medium text-dark-300 mb-1.5">
                Assign To <span className="ml-2 badge text-primary-400 bg-primary-400/10">Admin</span>
              </label>
              <div className="relative">
                <select name="assigned_to" value={formData.assigned_to} onChange={handleChange} className="select-field" id="task-assign-select">
                  <option value="">Unassigned</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                </select>
                <Arrow />
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2" id="save-task-btn">
              {loading ? 'Saving...' : (task ? 'Update Task' : 'Create Task')}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
