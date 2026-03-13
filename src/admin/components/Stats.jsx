import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ 
  icon, 
  title, 
  value, 
  color = '#1DBF73', 
  bgColor = 'rgba(29, 191, 115, 0.1)', 
  trend,
  trendValue 
}) {
  const Icon = icon;
  
  return (
    <div className="p-6 transition-all bg-white border border-gray-200 shadow-md rounded-xl hover:shadow-lg group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="mb-1 text-sm font-medium text-gray-500">
            {title}
          </p>
          <h3 className="mb-2 text-3xl font-bold text-gray-800">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </h3>
          {trend && trendValue && (
            <div className="flex items-center gap-1">
              {trend === 'up' ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span 
                className={`text-xs font-medium ${
                  trend === 'up' ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {trend === 'up' ? '+' : '-'}{trendValue}%
              </span>
              <span className="text-xs text-gray-500">
                ce mois
              </span>
            </div>
          )}
        </div>
        <div 
          className="p-3 transition-transform rounded-xl group-hover:scale-110"
          style={{ backgroundColor: bgColor }}
        >
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
      </div>
    </div>
  );
}