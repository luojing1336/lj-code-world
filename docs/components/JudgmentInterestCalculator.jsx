import { useState } from 'react';
import './JudgmentInterestCalculator.css';

const JudgmentInterestCalculator = () => {
  const [principal, setPrincipal] = useState('446386.8');
  const [startDate, setStartDate] = useState('2025-02-27');
  const [endDate, setEndDate] = useState('');
  const [useToday, setUseToday] = useState(true);
  const [lpr, setLpr] = useState('3.10');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const formatDate = (dateStr) => {
    if (!dateStr) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return today;
    }
    return new Date(dateStr + 'T00:00:00');
  };

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
    <div className="container">
      <div className="card">
        <div className="header">
          <h1>判决利息计算器</h1>
          <p>精确计算判决书中的利息金额，支持LPR利率计算</p>
        </div>

        <div className="body">
          <div className="form-grid">
            <div className="form-group">
              <label>本金（元）</label>
              <input
                type="number"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                placeholder="请输入本金"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label>起始日期</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>LPR利率（%）</label>
              <input
                type="number"
                value={lpr}
                onChange={(e) => setLpr(e.target.value)}
                placeholder="请输入LPR利率"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label>终止日期</label>
              <div>
                <label>
                  <input
                    type="checkbox"
                    checked={useToday}
                    onChange={(e) => setUseToday(e.target.checked)}
                  />
                  使用今天作为终止日期
                </label>
                {!useToday && (
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button onClick={calculateInterest}>计算利息</button>
          </div>

          {error && <div className="error">{error}</div>}

          {result && (
            <div className="result">
              <h2>计算结果</h2>
              <ul>
                <li><strong>本金：</strong>{result.详情.本金}</li>
                <li><strong>起始日期：</strong>{result.详情.起始日}</li>
                <li><strong>终止日期：</strong>{result.详情.终止日}</li>
                <li><strong>计息天数：</strong>{result.详情.计息天数} 天</li>
                <li><strong>LPR年利率：</strong>{result.详情.LPR利率}</li>
                <li><strong>LPR日利率：</strong>{result.详情.LPR日利率}</li>
                <li><strong>应付利息：</strong>{result.详情.利息结果}</li>
                <li><strong>中文大写：</strong>{result.详情.利息文字}</li>
              </ul>
              <p className="calc-time">计算时间：{new Date().toLocaleString('zh-CN')}</p>
            </div>
          )}

          <div className="note">
            <h3>使用说明</h3>
            <ul>
              <li>基于360天计息方式计算判决利息</li>
              <li>LPR利率请填写百分比数值，如3.10表示3.10%</li>
              <li>计息天数包含起始日和终止日</li>
              <li>结果会自动四舍五入到分</li>
              <li>可选择使用当天作为终止日期或自定义终止日期</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JudgmentInterestCalculator;
