'use client';

import { useState, useCallback } from 'react';
import { LawyerLetterParams } from '@/types';

interface Step4LetterPreviewProps {
  content: string;
  loading: boolean;
  formData: Partial<LawyerLetterParams>;
  onBack: () => void;
  onRegenerate: () => void;
}

export default function Step4LetterPreview({
  content,
  loading,
  formData,
  onBack,
  onRegenerate,
}: Step4LetterPreviewProps) {
  const [copied, setCopied] = useState(false);

  // 复制到剪贴板
  const handleCopy = useCallback(() => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [content]);

  // 下载为文本文件
  const handleDownloadTxt = useCallback(() => {
    if (!content) return;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `律师函_${formData.recipientCompany || '被函方'}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [content, formData.recipientCompany]);

  // 导出DOCX（模拟）
  const handleExportDocx = useCallback(() => {
    if (!content) return;
    alert('DOCX导出功能需要接入文档生成服务，当前版本仅支持文本导出');
  }, [content]);

  return (
    <div className="p-6 md:p-8">
      {/* 标题 */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">律师函预览</h2>
        <p className="text-slate-500">
          {loading
            ? 'AI正在生成律师函，请稍候...'
            : content
            ? '律师函已生成，您可以预览、复制或下载'
            : '点击"重新生成"开始生成律师函'}
        </p>
      </div>

      {/* 预览区域 */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-inner overflow-hidden mb-6">
        {/* 工具栏 */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-sm">预览模式</span>
          </div>
          {content && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1"
              >
                {copied ? '✓ 已复制' : '📋 复制'}
              </button>
            </div>
          )}
        </div>

        {/* 内容区域 */}
        <div className="p-8 min-h-[400px] max-h-[600px] overflow-y-auto">
          {loading && !content ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="animate-spin h-10 w-10 rounded-full border-4 border-blue-200 border-t-blue-600 mb-4" />
              <p className="text-slate-500">AI正在起草律师函...</p>
            </div>
          ) : content ? (
            <div className="prose prose-slate max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-slate-800 leading-relaxed">
                {content}
                {loading && <span className="animate-pulse">▌</span>}
              </pre>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <svg
                className="w-16 h-16 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p>律师函内容将在这里显示</p>
            </div>
          )}
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
        >
          ← 返回修改信息
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={onRegenerate}
            disabled={loading}
            className="px-6 py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {loading ? '生成中...' : '🔄 重新生成'}
          </button>

          {content && (
            <>
              <button
                onClick={handleDownloadTxt}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
              >
                📥 下载TXT
              </button>
              <button
                onClick={handleExportDocx}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg font-bold transition-colors shadow-lg"
              >
                📄 导出DOCX
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
