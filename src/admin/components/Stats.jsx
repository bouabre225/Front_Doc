import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({
  icon, title, value, color = '#1DBF73',
  bgColor = 'rgba(29, 191, 115, 0.1)', trend, trendValue
}) {
  const Icon = icon;
  return (
    <div className='p-5 transition-all bg-white border border-gray-100 shadow-sm rounded-xl hover:shadow-md group'>
      <div className='flex items-start justify-between'>
        <div className='flex-1 min-w-0'>
          <p className='mb-1 text-xs font-medium text-gray-500 truncate'>{title}</p>
          <h3 className='mb-2 text-2xl font-bold text-gray-800'>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </h3>
          {trend && trendValue && (
            <div className='flex items-center gap-1'>
              {trend === 'up'
                ? <TrendingUp className='w-3.5 h-3.5 text-green-500' />
                : <TrendingDown className='w-3.5 h-3.5 text-red-500' />}
              <span className={`text-xs font-semibold ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {trend === 'up' ? '+' : '-'}{trendValue}%
              </span>
              <span className='text-xs text-gray-400'>ce mois</span>
            </div>
          )}
        </div>
        <div className='p-2.5 rounded-xl flex-shrink-0 transition-transform group-hover:scale-110'
          style={{ backgroundColor: bgColor }}>
          <Icon className='w-5 h-5' style={{ color }} />
        </div>
      </div>
    </div>
  );
}