'use client';

import { WorkflowStep, SimilarityAnalysis, TrademarkCase } from '@/types';

interface Step {
  id: WorkflowStep;
  label: string;
  icon: string;
}

interface ProgressSidebarProps {
  steps: Step[];
  currentStep: WorkflowStep;
  analysisResult: SimilarityAnalysis | null;
  selectedCase: TrademarkCase | null;
  onStepClick: (stepId: WorkflowStep) => void;
}

export default function ProgressSidebar({
  steps,
  currentStep,
  analysisResult,
  selectedCase,
  onStepClick,
}: ProgressSidebarProps) {
  const currentIndex = steps.findIndex(s => s.id === currentStep);

  // 判断步骤是否可点击
  const isStepClickable = (stepId: string): boolean => {
    switch (stepId) {
      case 'input':
        return true; // 总是可以返回输入
      case 'report':
        return !!analysisResult; // 有分析结果才能访问
      case 'form':
        return !!selectedCase && !!analysisResult; // 有案例选择和分析结果才能访问
      case 'complete':
        return selectedCase !== null; // 有案例选择才能完成
      default:
        return false;
    }
  };

  return (
    <div className="space-y-4">
      {/* 进度概览 */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <span>📋</span> 处理进度
        </h3>
        
        <div className="space-y-2">
          {steps.map((step, index) => {
            const isActive = step.id === currentStep;
            const isClickable = isStepClickable(step.id);

            return (
              <button
                key={step.id}
                onClick={() => isClickable && onStepClick(step.id)}
                disabled={!isClickable}
                className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-all ${
                  isActive
                    ? 'bg-blue-50 border border-blue-200'
                    : isClickable
                    ? 'bg-green-50 hover:bg-green-100 cursor-pointer'
                    : 'bg-slate-50 opacity-50 cursor-not-allowed'
                }`}
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : isClickable
                    ? 'bg-green-500 text-white'
                    : 'bg-slate-300 text-slate-500'
                }`}>
                  {isClickable && !isActive ? '✓' : index + 1}
                </span>
                <span className={`text-sm ${
                  isActive ? 'font-medium text-blue-700' : 'text-slate-600'
                }`}>
                  {step.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 分析结果摘要 */}
      {analysisResult && (
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <span>📊</span> 分析结果
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">相似度评分</span>
              <span className={`font-bold ${
                analysisResult.overallScore >= 70 ? 'text-red-600' :
                analysisResult.overallScore >= 40 ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {analysisResult.overallScore}分
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">风险等级</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                analysisResult.level === '高' ? 'bg-red-100 text-red-700' :
                analysisResult.level === '中' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                {analysisResult.level}风险
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">建议行动</span>
              <span className="text-sm font-medium text-slate-700">
                {analysisResult.recommendation?.action || '建议调查'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 已选案例 */}
      {selectedCase && (
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <span>📚</span> 参考案例
          </h3>
          
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">
              {selectedCase.plaintiff} 案
            </p>
            <p className="text-xs text-slate-500">
              赔偿: {selectedCase.compensation}
            </p>
            <p className="text-xs text-slate-500">
              法院: {selectedCase.court}
            </p>
          </div>
        </div>
      )}

      {/* 操作提示 */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
        <p className="text-xs text-blue-700 leading-relaxed">
          <span className="font-medium">💡 提示：</span>
          您可以随时点击左侧步骤返回修改。所有数据会自动保存。
        </p>
      </div>
    </div>
  );
}
