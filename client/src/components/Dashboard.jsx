import { useState, useEffect } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await API.get('/dashboard/stats');
      setStats(response.data.stats);
    } catch (err) {
      setError('Failed to load dashboard data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // =============================================
  // Overdue Calculation (client-side verification)
  // =============================================
  const getOverdueTasks = () => {
    if (!stats?.overdue_tasks) return [];
    return stats.overdue_tasks.filter(task => {
      return new Date(task.due_date) < new Date() && task.status !== 'Completed';
    });
  };

  const getCompletionPercentage = () => {
    if (!stats || stats.total === 0) return 0;
    return Math.round((stats.completed / stats.total) * 100);
  };

  const getDaysOverdue = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = now - due;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getPriorityColor = (priority) => {
    const colors = {
      Low: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
      Medium: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
      High: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
      Critical: 'text-red-400 bg-red-400/10 border-red-400/20',
    };
    return colors[priority] || colors.Medium;
  };

  const getStatusColor = (status) => {
    const colors = {
      Pending: 'text-amber-400 bg-amber-400/10',
      'In Progress': 'text-blue-400 bg-blue-400/10',
      Completed: 'text-emerald-400 bg-emerald-400/10',
    };
    return colors[status] || colors.Pending;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 loading-shimmer rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 loading-shimmer rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 loading-shimmer rounded-2xl" />
          <div className="h-80 loading-shimmer rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-dark-300">{error}</p>
          <button onClick={fetchStats} className="btn-primary mt-4">Retry</button>
        </div>
      </div>
    );
  }

  const overdueTasks = getOverdueTasks();
  const completionPct = getCompletionPercentage();

  // Stats cards data
  const statCards = [
    {
      label: 'Total Tasks',
      value: stats?.total || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      gradient: 'from-blue-500 to-cyan-500',
      shadowColor: 'shadow-blue-500/20',
    },
    {
      label: 'Completed',
      value: stats?.completed || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: 'from-emerald-500 to-green-500',
      shadowColor: 'shadow-emerald-500/20',
    },
    {
      label: 'Pending',
      value: stats?.pending || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: 'from-amber-500 to-orange-500',
      shadowColor: 'shadow-amber-500/20',
    },
    {
      label: 'Overdue',
      value: stats?.overdue || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
      gradient: 'from-red-500 to-rose-500',
      shadowColor: 'shadow-red-500/20',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-100">
            Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="text-dark-400 mt-1 text-sm">Here's what's happening with your projects today.</p>
        </div>
        <button onClick={fetchStats} className="btn-secondary flex items-center gap-2" id="refresh-dashboard">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, i) => (
          <div
            key={card.label}
            className={`glass rounded-2xl p-5 card-hover animate-slide-up stagger-${i + 1}`}
            id={`stat-card-${card.label.toLowerCase().replace(/\s/g, '-')}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-dark-400 text-sm font-medium">{card.label}</p>
                <p className="text-3xl font-bold text-dark-100 mt-2">{card.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white shadow-lg ${card.shadowColor}`}>
                {card.icon}
              </div>
            </div>
            {card.label === 'Completed' && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-dark-400">Completion Rate</span>
                  <span className="text-emerald-400 font-semibold">{completionPct}%</span>
                </div>
                <div className="w-full h-2 bg-dark-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${completionPct}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Two Column Layout: Overdue Alerts & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overdue Tasks Alert Panel */}
        <div className="glass rounded-2xl p-6 animate-slide-up stagger-3" id="overdue-panel">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-dark-100">Overdue Tasks</h2>
              <p className="text-dark-500 text-xs">{overdueTasks.length} task{overdueTasks.length !== 1 ? 's' : ''} past deadline</p>
            </div>
          </div>

          {overdueTasks.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-dark-400 text-sm font-medium">All caught up!</p>
              <p className="text-dark-500 text-xs mt-1">No overdue tasks</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {overdueTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 hover:border-red-500/25 transition-all duration-200"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-dark-100 truncate">{task.title}</p>
                      <p className="text-xs text-dark-500 mt-1">{task.project_name}</p>
                    </div>
                    <span className={`badge border ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1.5 text-red-400">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-xs font-semibold">{getDaysOverdue(task.due_date)} day{getDaysOverdue(task.due_date) !== 1 ? 's' : ''} overdue</span>
                    </div>
                    {task.assigned_to_name && (
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                          style={{ backgroundColor: task.assigned_to_color || '#6366f1' }}
                        >
                          {task.assigned_to_name.charAt(0)}
                        </div>
                        <span className="text-xs text-dark-400">{task.assigned_to_name}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="glass rounded-2xl p-6 animate-slide-up stagger-4" id="recent-activity">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-dark-100">Recent Tasks</h2>
              <p className="text-dark-500 text-xs">Latest activity across projects</p>
            </div>
          </div>

          <div className="space-y-3">
            {stats?.recent_tasks?.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-dark-800/40 transition-all duration-200"
              >
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  task.status === 'Completed' ? 'bg-emerald-400' :
                  task.status === 'In Progress' ? 'bg-blue-400' : 'bg-amber-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-dark-200 truncate">{task.title}</p>
                  <p className="text-xs text-dark-500">{task.project_name}</p>
                </div>
                <span className={`badge ${getStatusColor(task.status)}`}>
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Project Progress */}
      {stats?.project_stats?.length > 0 && (
        <div className="glass rounded-2xl p-6 animate-slide-up stagger-5" id="project-progress">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-dark-100">Project Progress</h2>
              <p className="text-dark-500 text-xs">Completion rates across all projects</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.project_stats.map((project) => {
              const pct = project.task_count > 0
                ? Math.round((project.completed_count / project.task_count) * 100)
                : 0;
              return (
                <div key={project.id} className="p-4 rounded-xl bg-dark-800/30 border border-dark-700/30 card-hover">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-dark-200 truncate">{project.name}</h3>
                    <span className={`badge ${
                      project.status === 'Active' ? 'text-emerald-400 bg-emerald-400/10' :
                      project.status === 'On Hold' ? 'text-amber-400 bg-amber-400/10' :
                      'text-blue-400 bg-blue-400/10'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-dark-400">{project.completed_count}/{project.task_count} tasks</span>
                    <span className="text-primary-400 font-semibold">{pct}%</span>
                  </div>
                  <div className="w-full h-2 bg-dark-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-500 to-purple-500 rounded-full transition-all duration-1000"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
