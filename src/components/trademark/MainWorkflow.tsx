'use client';

import { useState, useCallback } from 'react';
import { WorkflowStep, SimilarityAnalysis, LawyerLetterParams, TrademarkCase } from '@/types';
import StepNavigation from './StepNavigation';
import ProgressSidebar from './ProgressSidebar';
import Step1InfoCollection from './Step1InfoCollection';
import Step2CaseSelection from './Step2CaseSelection';
import Step3LetterForm from './Step3LetterForm';
import Step4LetterPreview from './Step4LetterPreview';

interface MainWorkflowProps {
  onGenerateLetter: (params: LawyerLetterParams) => Promise<void>;
  letterContent: string;
  loading: boolean;
}

export default function MainWorkflow({
  onGenerateLetter,
  letterContent,
  loading,
}: MainWorkflowProps) {
  // 当前步骤
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('input');

  // 分析结果和输入数据
  const [analysisResult, setAnalysisResult] = useState<SimilarityAnalysis | null>(null);
  const [analysisInput, setAnalysisInput] = useState<any>(null);

  // 选择的案例
  const [selectedCase, setSelectedCase] = useState<TrademarkCase | null>(null);

  // 律师函表单数据
  const [letterFormData, setLetterFormData] = useState<Partial<LawyerLetterParams>>({});

  // 步骤配置
  const steps = [
    { id: 'input' as WorkflowStep, label: '信息录入', icon: '📝' },
    { id: 'report' as WorkflowStep, label: '分析结果', icon: '📊' },
    { id: 'form' as WorkflowStep, label: '确认信息', icon: '⚖️' },
    { id: 'complete' as WorkflowStep, label: '生成预览', icon: '✅' },
  ];

  // 步骤1完成：分析完成
  const handleAnalysisComplete = useCallback((result: SimilarityAnalysis, input: any) => {
    setAnalysisResult(result);
    setAnalysisInput(input);
    setCurrentStep('report');
  }, []);

  // 步骤2完成：选择案例
  const handleCaseSelect = useCallback((caseItem: TrademarkCase) => {
    setSelectedCase(caseItem);
    setCurrentStep('form');
  }, []);

  // 步骤3完成：提交表单
  const handleFormSubmit = useCallback(
    async (formData: LawyerLetterParams) => {
      setLetterFormData(formData);
      setCurrentStep('complete');
      await onGenerateLetter(formData);
    },
    [onGenerateLetter]
  );

  // 返回上一步
  const handleBack = useCallback(() => {
    const stepMap: Record<WorkflowStep, WorkflowStep | null> = {
      input: null,
      analyzing: 'input',
      report: 'input',
      form: 'report',
      generating: 'form',
      complete: 'form',
    };
    const prevStep = stepMap[currentStep];
    if (prevStep) {
      setCurrentStep(prevStep);
    }
  }, [currentStep]);

  // 跳转到指定步骤 - 允许在已完成的步骤间自由跳转
  const handleStepClick = useCallback(
    (stepId: WorkflowStep) => {
      // 根据数据是否存在来判断该步骤是否可访问
      const canAccess = (step: WorkflowStep): boolean => {
        switch (step) {
          case 'input':
            return true; // 总是可以返回输入步骤
          case 'report':
            return !!analysisResult; // 有分析结果才能访问
          case 'form':
            return !!selectedCase && !!analysisResult; // 有案例选择和分析结果才能访问
          case 'complete':
          case 'generating':
            return !!letterFormData && Object.keys(letterFormData).length > 0; // 有表单数据才能访问
          default:
            return false;
        }
      };

      if (canAccess(stepId)) {
        setCurrentStep(stepId);
      }
    },
    [analysisResult, selectedCase, letterFormData]
  );

  // 重新生成
  const handleRegenerate = useCallback(() => {
    if (letterFormData && Object.keys(letterFormData).length > 0) {
      onGenerateLetter(letterFormData as LawyerLetterParams);
    }
  }, [letterFormData, onGenerateLetter]);

  // 渲染当前步骤内容
  const renderStepContent = () => {
    switch (currentStep) {
      case 'input':
        return <Step1InfoCollection onAnalysisComplete={handleAnalysisComplete} />;

      case 'report':
        // 只要分析完成过，就能查看报告
        if (analysisResult) {
          return (
            <Step2CaseSelection
              analysisResult={analysisResult}
              analysisInput={analysisInput}
              onCaseSelect={handleCaseSelect}
              onBack={handleBack}
            />
          );
        }
        return null;

      case 'form':
        // 只要选择过案例，就能查看表单
        if (selectedCase && analysisResult) {
          return (
            <Step3LetterForm
              selectedCase={selectedCase}
              analysisResult={analysisResult}
              analysisInput={analysisInput}
              onSubmit={handleFormSubmit}
              onBack={handleBack}
            />
          );
        }
        return null;

      case 'generating':
      case 'complete':
        // 完成步骤总是可以显示
        return (
          <Step4LetterPreview
            content={letterContent}
            loading={loading}
            formData={letterFormData}
            onBack={handleBack}
            onRegenerate={handleRegenerate}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
      {/* 顶部导航 */}
      <StepNavigation
        steps={steps}
        currentStep={currentStep}
        onStepClick={handleStepClick}
      />

      {/* 主内容区 */}
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="flex gap-6">
          {/* 左侧进度栏 */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <ProgressSidebar
              steps={steps}
              currentStep={currentStep}
              analysisResult={analysisResult}
              selectedCase={selectedCase}
              onStepClick={handleStepClick}
            />
          </div>

          {/* 主内容 */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden min-h-[70vh]">
              {renderStepContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
