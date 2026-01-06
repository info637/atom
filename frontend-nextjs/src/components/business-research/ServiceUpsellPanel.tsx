import React, { useState } from 'react';

export interface UpsellRecommendation {
  service: string;
  description: string;
  confidence: number;
  rationale: string;
  priority: 'high' | 'medium' | 'low';
}

export interface ServiceUpsellPanelProps {
  recommendations: UpsellRecommendation[];
  businessName: string;
  className?: string;
}

export const ServiceUpsellPanel: React.FC<ServiceUpsellPanelProps> = ({ 
  recommendations, 
  businessName,
  className = '' 
}) => {
  const [selectedRecommendation, setSelectedRecommendation] = useState<string | null>(null);

  const getServiceIcon = (service: string) => {
    switch (service.toLowerCase()) {
      case 'custom app development':
        return '📱';
      case 'ai automation':
        return '🤖';
      case 'e-commerce':
        return '🛒';
      case 'website redesign':
        return '🎨';
      case 'branding':
        return '🎯';
      default:
        return '💼';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-green-200 bg-green-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            🔥 High Priority
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            ⚡ Medium Priority
          </span>
        );
      case 'low':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            ✓ Low Priority
          </span>
        );
      default:
        return null;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleScheduleConsultation = (service: string) => {
    // In a real app, this would open a modal or redirect to a scheduling system
    alert(`Scheduling consultation for ${service} with ${businessName}...`);
  };

  const sortedRecommendations = [...recommendations].sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🎯</span>
        <h3 className="text-lg font-semibold text-gray-900">Service Opportunities</h3>
      </div>

      {/* Gap Identification Summary */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Regional Market Analysis</h4>
        <p className="text-sm text-blue-800">
          Based on our technical analysis of {businessName}'s digital presence in the Opelika/Auburn, Alabama and Columbus/West Point, Georgia markets, we've identified {recommendations.length} key opportunities for regional growth and market expansion.
        </p>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {sortedRecommendations.map((rec, index) => (
          <div 
            key={index} 
            className={`border-2 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer ${getPriorityColor(rec.priority)}`}
            onClick={() => setSelectedRecommendation(selectedRecommendation === rec.service ? null : rec.service)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getServiceIcon(rec.service)}</span>
                <div>
                  <h4 className="font-semibold text-gray-900">{rec.service}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    {getPriorityBadge(rec.priority)}
                    <span className={`text-sm font-medium ${getConfidenceColor(rec.confidence)}`}>
                      {rec.confidence}% confidence
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleScheduleConsultation(rec.service);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Schedule Consultation
              </button>
            </div>

            <p className="text-gray-700 mb-3">{rec.description}</p>

            {/* Rationale - expandable */}
            <div className="mt-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedRecommendation(selectedRecommendation === rec.service ? null : rec.service);
                }}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                {selectedRecommendation === rec.service ? 'Hide rationale' : 'Show rationale'}
              </button>
              
              {selectedRecommendation === rec.service && (
                <div className="mt-2 p-3 bg-white bg-opacity-70 rounded border-l-4 border-blue-400">
                  <h5 className="font-medium text-gray-900 mb-1">Analysis Rationale:</h5>
                  <p className="text-sm text-gray-700">{rec.rationale}</p>
                </div>
              )}
            </div>

            {/* Confidence meter */}
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Confidence Score</span>
                <span>{rec.confidence}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    rec.confidence >= 80 ? 'bg-green-500' : 
                    rec.confidence >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${rec.confidence}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {recommendations.filter(r => r.priority === 'high').length}
            </div>
            <div className="text-xs text-gray-600">High Priority</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {Math.round(recommendations.reduce((acc, r) => acc + r.confidence, 0) / recommendations.length)}%
            </div>
            <div className="text-xs text-gray-600">Avg Confidence</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {new Set(recommendations.map(r => r.service)).size}
            </div>
            <div className="text-xs text-gray-600">Unique Services</div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white text-center">
        <h4 className="font-semibold mb-2">Ready to Grow Your Business?</h4>
        <p className="text-sm mb-3 opacity-90">
          Our analysis shows clear opportunities for {businessName} to improve their digital presence and increase revenue.
        </p>
        <button 
          onClick={() => alert('Opening consultation scheduler...')}
          className="px-6 py-2 bg-white text-blue-600 rounded-md font-medium hover:bg-gray-100 transition-colors"
        >
          Get Free Consultation
        </button>
      </div>
    </div>
  );
};