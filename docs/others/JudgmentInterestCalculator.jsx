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

  // 获取今天的日期字符串
  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* 头部 */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🧮</span>
            <h1 className="text-2xl font-bold">判决利息计算器</h1>
          </div>
          <p className="mt-2 text-blue-100">精确计算判决书中的利息金额，支持LPR利率计算</p>
        </div>

        <div className="p-6">
          {/* 输入表单 */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <span className="text-lg">💰</span>
                  本金（元）
                </label>
                <input
                  type="number"
                  value={principal}
                  onChange={(e) => setPrincipal(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="请输入本金"
                  step="0.01"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <span className="text-lg">📅</span>
                  起始日期
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <span className="text-lg">📊</span>
                  LPR利率（%）
                </label>
                <input
                  type="number"
                  value={lpr}
                  onChange={(e) => setLpr(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="请输入LPR利率"
                  step="0.01"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <span className="text-lg">📅</span>
                  终止日期
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={useToday}
                      onChange={(e) => setUseToday(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">使用今天作为终止日期</span>
                  </div>
                  {!useToday && (
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 计算按钮 */}
          <button
            onClick={calculateInterest}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            计算利息
          </button>

          {/* 错误提示 */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 font-medium">❌ {error}</p>
            </div>
          )}

          {/* 计算结果 */}
          {result && (
            <div className="mt-6 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
              <h2 className="text-xl font-bold text-green-800 mb-4 flex items-center gap-2">
                <span className="text-xl">🧮</span>
                计算结果
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between p-3 bg-white rounded-lg shadow-sm">
                    <span className="font-medium text-gray-700">本金：</span>
                    <span className="font-bold text-blue-600">{result.详情.本金}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-white rounded-lg shadow-sm">
                    <span className="font-medium text-gray-700">起始日：</span>
                    <span className="text-gray-900">{result.详情.起始日}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-white rounded-lg shadow-sm">
                    <span className="font-medium text-gray-700">终止日：</span>
                    <span className="text-gray-900">{result.详情.终止日}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-white rounded-lg shadow-sm">
                    <span className="font-medium text-gray-700">计息天数：</span>
                    <span className="font-bold text-purple-600">{result.详情.计息天数} 天</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between p-3 bg-white rounded-lg shadow-sm">
                    <span className="font-medium text-gray-700">LPR年利率：</span>
                    <span className="text-gray-900">{result.详情.LPR利率}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-white rounded-lg shadow-sm">
                    <span className="font-medium text-gray-700">LPR日利率：</span>
                    <span className="text-gray-900">{result.详情.LPR日利率}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg shadow-sm border-2 border-green-300">
                    <span className="font-bold text-green-800">应付利息：</span>
                    <span className="font-bold text-green-800 text-lg">{result.详情.利息结果}</span>
                  </div>
                  <div className="p-3 bg-white rounded-lg shadow-sm">
                    <div className="text-sm font-medium text-gray-700 mb-1">中文大写：</div>
                    <div className="text-gray-900 text-sm break-all">{result.详情.利息文字}</div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700">
                  <span className="inline-block mr-1">ℹ️</span>
                  计算时间：{new Date().toLocaleString('zh-CN')}
                </p>
              </div>
            </div>
          )}

          {/* 使用说明 */}
          <div className="mt-8 bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3">使用说明</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• 本计算器基于360天计息方式计算判决利息</li>
              <li>• LPR利率请填写百分比数值，如3.10表示3.10%</li>
              <li>• 计息天数包含起始日和终止日</li>
              <li>• 结果会自动四舍五入到分</li>
              <li>• 可选择使用当天作为终止日期或自定义终止日期</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JudgmentInterestCalculator;