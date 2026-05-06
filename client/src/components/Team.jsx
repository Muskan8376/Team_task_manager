import { useState, useEffect } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ConfirmDialog from './ConfirmDialog';
import toast from 'react-hot-toast';

const Team = () => {
  const { user, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await API.get('/users');
      setUsers(res.data.users || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const confirmDelete = (member) => {
    setUserToDelete(member);
  };

  const executeDelete = async () => {
    if (!userToDelete) return;
    try {
      await API.delete(`/users/${userToDelete.id}`);
      fetchUsers();
      toast.success('Member removed successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete member');
    } finally {
      setUserToDelete(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-dark-100">Team Members</h1>
        <p className="text-dark-400 text-sm mt-1">{users.length} member{users.length !== 1 ? 's' : ''}</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => <div key={i} className="h-32 loading-shimmer rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {users.map(u => (
            <div key={u.id} className="glass rounded-2xl p-5 card-hover">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg" style={{ backgroundColor: u.avatar_color || '#6366f1' }}>
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-dark-100 truncate">{u.name}</h3>
                  <p className="text-dark-500 text-sm truncate">{u.email}</p>
                </div>
                <span className={`badge ${u.role === 'Admin' ? 'text-primary-400 bg-primary-400/10' : 'text-dark-400 bg-dark-700/50'}`}>{u.role}</span>
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-dark-700/30">
                <span className="text-xs text-dark-500">Joined {new Date(u.created_at).toLocaleDateString()}</span>
                {isAdmin && u.id !== user.id && (
                  <button onClick={() => confirmDelete(u)} className="p-2 rounded-lg hover:bg-red-500/10 text-dark-500 hover:text-red-400 transition-all" title="Remove Member">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog 
        isOpen={!!userToDelete}
        title="Remove Member"
        message={`Are you sure you want to remove "${userToDelete?.name}"? They will lose access to the system and all their tasks will be unassigned.`}
        onConfirm={executeDelete}
        onCancel={() => setUserToDelete(null)}
        confirmText="Remove Member"
      />
    </div>
  );
};

export default Team;
