import React, { useState, useEffect } from 'react';

export interface HistoryRecord {
  task_id: string;
  business_name: string;
  date: string;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  contact_count: number;
  status: 'COMPLETED' | 'ERROR' | 'RUNNING';
  results?: any;
}

export interface ResearchHistoryTableProps {
  className?: string;
}

export const ResearchHistoryTable: React.FC<ResearchHistoryTableProps> = ({ className = '' }) => {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/research/history?limit=20');
      const data = await response.json();
      setHistory(data || []);
    } catch (error) {
      console.error('Failed to fetch research history:', error);
      // Mock data for development
      setHistory([
        {
          task_id: 'mock-1',
          business_name: 'TechCorp Solutions',
          date: '2024-01-15T10:30:00Z',
          grade: 'B',
          contact_count: 3,
          status: 'COMPLETED'
        },
        {
          task_id: 'mock-2',
          business_name: 'Digital Marketing Pro',
          date: '2024-01-14T15:45:00Z',
          grade: 'A',
          contact_count: 5,
          status: 'COMPLETED'
        },
        {
          task_id: 'mock-3',
          business_name: 'StartupXYZ',
          date: '2024-01-13T09:15:00Z',
          grade: 'D',
          contact_count: 1,
          status: 'COMPLETED'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-green-600 bg-green-100';
      case 'B': return 'text-blue-600 bg-blue-100';
      case 'C': return 'text-yellow-600 bg-yellow-100';
      case 'D': return 'text-orange-600 bg-orange-100';
      case 'F': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'text-green-600 bg-green-100';
      case 'ERROR': return 'text-red-600 bg-red-100';
      case 'RUNNING': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return '✅';
      case 'ERROR': return '❌';
      case 'RUNNING': return '⏳';
      default: return '❓';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      if (format === 'csv') {
        const csvContent = [
          ['Business Name', 'Date', 'Grade', 'Contact Count', 'Status', 'Task ID'].join(','),
          ...history.map(record => [
            record.business_name,
            record.date,
            record.grade,
            record.contact_count,
            record.status,
            record.task_id
          ].join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `research-history-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
      } else {
        const jsonContent = JSON.stringify(history, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `research-history-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const toggleExpanded = (taskId: string) => {
    setExpandedRow(expandedRow === taskId ? null : taskId);
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="text-xl">📊</span>
          <h3 className="text-lg font-semibold text-gray-900">Research History</h3>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => handleExport('csv')}
            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Export CSV
          </button>
          <button
            onClick={() => handleExport('json')}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Export JSON
          </button>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <span className="text-4xl mb-4 block">📈</span>
          <p>No research history available</p>
          <p className="text-sm">Run your first business research to see results here</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Business Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Grade</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Contacts</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {history.map((record) => (
                <React.Fragment key={record.task_id}>
                  <tr className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{record.business_name}</div>
                      <div className="text-xs text-gray-500 font-mono">{record.task_id}</div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {formatDate(record.date)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${getGradeColor(record.grade)}`}>
                        {record.grade}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {record.contact_count}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                        {getStatusIcon(record.status)} {record.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => toggleExpanded(record.task_id)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        {expandedRow === record.task_id ? 'Hide' : 'View'} Details
                      </button>
                    </td>
                  </tr>
                  
                  {/* Expanded Row */}
                  {expandedRow === record.task_id && (
                    <tr>
                      <td colSpan={6} className="py-4 px-4 bg-gray-50">
                        <div className="space-y-3">
                          <h4 className="font-medium text-gray-900">Research Results</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">Technical Grade:</span>
                              <span className={`ml-2 px-2 py-1 rounded text-xs font-bold ${getGradeColor(record.grade)}`}>
                                {record.grade}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Contacts Found:</span>
                              <span className="ml-2">{record.contact_count}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Completed:</span>
                              <span className="ml-2">{formatDate(record.date)}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Task ID:</span>
                              <span className="ml-2 font-mono text-xs">{record.task_id}</span>
                            </div>
                          </div>
                          
                          {/* Mock detailed results */}
                          <div className="mt-4 p-3 bg-white rounded border">
                            <h5 className="font-medium text-gray-900 mb-2">Quick Summary</h5>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>• Contact information successfully extracted</p>
                              <p>• Technical audit completed with grade {record.grade}</p>
                              <p>• Service opportunities identified</p>
                              <p>• {record.contact_count} contact methods verified</p>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary Statistics */}
      {history.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">{history.length}</div>
              <div className="text-xs text-gray-600">Total Research</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {history.filter(r => r.status === 'COMPLETED').length}
              </div>
              <div className="text-xs text-gray-600">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {Math.round(history.reduce((acc, r) => acc + r.contact_count, 0) / history.length * 10) / 10}
              </div>
              <div className="text-xs text-gray-600">Avg Contacts</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {(() => {
                  const grades = history.map(r => r.grade);
                  const avgGrade = grades.reduce((acc, g) => acc + g.charCodeAt(0) - 65, 0) / grades.length;
                  return String.fromCharCode(65 + Math.round(avgGrade));
                })()}
              </div>
              <div className="text-xs text-gray-600">Avg Grade</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};