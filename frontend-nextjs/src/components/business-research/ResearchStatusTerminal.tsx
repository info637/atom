import React, { useState, useEffect, useRef } from 'react';

export interface StatusLogEntry {
  timestamp: string;
  step: string;
  progress: number;
  status: 'IDLE' | 'RUNNING' | 'COMPLETED' | 'ERROR';
}

export interface ResearchStatusTerminalProps {
  taskId: string | null;
  businessName: string;
  isRunning: boolean;
  onCancel: () => void;
}

export const ResearchStatusTerminal: React.FC<ResearchStatusTerminalProps> = ({
  taskId,
  businessName,
  isRunning,
  onCancel
}) => {
  const [logs, setLogs] = useState<StatusLogEntry[]>([]);
  const [currentStatus, setCurrentStatus] = useState<'IDLE' | 'RUNNING' | 'COMPLETED' | 'ERROR'>('IDLE');
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs are added
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Simulate log updates when research is running
  useEffect(() => {
    if (isRunning && taskId) {
      const initialLogs: StatusLogEntry[] = [
        {
          timestamp: new Date().toISOString(),
          step: 'Initializing research agent...',
          progress: 0,
          status: 'RUNNING'
        }
      ];
      setLogs(initialLogs);
      setCurrentStatus('RUNNING');

      // Simulate progressive log updates
      const logSteps = [
        { step: 'Initializing research agent...', progress: 0 },
        { step: 'Searching Google for businesses in Opelika, Auburn AL, Columbus, West Point GA...', progress: 10 },
        { step: 'Analyzing location-specific search results...', progress: 20 },
        { step: 'Navigating to official websites in target areas...', progress: 30 },
        { step: 'Extracting contact information from local businesses...', progress: 40 },
        { step: 'Validating Alabama and Georgia business contacts...', progress: 50 },
        { step: 'Scanning for local social media and directory listings...', progress: 60 },
        { step: 'Performing technical website audit for local presence...', progress: 70 },
        { step: 'Analyzing mobile responsiveness for local customers...', progress: 80 },
        { step: 'Evaluating local SEO and business directory presence...', progress: 90 },
        { step: 'Identifying service gaps in Opelika/Auburn/Columbus/West Point area...', progress: 95 },
        { step: 'Generating final regional business intelligence report...', progress: 100 }
      ];

      let stepIndex = 0;
      const logInterval = setInterval(() => {
        if (stepIndex < logSteps.length) {
          const newLog: StatusLogEntry = {
            timestamp: new Date().toISOString(),
            step: logSteps[stepIndex].step,
            progress: logSteps[stepIndex].progress,
            status: 'RUNNING'
          };
          setLogs(prev => [...prev, newLog]);
          setCurrentStatus('RUNNING');
          stepIndex++;
        } else {
          // Research completed
          const completeLog: StatusLogEntry = {
            timestamp: new Date().toISOString(),
            step: 'Research completed successfully!',
            progress: 100,
            status: 'COMPLETED'
          };
          setLogs(prev => [...prev, completeLog]);
          setCurrentStatus('COMPLETED');
          clearInterval(logInterval);
        }
      }, 3000);

      return () => clearInterval(logInterval);
    } else if (!isRunning && logs.length > 0) {
      // Set to idle when not running but has logs
      setCurrentStatus('IDLE');
    }
  }, [isRunning, taskId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RUNNING': return 'text-blue-600';
      case 'COMPLETED': return 'text-green-600';
      case 'ERROR': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'RUNNING': return '⚡';
      case 'COMPLETED': return '✅';
      case 'ERROR': return '❌';
      default: return '⏸️';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="bg-black text-green-400 rounded-lg p-4 font-mono text-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">🖥️</span>
          <h3 className="text-white font-semibold">Research Status Terminal</h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className={getStatusColor(currentStatus)}>
              {getStatusIcon(currentStatus)} {currentStatus}
            </span>
          </div>
          {isRunning && (
            <button
              onClick={onCancel}
              className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {isRunning && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Progress</span>
            <span>{logs.length > 0 ? logs[logs.length - 1].progress : 0}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${logs.length > 0 ? logs[logs.length - 1].progress : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* Log Display */}
      <div 
        ref={logContainerRef}
        className="h-80 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
      >
        {logs.length === 0 ? (
          <div className="text-gray-500 italic">
            {currentStatus === 'IDLE' ? 'Ready to research business intelligence...' : 'Initializing...'}
          </div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="flex items-start gap-3 py-1 hover:bg-gray-900 rounded">
              <span className="text-gray-500 text-xs min-w-fit mt-0.5">
                {formatTimestamp(log.timestamp)}
              </span>
              <span className="text-blue-400 min-w-fit">[{log.progress}%]</span>
              <span className="text-gray-300 flex-1">{log.step}</span>
              <span className={getStatusColor(log.status)}>
                {getStatusIcon(log.status)}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Terminal Footer */}
      <div className="mt-4 pt-2 border-t border-gray-700 flex justify-between items-center text-xs text-gray-500">
        <span>Business: {businessName || 'N/A'}</span>
        <span>Task ID: {taskId || 'N/A'}</span>
      </div>
    </div>
  );
};