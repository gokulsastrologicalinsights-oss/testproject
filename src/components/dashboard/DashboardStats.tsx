'use client';

export default function DashboardStats() {
  const statsList = [
    { label: 'Views (7d)', value: '48', change: '+12%', changeType: 'positive' },
    { label: 'Requests', value: '1', change: 'Active', changeType: 'neutral' },
    { label: 'Shortlists', value: '12', change: 'Total', changeType: 'neutral' },
    { label: 'Plan Validity', value: '92 Days', change: 'Gold Elite', changeType: 'gold' }
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {statsList.map((stat, idx) => (
        <div 
          key={idx} 
          className="bg-white dark:bg-zinc-900 p-5 rounded-2xl shadow-sm border border-sandal-200 dark:border-zinc-800/80 flex flex-col justify-between text-left"
        >
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{stat.label}</span>
          <div className="flex items-baseline gap-1 mt-4">
            <span className={`font-mono font-bold ${stat.value.includes('Days') ? 'text-sm text-gold-650' : 'text-3xl text-zinc-850 dark:text-zinc-100'}`}>
              {stat.value}
            </span>
            {stat.changeType === 'positive' && (
              <span className="text-xs text-emerald-600 font-semibold">{stat.change}</span>
            )}
            {stat.changeType === 'neutral' && (
              <span className="text-xs text-zinc-400 font-semibold">{stat.change}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
