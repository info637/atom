import React, { useState } from 'react';
import { ResearchStatusTerminal } from './ResearchStatusTerminal';
import { BusinessProfileCard } from './BusinessProfileCard';
import { TechnicalAuditGrade } from './TechnicalAuditGrade';
import { ServiceUpsellPanel } from './ServiceUpsellPanel';
import { ResearchHistoryTable } from './ResearchHistoryTable';

export interface BusinessResearchData {
  task_id: string;
  business_name: string;
  status: 'IDLE' | 'RUNNING' | 'COMPLETED' | 'ERROR';
  timestamp: string;
  contact_data?: {
    email: { value: string; validation_status: 'verified' | 'unverified' | 'invalid' };
    phone: { value: string; formatting: string };
    social_links: {
      linkedin?: string;
      twitter?: string;
      facebook?: string;
      instagram?: string;
    };
    sources: Array<{ field: string; url: string; extraction_method: string }>;
  };
  technical_audit?: {
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
  };
  upsell_recommendations?: Array<{
    service: string;
    description: string;
    confidence: number;
    rationale: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

export interface BusinessResearchLayoutProps {
  className?: string;
}

export const BusinessResearchLayout: React.FC<BusinessResearchLayoutProps> = ({ className = '' }) => {
  const [businessName, setBusinessName] = useState('');
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [researchData, setResearchData] = useState<BusinessResearchData | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleLaunchAgent = async () => {
    if (!businessName.trim()) return;

    try {
      setIsRunning(true);
      setResearchData(null);

      // Start research task
      const response = await fetch('/api/research/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ business_name: businessName.trim() })
      });

      const data = await response.json();
      setCurrentTaskId(data.task_id);

      // Start monitoring the task
      startTaskMonitoring(data.task_id);

    } catch (error) {
      console.error('Failed to start research:', error);
      setIsRunning(false);
    }
  };

  const startTaskMonitoring = async (taskId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/research/${taskId}/status`);
        const statusData = await response.json();

        setResearchData(statusData);

        if (statusData.status === 'COMPLETED' || statusData.status === 'ERROR') {
          clearInterval(pollInterval);
          setIsRunning(false);
        }
      } catch (error) {
        console.error('Failed to get task status:', error);
        clearInterval(pollInterval);
        setIsRunning(false);
      }
    }, 2000);

    // Clear interval after 5 minutes timeout
    setTimeout(() => {
      clearInterval(pollInterval);
      if (isRunning) {
        setIsRunning(false);
      }
    }, 300000);
  };

  const handleCancel = async () => {
    if (!currentTaskId) return;

    try {
      await fetch(`/api/research/${currentTaskId}/cancel`, { method: 'POST' });
      setIsRunning(false);
      setCurrentTaskId(null);
    } catch (error) {
      console.error('Failed to cancel research:', error);
    }
  };

  return (
    <div className={`max-w-7xl mx-auto p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Regional Business Research Agent</h1>
        <p className="text-gray-600">Live browser-based business intelligence for Opelika/Auburn, AL and Columbus/West Point, GA</p>
      </div>

      {/* Input Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
              Business Name
            </label>
            <input
              type="text"
              id="businessName"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Enter business name to research..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isRunning}
            />
          </div>
          <button
            onClick={handleLaunchAgent}
            disabled={!businessName.trim() || isRunning}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isRunning ? 'Researching...' : 'Launch Agent'}
          </button>
        </div>
      </div>

      {/* Two-column layout for results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Status/Progress */}
        <div className="space-y-6">
          <ResearchStatusTerminal 
            taskId={currentTaskId}
            businessName={businessName}
            isRunning={isRunning}
            onCancel={handleCancel}
          />

          {researchData?.technical_audit && (
            <TechnicalAuditGrade audit={researchData.technical_audit} />
          )}
        </div>

        {/* Right Column: Results/Data */}
        <div className="space-y-6">
          {researchData?.contact_data && (
            <BusinessProfileCard contactData={researchData.contact_data} />
          )}

          {researchData?.upsell_recommendations && (
            <ServiceUpsellPanel 
              recommendations={researchData.upsell_recommendations}
              businessName={businessName}
            />
          )}
        </div>
      </div>

      {/* Research History */}
      <div className="mt-8">
        <ResearchHistoryTable />
      </div>
    </div>
  );
};