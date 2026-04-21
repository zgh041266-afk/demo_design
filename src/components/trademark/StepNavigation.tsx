'use client';

import { WorkflowStep } from '@/types';

interface Step {
  id: WorkflowStep;
  label: string;
  icon: string;
}

interface StepNavigationProps {
  steps: Step[];
  currentStep: WorkflowStep;
  onStepClick: (stepId: WorkflowStep) => void;
}

export default function StepNavigation({ steps, currentStep, onStepClick }: StepNavigationProps) {
  const currentIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
        {/* 标题 */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <span className="text-3xl">⚖️</span>
              商标侵权智能助手
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              AI智能分析 · 类案检索 · 律师函生成
            </p>
          </div>
          
          {/* 功能标签 */}
          <div className="hidden md:flex items-center gap-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
              🤖 GPT-4o
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
              📊 智能分析
            </span>
          </div>
        </div>

        {/* 步骤导航 */}
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-2 md:gap-4">
            {steps.map((step, index) => {
              const isActive = step.id === currentStep;
              const isCompleted = index < currentIndex;
              const isClickable = index <= currentIndex;

              return (
                <div key={step.id} className="flex items-center">
                  {/* 步骤按钮 */}
                  <button
                    onClick={() => isClickable && onStepClick(step.id)}
                    disabled={!isClickable}
                    className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md'
                        : isCompleted
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <span className="text-lg">{step.icon}</span>
                    <span className="hidden md:inline font-medium text-sm">{step.label}</span>
                    {isCompleted && (
                      <span className="text-xs">✓</span>
                    )}
                  </button>

                  {/* 连接线 */}
                  {index < steps.length - 1 && (
                    <div className={`w-8 md:w-12 h-0.5 mx-2 ${
                      index < currentIndex ? 'bg-green-400' : 'bg-slate-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}
