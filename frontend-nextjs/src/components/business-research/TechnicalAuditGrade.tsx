import React from 'react';

export interface TechnicalAudit {
  overall_grade: 'A' | 'B' | 'C' | 'D' | 'F';
  metrics: {
    mobile_responsiveness: { score: number; status: 'pass' | 'warning' | 'fail' };
    page_load_time: { seconds: number; status: 'pass' | 'warning' | 'fail' };
    security_score: { score: number; details: any };
    seo_score: { score: number; details: any };
    accessibility_score: { score: number; details: any };
  };
  analyzed_url: string;
  timestamp: string;
}

export interface TechnicalAuditGradeProps {
  audit: TechnicalAudit;
  className?: string;
}

export const TechnicalAuditGrade: React.FC<TechnicalAuditGradeProps> = ({ 
  audit, 
  className = '' 
}) => {
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
      case 'pass': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'fail': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return '✅';
      case 'warning': return '⚠️';
      case 'fail': return '❌';
      default: return '❓';
    }
  };

  const getProgressBarColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-6">
        <span className="text-xl">🔍</span>
        <h3 className="text-lg font-semibold text-gray-900">Technical Audit</h3>
      </div>

      {/* Overall Grade */}
      <div className="text-center mb-6">
        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full text-3xl font-bold ${getGradeColor(audit.overall_grade)}`}>
          {audit.overall_grade}
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Analyzed: {audit.analyzed_url}
        </p>
        <p className="text-xs text-gray-500">
          {formatTimestamp(audit.timestamp)}
        </p>
      </div>

      {/* Metrics Breakdown */}
      <div className="space-y-4">
        {/* Mobile Responsiveness */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">📱</span>
              <h4 className="font-medium text-gray-900">Mobile Responsiveness</h4>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">{audit.metrics.mobile_responsiveness.score}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(audit.metrics.mobile_responsiveness.status)}`}>
                {getStatusIcon(audit.metrics.mobile_responsiveness.status)} {audit.metrics.mobile_responsiveness.status}
              </span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${getProgressBarColor(audit.metrics.mobile_responsiveness.score)}`}
              style={{ width: `${audit.metrics.mobile_responsiveness.score}%` }}
            />
          </div>
        </div>

        {/* Page Load Time */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚡</span>
              <h4 className="font-medium text-gray-900">Page Load Time</h4>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">{audit.metrics.page_load_time.seconds}s</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(audit.metrics.page_load_time.status)}`}>
                {getStatusIcon(audit.metrics.page_load_time.status)} {audit.metrics.page_load_time.status}
              </span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${getProgressBarColor(100 - (audit.metrics.page_load_time.seconds * 20))}`}
              style={{ width: `${Math.max(0, 100 - (audit.metrics.page_load_time.seconds * 20))}%` }}
            />
          </div>
        </div>

        {/* Security Score */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">🔒</span>
              <h4 className="font-medium text-gray-900">Security Score</h4>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">{audit.metrics.security_score.score}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                audit.metrics.security_score.score >= 80 ? 'pass' : 
                audit.metrics.security_score.score >= 60 ? 'warning' : 'fail'
              )}`}>
                {getStatusIcon(
                  audit.metrics.security_score.score >= 80 ? 'pass' : 
                  audit.metrics.security_score.score >= 60 ? 'warning' : 'fail'
                )} {
                  audit.metrics.security_score.score >= 80 ? 'pass' : 
                  audit.metrics.security_score.score >= 60 ? 'warning' : 'fail'
                }
              </span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${getProgressBarColor(audit.metrics.security_score.score)}`}
              style={{ width: `${audit.metrics.security_score.score}%` }}
            />
          </div>
          {audit.metrics.security_score.details && (
            <div className="mt-2 text-xs text-gray-600">
              SSL: {audit.metrics.security_score.details.ssl ? '✅' : '❌'} | 
              Headers: {audit.metrics.security_score.details.headers ? '✅' : '❌'} | 
              CSP: {audit.metrics.security_score.details.csp ? '✅' : '❌'}
            </div>
          )}
        </div>

        {/* SEO Score */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">🔍</span>
              <h4 className="font-medium text-gray-900">SEO Score</h4>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">{audit.metrics.seo_score.score}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                audit.metrics.seo_score.score >= 80 ? 'pass' : 
                audit.metrics.seo_score.score >= 60 ? 'warning' : 'fail'
              )}`}>
                {getStatusIcon(
                  audit.metrics.seo_score.score >= 80 ? 'pass' : 
                  audit.metrics.seo_score.score >= 60 ? 'warning' : 'fail'
                )} {
                  audit.metrics.seo_score.score >= 80 ? 'pass' : 
                  audit.metrics.seo_score.score >= 60 ? 'warning' : 'fail'
                }
              </span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${getProgressBarColor(audit.metrics.seo_score.score)}`}
              style={{ width: `${audit.metrics.seo_score.score}%` }}
            />
          </div>
          {audit.metrics.seo_score.details && (
            <div className="mt-2 text-xs text-gray-600">
              Title: {audit.metrics.seo_score.details.title ? '✅' : '❌'} | 
              Meta: {audit.metrics.seo_score.details.meta_description ? '✅' : '❌'} | 
              Headers: {audit.metrics.seo_score.details.structure ? '✅' : '❌'}
            </div>
          )}
        </div>

        {/* Accessibility Score */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">♿</span>
              <h4 className="font-medium text-gray-900">Accessibility Score</h4>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">{audit.metrics.accessibility_score.score}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                audit.metrics.accessibility_score.score >= 80 ? 'pass' : 
                audit.metrics.accessibility_score.score >= 60 ? 'warning' : 'fail'
              )}`}>
                {getStatusIcon(
                  audit.metrics.accessibility_score.score >= 80 ? 'pass' : 
                  audit.metrics.accessibility_score.score >= 60 ? 'warning' : 'fail'
                )} {
                  audit.metrics.accessibility_score.score >= 80 ? 'pass' : 
                  audit.metrics.accessibility_score.score >= 60 ? 'warning' : 'fail'
                }
              </span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${getProgressBarColor(audit.metrics.accessibility_score.score)}`}
              style={{ width: `${audit.metrics.accessibility_score.score}%` }}
            />
          </div>
          {audit.metrics.accessibility_score.details && (
            <div className="mt-2 text-xs text-gray-600">
              ARIA: {audit.metrics.accessibility_score.details.aria_labels ? '✅' : '❌'} | 
              Contrast: {audit.metrics.accessibility_score.details.color_contrast ? '✅' : '❌'} | 
              Semantic: {audit.metrics.accessibility_score.details.semantic_html ? '✅' : '❌'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};