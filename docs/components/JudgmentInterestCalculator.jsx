import React, { useState } from 'react';

const JudgmentInterestCalculator = () => {
  const [formData, setFormData] = useState({
    principal: '446386.8',
    startDate: '2025-02-27',
    lpr: '3.10',
    endDate: '',
    useToday: true,
  });
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

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

  const formatDate = (dateStr) => {
    if (!dateStr) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return today;
    }
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const calculateInterest = (e) => {
    e.preventDefault();
    try {
      setError('');
      const principalNum = parseFloat(formData.principal);
      const lprNum = parseFloat(formData.lpr);

      if (isNaN(principalNum) || principalNum <= 0) throw new Error('本金必须为正数');
      if (isNaN(lprNum) || lprNum < 0) throw new Error('利率必须为非负数');

      const start = formatDate(formData.startDate);
      const end = formData.useToday ? formatDate('') : formatDate(formData.endDate);

      if (end < start) throw new Error('终止日不能早于起始日');

      const millisecondsPerDay = 1000 * 60 * 60 * 24;
      const utcStart = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
      const utcEnd = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
      const days = Math.round((utcEnd - utcStart) / millisecondsPerDay) + 1;

      const dailyRate = lprNum / 100 / 360;
      const interest = principalNum * dailyRate * days;
      const roundedInterest = Math.round(interest * 100) / 100;

      const formatDateForOutput = (date) =>
        `${date.getFullYear()}年${(date.getMonth() + 1).toString().padStart(2, '0')}月${date.getDate().toString().padStart(2, '0')}日`;

      setResult({
        days,
        interest: roundedInterest,
        details: {
          principal: principalNum.toLocaleString('zh-CN', { style: 'currency', currency: 'CNY' }),
          startDate: formatDateForOutput(start),
          endDate: formatDateForOutput(end),
          days,
          lprPercent: `${lprNum}%`,
          dailyRate: `${(dailyRate * 100).toFixed(6)}%`,
          interestFormatted: roundedInterest.toLocaleString('zh-CN', { style: 'currency', currency: 'CNY' }),
          interestInChinese: convertCurrency(roundedInterest),
        },
      });
    } catch (err) {
      setError(err.message);
      setResult(null);
    }
  };

  return (
    <div className="container">
      <section className="card">
        <h2 className="title">判决利息计算器</h2>
        <p className="subtitle">精确计算判决书中的利息金额，支持LPR利率计算</p>
        <form onSubmit={calculateInterest} className="form">
          <label>
            本金（元）
            <input
              type="number"
              step="0.01"
              name="principal"
              value={formData.principal}
              onChange={handleChange}
              placeholder="请输入本金"
              required
            />
          </label>
          <label>
            起始日期
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            LPR利率（%）
            <input
              type="number"
              step="0.01"
              name="lpr"
              value={formData.lpr}
              onChange={handleChange}
              placeholder="请输入LPR利率"
              required
            />
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="useToday"
              checked={formData.useToday}
              onChange={handleChange}
            />
            使用今天作为终止日期
          </label>
          {!formData.useToday && (
            <label>
              终止日期
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required={!formData.useToday}
              />
            </label>
          )}
          <button type="submit" className="btn-primary">计算利息</button>
        </form>

        {error && <div className="alert">{error}</div>}

        {result && (
          <section className="result-card">
            <h3>计算结果</h3>
            <ul>
              <li><strong>本金：</strong>{result.details.principal}</li>
              <li><strong>起始日期：</strong>{result.details.startDate}</li>
              <li><strong>终止日期：</strong>{result.details.endDate}</li>
              <li><strong>计息天数：</strong>{result.details.days} 天</li>
              <li><strong>LPR年利率：</strong>{result.details.lprPercent}</li>
              <li><strong>LPR日利率：</strong>{result.details.dailyRate}</li>
              <li><strong>应付利息：</strong>{result.details.interestFormatted}</li>
              <li><strong>中文大写：</strong>{result.details.interestInChinese}</li>
            </ul>
            <p className="timestamp">计算时间：{new Date().toLocaleString('zh-CN')}</p>
          </section>
        )}

        <section className="instructions">
          <h3>使用说明</h3>
          <ul>
            <li>基于360天计息方式计算判决利息</li>
            <li>LPR利率请填写百分比数值，如3.10表示3.10%</li>
            <li>计息天数包含起始日和终止日</li>
            <li>结果会自动四舍五入到分</li>
            <li>可选择使用当天作为终止日期或自定义终止日期</li>
          </ul>
        </section>
      </section>

      <style>{`
        .container {
          max-width: 480px;
          margin: 40px auto;
          padding: 16px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          color: #222;
          background: #fff;
          border-radius: 24px;
          box-shadow: 0 8px 32px rgba(100, 150, 200, 0.18);
        }
        .title {
          text-align: center;
          margin-bottom: 8px;
          font-weight: 700;
          letter-spacing: 2px;
          font-size: 1.8rem;
          color: #0044cc;
        }
        .subtitle {
          text-align: center;
          color: #6c7a89;
          margin-bottom: 24px;
        }
        .form label {
          display: block;
          margin-bottom: 16px;
          font-weight: 500;
          font-size: 1rem;
        }
        input[type="number"],
        input[type="date"] {
          width: 100%;
          padding: 10px 12px;
          margin-top: 6px;
          border: 1.5px solid #ddd;
          border-radius: 8px;
          font-size: 1rem;
          box-sizing: border-box;
          transition: border-color 0.3s ease;
        }
        input[type="number"]:focus,
        input[type="date"]:focus {
          border-color: #4f8cff;
          outline: none;
        }
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
        }
        .btn-primary {
          width: 100%;
          background: linear-gradient(90deg,#4f8cff 0%,#38c8fa 100%);
          border: none;
          padding: 12px 0;
          font-weight: 600;
          letter-spacing: 1px;
          color: white;
          font-size: 1.1rem;
          border-radius: 10px;
          cursor: pointer;
          transition: background 0.3s ease;
        }
        .btn-primary:hover {
          background: linear-gradient(90deg,#3a75d1 0%,#29b7e6 100%);
        }
        .alert {
          margin: 16px 0;
          padding: 12px 16px;
          border-radius: 12px;
          background-color: #fce4e4;
          color: #cc0000;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(204, 0, 0, 0.2);
        }
        .result-card {
          margin-top: 24px;
          background: linear-gradient(90deg,#e0f7fa 0%,#f1f8ff 100%);
          border-radius: 16px;
          padding: 16px 20px;
          box-shadow: none;
        }
        .result-card h3 {
          color: #4f8cff;
          font-weight: 600;
          margin-bottom: 12px;
        }
        .result-card ul {
          list-style: none;
          padding-left: 0;
          margin-bottom: 8px;
        }
        .result-card li {
          padding: 6px 0;
          font-size: 1rem;
        }
        .result-card li strong {
          color: #888;
          font-weight: 500;
          margin-right: 6px;
        }
        .result-card .timestamp {
          font-size: 0.85rem;
          color: #4f8cff;
          margin-top: 4px;
        }
        .instructions {
          margin-top: 24px;
          background: #f8fcff;
          border-radius: 16px;
          padding: 12px 14px;
          color: #6c7a89;
        }
        .instructions h3 {
          color: #38c8fa;
          font-weight: 600;
          margin-bottom: 12px;
        }
        .instructions ul {
          list-style: disc inside;
          margin: 0;
          padding: 0;
        }
        .instructions li {
          font-size: 0.95rem;
          padding: 4px 0;
        }
        @media (max-width: 600px) {
          .container {
            margin: 16px 8px;
            border-radius: 16px;
            padding: 12px;
          }
          .title {
            font-size: 1.5rem;
            letter-spacing: 1px;
          }
          .btn-primary {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default JudgmentInterestCalculator;
