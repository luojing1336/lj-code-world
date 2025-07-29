import { useState } from 'react';

const JudgmentInterestCalculator = () => {
  const [principal, setPrincipal] = useState('446386.8');
  const [startDate, setStartDate] = useState('2025-02-27');
  const [endDate, setEndDate] = useState('');
  const [useToday, setUseToday] = useState(true);
  const [lpr, setLpr] = useState('3.10');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // 日期格式转换
  const formatDate = (dateStr) => {
    if (!dateStr) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return today;
    }
    return new Date(dateStr + 'T00:00:00');
  };

  // 将数字金额转换为中文大写金额
  const convertCurrency = (money) => {
    const cnNums = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
    const cnIntRadice = ['', '拾', '佰', '仟'];
    const cnIntUnits = ['', '万', '亿', '兆'];
    const cnDecUnits = ['角', '分', '毫', '厘'];
    const cnInteger = '整';
    const cnIntLast = '元';
    
    let negative = '';
    if (money < 0) {
      negative = '负';
      money = -money;
    }
    
    const integerNum = Math.floor(money);
    const decimalNum = Math.round(money * 100) % 100;
    
    let chineseStr = '';
    if (integerNum > 0) {
      let zeroCount = 0;
      const intStr = String(integerNum);
      for (let i = 0; i < intStr.length; i++) {
        const n = intStr.charAt(i);
        const p = intStr.length - i - 1;
        const q = p / 4;
        const m = p % 4;
        if (n === '0') {
          zeroCount++;
        } else {
          if (zeroCount > 0) {
            chineseStr += cnNums[0];
          }
          zeroCount = 0;
          chineseStr += cnNums[parseInt(n)] + cnIntRadice[m];
        }
        if (m === 0 && zeroCount < 4) {
          chineseStr += cnIntUnits[Math.floor(q)];
        }
      }
      chineseStr += cnIntLast;
    }
    
    if (decimalNum > 0) {
      const decPart = String(decimalNum).padStart(2, '0');
      if (decPart.charAt(0) !== '0') {
        chineseStr += cnNums[parseInt(decPart.charAt(0))] + cnDecUnits[0];
      }
      if (decPart.charAt(1) !== '0') {
        chineseStr += cnNums[parseInt(decPart.charAt(1))] + cnDecUnits[1];
      }
    } else if (integerNum > 0) {
      chineseStr += cnInteger;
    }
    
    return negative + chineseStr;
  };

  // 计算利息
  const calculateInterest = () => {
    try {
      setError('');
      
      const principalNum = parseFloat(principal);
      const lprNum = parseFloat(lpr);
      
      if (isNaN(principalNum) || principalNum <= 0) {
        throw new Error('本金必须为正数');
      }
      if (isNaN(lprNum) || lprNum < 0) {
        throw new Error('利率必须为非负数');
      }
      
      const start = formatDate(startDate);
      const end = useToday ? formatDate('') : formatDate(endDate);
      
      if (end < start) {
        throw new Error('终止日不能早于起始日');
      }
      
      const millisecondsPerDay = 1000 * 60 * 60 * 24;
      const utcStart = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
      const utcEnd = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
      const days = Math.round((utcEnd - utcStart) / millisecondsPerDay) + 1;
      
      const dailyRate = lprNum / 100 / 360;
      const interest = principalNum * dailyRate * days;
      const roundedInterest = Math.round(interest * 100) / 100;
      
      const formatDateForOutput = (date) => {
        return `${date.getFullYear()}年${(date.getMonth() + 1).toString().padStart(2, '0')}月${date.getDate().toString().padStart(2, '0')}日`;
      };
      
      setResult({
        天数: days,
        利息: roundedInterest,
        详情: {
          本金: principalNum.toLocaleString('zh-CN', { style: 'currency', currency: 'CNY' }),
          起始日: formatDateForOutput(start),
          终止日: formatDateForOutput(end),
          计息天数: days,
          LPR利率: `${lprNum}%`,
          LPR日利率: `${(dailyRate * 100).toFixed(6)}%`,
          利息结果: roundedInterest.toLocaleString('zh-CN', { style: 'currency', currency: 'CNY' }),
          利息文字: convertCurrency(roundedInterest),
        }
      });
    } catch (err) {
      setError(err.message);
      setResult(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* 头部 */}
        <div className="bg-blue-600 text-white p-6 rounded-t-lg">
          <h1 className="text-2xl font-semibold">判决利息计算器</h1>
          <p className="mt-2 text-blue-100 text-sm">精确计算判决书中的利息金额，支持LPR利率计算</p>
        </div>

        <div className="p-8">
          {/* 输入表单 */}
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  本金（元）
                </label>
                <input
                  type="number"
                  value={principal}
                  onChange={(e) => setPrincipal(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="请输入本金"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  起始日期
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  LPR利率（%）
                </label>
                <input
                  type="number"
                  value={lpr}
                  onChange={(e) => setLpr(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="请输入LPR利率"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  终止日期
                </label>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={useToday}
                      onChange={(e) => setUseToday(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label className="ml-2 text-sm text-gray-600">使用今天作为终止日期</label>
                  </div>
                  {!useToday && (
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 计算按钮 */}
          <div className="mb-6">
            <button
              onClick={calculateInterest}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 font-medium text-sm"
            >
              计算利息
            </button>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* 计算结果 */}
          {result && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">计算结果</h2>
              
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-md border border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">本金</span>
                      <span className="text-sm font-semibold text-gray-900">{result.详情.本金}</span>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-md border border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">起始日期</span>
                      <span className="text-sm text-gray-900">{result.详情.起始日}</span>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-md border border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">终止日期</span>
                      <span className="text-sm text-gray-900">{result.详情.终止日}</span>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-md border border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">计息天数</span>
                      <span className="text-sm font-semibold text-gray-900">{result.详情.计息天数} 天</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-md border border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">LPR年利率</span>
                      <span className="text-sm text-gray-900">{result.详情.LPR利率}</span>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-md border border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">LPR日利率</span>
                      <span className="text-sm text-gray-900">{result.详情.LPR日利率}</span>
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-md border border-green-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-green-700">应付利息</span>
                      <span className="text-base font-bold text-green-700">{result.详情.利息结果}</span>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-md border border-gray-200">
                    <div className="mb-2">
                      <span className="text-sm font-medium text-gray-600">中文大写</span>
                    </div>
                    <div className="text-sm text-gray-900 leading-relaxed">{result.详情.利息文字}</div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-3 bg-blue-50 rounded-md border border-blue-200">
                <p className="text-xs text-blue-600">
                  计算时间：{new Date().toLocaleString('zh-CN')}
                </p>
              </div>
            </div>
          )}

          {/* 使用说明 */}
          <div className="mt-8 bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h3 className="text-base font-semibold text-gray-800 mb-4">使用说明</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• 本计算器基于360天计息方式计算判决利息</p>
              <p>• LPR利率请填写百分比数值，如3.10表示3.10%</p>
              <p>• 计息天数包含起始日和终止日</p>
              <p>• 结果会自动四舍五入到分</p>
              <p>• 可选择使用当天作为终止日期或自定义终止日期</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JudgmentInterestCalculator;