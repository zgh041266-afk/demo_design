/**
 * 得理法律开放平台 API 调用工具
 * 文档: https://openapi.delilegal.com
 */

const DELI_API_BASE = 'https://openapi.delilegal.com';

interface DeliConfig {
  appid: string;
  secret: string;
}

interface CaseSearchParams {
  keyword: string;
  page?: number;
  size?: number;
  caseType?: string;
  court?: string;
  dateStart?: string;
  dateEnd?: string;
}

interface CaseResult {
  caseId: string;
  caseName: string;
  caseNumber: string;
  court: string;
  date: string;
  caseType: string;
  summary: string;
  similarity?: string;
}

/**
 * 生成得理 API 签名
 */
function generateSign(params: Record<string, any>, secret: string): string {
  // 按key排序并拼接
  const sortedKeys = Object.keys(params).sort();
  const signStr = sortedKeys.map(k => `${k}=${params[k]}`).join('&') + secret;
  
  // 使用 Web Crypto API 进行 MD5 加密
  return signStr;
}

/**
 * 类案检索 - 根据关键词搜索相关案例
 */
export async function searchSimilarCases(
  keyword: string,
  config: DeliConfig,
  options?: { page?: number; size?: number }
): Promise<CaseResult[]> {
  const { appid, secret } = config;
  const timestamp = Date.now().toString();
  
  const params: Record<string, any> = {
    appid,
    timestamp,
    keyword,
    page: options?.page || 1,
    size: options?.size || 5,
  };
  
  // 生成签名（得理的具体签名算法需要根据文档调整）
  const sign = generateSign(params, secret);
  
  try {
    const response = await fetch(`${DELI_API_BASE}/api/qa/v3/search/queryListCase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...params,
        sign,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`得理API请求失败: ${response.status}`);
    }
    
    const data = await response.json();
    
    // 根据得理实际返回格式调整
    if (data.code === 200 && data.data) {
      return data.data.map((item: any) => ({
        caseId: item.caseId || '',
        caseName: item.caseName || item.title || '',
        caseNumber: item.caseNumber || '',
        court: item.court || '',
        date: item.date || item.judgmentDate || '',
        caseType: item.caseType || '',
        summary: item.summary || item.content?.substring(0, 200) || '',
        similarity: '得理类案检索结果',
      }));
    }
    
    return [];
  } catch (error) {
    console.error('得理API调用失败:', error);
    return [];
  }
}

/**
 * 根据商标信息检索相似案例
 */
export async function searchTrademarkCases(
  trademarkName: string,
  infringingMark: string,
  config: DeliConfig
): Promise<CaseResult[]> {
  // 构建检索关键词
  const keyword = `${trademarkName} ${infringingMark} 商标侵权 相似`;
  
  return searchSimilarCases(keyword, config, { size: 3 });
}

/**
 * 获取得理配置（从环境变量）
 */
export function getDeliConfig(): DeliConfig | null {
  const appid = process.env.DELI_APPID;
  const secret = process.env.DELI_SECRET;
  
  if (!appid || !secret) {
    console.warn('得理API配置缺失，请在.env.local中配置 DELI_APPID 和 DELI_SECRET');
    return null;
  }
  
  return { appid, secret };
}
