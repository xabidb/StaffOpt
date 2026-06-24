import React, { useEffect, useState } from 'react';
import { TrendingUp, Users, Calendar, Sparkles, RefreshCw } from 'lucide-react';

export default function Dashboard() {
  const [forecasts, setForecasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchForecasts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/forecasts/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setForecasts(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/forecasts/generate?days=14', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setForecasts(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    fetchForecasts();
  }, []);

  // Compute metrics
  const totalForecasted = forecasts.reduce((acc, curr) => acc + curr.forecasted_footfall, 0);
  const avgFootfall = forecasts.length ? Math.round(totalForecasted / forecasts.length) : 0;
  const peakDay = forecasts.length
    ? [...forecasts].sort((a, b) => b.forecasted_footfall - a.forecasted_footfall)[0]
    : null;

  // Chart computations
  const maxFootfall = forecasts.length
    ? Math.max(...forecasts.map(f => Math.max(f.forecasted_footfall, f.actual_footfall || 0)))
    : 100;
  const chartHeight = 200;
  const chartWidth = 700;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-white">Footfall Forecasting</h2>
          <p className="text-slate-400 mt-1">Predict visitor peaks and optimize shift staffing</p>
        </div>
        
        {forecasts.length > 0 && (
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 py-2.5 px-4 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-medium transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
            Regenerate Data
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-96">
          <RefreshCw className="w-8 h-8 text-brand-500 animate-spin mb-4" />
          <p className="text-slate-400">Loading forecast data...</p>
        </div>
      ) : forecasts.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center flex flex-col items-center justify-center max-w-2xl mx-auto mt-12">
          <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 mb-6">
            <Sparkles className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">No Forecasting Data Available</h3>
          <p className="text-slate-400 mb-8 max-w-md">
            Generate mock forecasting footfall data to populate the scheduling matrix and explore trends.
          </p>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 py-3 px-6 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold transition-all shadow-lg shadow-brand-600/20"
          >
            {generating ? 'Generating...' : 'Bootstrap Forecast Data'}
          </button>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 rounded-xl">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Projected Footfall</p>
                  <h4 className="text-3xl font-extrabold text-white mt-2">{totalForecasted.toLocaleString()}</h4>
                </div>
                <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-4">Calculated across next 14 active days</p>
            </div>

            <div className="glass-card p-6 rounded-xl">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average Daily Visitors</p>
                  <h4 className="text-3xl font-extrabold text-white mt-2">{avgFootfall.toLocaleString()}</h4>
                </div>
                <div className="p-3 rounded-lg bg-brand-500/10 text-brand-400">
                  <Users className="w-6 h-6" />
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-4">Expected average load per shift</p>
            </div>

            <div className="glass-card p-6 rounded-xl">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Peak Footfall Day</p>
                  <h4 className="text-xl font-bold text-white mt-3">
                    {peakDay ? new Date(peakDay.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) : 'N/A'}
                  </h4>
                </div>
                <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400">
                  <Calendar className="w-6 h-6" />
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-4">
                {peakDay ? `Peak traffic volume of ${peakDay.forecasted_footfall} visitors` : ''}
              </p>
            </div>
          </div>

          {/* SVG Chart Panel */}
          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="text-lg font-bold text-white mb-6">Footfall Predictions vs. Actuals</h3>
            
            <div className="w-full overflow-x-auto">
              <svg viewBox={`0 0 ${chartWidth} 260`} className="w-full min-w-[650px] overflow-visible">
                {/* Y-axis gridlines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
                  const y = chartHeight * (1 - ratio);
                  const val = Math.round(maxFootfall * ratio);
                  return (
                    <g key={index} className="opacity-40">
                      <line x1="40" y1={y} x2={chartWidth} y2={y} stroke="#334155" strokeDasharray="4 4" />
                      <text x="30" y={y + 4} fill="#94a3b8" fontSize="10" textAnchor="end">{val}</text>
                    </g>
                  );
                })}

                {/* Draw bars */}
                {forecasts.map((f, i) => {
                  const x = 50 + i * ((chartWidth - 80) / forecasts.length);
                  const barWidth = ((chartWidth - 80) / forecasts.length) * 0.35;
                  
                  // Height calculations
                  const fHeight = (f.forecasted_footfall / maxFootfall) * chartHeight;
                  const fY = chartHeight - fHeight;
                  
                  const aHeight = f.actual_footfall ? (f.actual_footfall / maxFootfall) * chartHeight : 0;
                  const aY = chartHeight - aHeight;

                  return (
                    <g key={f.id}>
                      {/* Forecasted Footfall Bar */}
                      <rect
                        x={x}
                        y={fY}
                        width={barWidth}
                        height={fHeight}
                        fill="#0e90eb"
                        rx="2"
                        className="opacity-80 hover:opacity-100 transition-opacity cursor-help"
                      >
                        <title>{`Forecast: ${f.forecasted_footfall} visitors on ${f.date}`}</title>
                      </rect>
                      
                      {/* Actual Footfall Bar (if available) */}
                      {f.actual_footfall && (
                        <rect
                          x={x + barWidth + 2}
                          y={aY}
                          width={barWidth}
                          height={aHeight}
                          fill="#a855f7"
                          rx="2"
                          className="opacity-80 hover:opacity-100 transition-opacity cursor-help"
                        >
                          <title>{`Actual: ${f.actual_footfall} visitors on ${f.date}`}</title>
                        </rect>
                      )}

                      {/* X Axis label (date string) */}
                      <text
                        x={x + barWidth}
                        y={chartHeight + 20}
                        fill="#94a3b8"
                        fontSize="9"
                        textAnchor="middle"
                        transform={`rotate(-25, ${x + barWidth}, ${chartHeight + 20})`}
                      >
                        {new Date(f.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </text>
                    </g>
                  );
                })}
                
                {/* Bottom line */}
                <line x1="40" y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="#475569" />
              </svg>
            </div>
            
            {/* Chart Legend */}
            <div className="flex gap-6 mt-6 justify-center text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-brand-500 rounded"></span>
                <span className="text-slate-400">Forecasted Footfall</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-purple-500 rounded"></span>
                <span className="text-slate-400">Actual Footfall</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
