import { useState, useEffect } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ConfirmDialog from './ConfirmDialog';
import toast from 'react-hot-toast';

const ProjectList = () => {
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', status: 'Active' });
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await API.get('/projects');
      setProjects(res.data.projects || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await API.post('/projects', formData);
      setShowForm(false);
      setFormData({ name: '', description: '', status: 'Active' });
      fetchProjects();
    } catch (err) { setError(err.response?.data?.message || 'Failed'); }
    finally { setFormLoading(false); }
  };

  const confirmDelete = (project) => {
    setProjectToDelete(project);
  };

  const executeDelete = async () => {
    if (!projectToDelete) return;
    try {
      await API.delete(`/projects/${projectToDelete.id}`);
      fetchProjects();
      toast.success('Project deleted successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete project');
    } finally {
      setProjectToDelete(null);
    }
  };

  const getStatusColor = (s) => {
    const m = { Active: 'text-emerald-400 bg-emerald-400/10', 'On Hold': 'text-amber-400 bg-amber-400/10', Completed: 'text-blue-400 bg-blue-400/10' };
    return m[s] || m.Active;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-100">Projects</h1>
          <p className="text-dark-400 text-sm mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2" id="create-project-btn">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            New Project
          </button>
        )}
      </div>

      {/* Create Project Form */}
      {showForm && isAdmin && (
        <div className="glass rounded-2xl p-6 animate-slide-up">
          <h3 className="text-lg font-bold text-dark-100 mb-4">Create Project</h3>
          {error && <div className="mb-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1.5">Name *</label>
              <input type="text" value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} className="input-field" placeholder="Project name" required id="project-name-input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1.5">Description</label>
              <textarea value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} className="input-field min-h-[80px] resize-none" placeholder="Describe this project..." id="project-desc-input" />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={formLoading} className="btn-primary" id="save-project-btn">{formLoading ? 'Creating...' : 'Create Project'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => <div key={i} className="h-48 loading-shimmer rounded-2xl" />)}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 glass rounded-2xl">
          <p className="text-dark-400 font-medium">No projects yet</p>
          <p className="text-dark-500 text-sm mt-1">Create your first project to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map(project => {
            const pct = project.task_count > 0 ? Math.round((project.completed_count / project.task_count) * 100) : 0;
            return (
              <div key={project.id} className="glass rounded-2xl p-5 card-hover">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/20 to-purple-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                  </div>
                  <span className={`badge ${getStatusColor(project.status)}`}>{project.status}</span>
                </div>
                <h3 className="font-bold text-dark-100 mb-1">{project.name}</h3>
                {project.description && <p className="text-dark-400 text-sm line-clamp-2 mb-4">{project.description}</p>}
                <div className="mt-auto">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-dark-400">{project.completed_count}/{project.task_count} tasks</span>
                    <span className="text-primary-400 font-semibold">{pct}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-dark-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary-500 to-purple-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex justify-end mt-3">
                    <button onClick={() => { setEditProject(project); setFormData(project); setShowForm(true); }} className="p-2 rounded-lg hover:bg-dark-700/50 text-dark-500 hover:text-primary-400 transition-all" title="Edit">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button onClick={() => confirmDelete(project)} className="p-2 rounded-lg hover:bg-red-500/10 text-dark-500 hover:text-red-400 transition-all" title="Delete">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog 
        isOpen={!!projectToDelete}
        title="Delete Project"
        message={`Are you sure you want to delete "${projectToDelete?.name}"? All associated tasks will also be permanently deleted.`}
        onConfirm={executeDelete}
        onCancel={() => setProjectToDelete(null)}
        confirmText="Delete Project"
      />
    </div>
  );
};

export default ProjectList;
