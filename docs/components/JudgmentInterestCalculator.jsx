import React, { useState } from 'react';

// 样式模块函数
const getStyles = () => ({
  container: {
    margin: '40px auto',
    padding: '16px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    color: '#222',
    background: '#fff',
    borderRadius: '24px',
    boxShadow: '0 8px 32px rgba(100, 150, 200, 0.18)',
  },
  
  title: {
    textAlign: 'center',
    marginBottom: '8px',
    fontWeight: '700',
    letterSpacing: '2px',
    fontSize: '1.8rem',
    color: '#0044cc',
  },
  
  subtitle: {
    textAlign: 'center',
    color: '#6c7a89',
    marginBottom: '24px',
  },
  
  formLabel: {
    display: 'block',
    marginBottom: '16px',
    fontWeight: '500',
    fontSize: '1rem',
  },
  
  input: {
    width: '100%',
    padding: '10px 12px',
    marginTop: '6px',
    border: '1.5px solid #ddd',
    borderRadius: '8px',
    fontSize: '1rem',
    boxSizing: 'border-box',
    transition: 'border-color 0.3s ease',
  },
  
  inputFocus: {
    borderColor: '#4f8cff',
    outline: 'none',
  },
  
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: '500',
  },
  
  btnPrimary: {
    width: '100%',
    background: 'linear-gradient(90deg,#4f8cff 0%,#38c8fa 100%)',
    border: 'none',
    padding: '12px 0',
    fontWeight: '600',
    letterSpacing: '1px',
    color: 'white',
    fontSize: '1.1rem',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'background 0.3s ease',
  },
  
  btnPrimaryHover: {
    background: 'linear-gradient(90deg,#3a75d1 0%,#29b7e6 100%)',
  },
  
  alert: {
    margin: '16px 0',
    padding: '12px 16px',
    borderRadius: '12px',
    backgroundColor: '#fce4e4',
    color: '#cc0000',
    fontWeight: '600',
    boxShadow: '0 2px 8px rgba(204, 0, 0, 0.2)',
  },
  
  resultCard: {
    marginTop: '24px',
    background: 'linear-gradient(90deg,#e0f7fa 0%,#f1f8ff 100%)',
    borderRadius: '16px',
    padding: '16px 20px',
    boxShadow: 'none',
  },
  
  resultTitle: {
    color: '#4f8cff',
    fontWeight: '600',
    marginBottom: '12px',
  },
  
  resultList: {
    listStyle: 'none',
    paddingLeft: '0',
    marginBottom: '8px',
  },
  
  resultItem: {
    padding: '6px 0',
    fontSize: '1rem',
  },
  
  resultItemStrong: {
    color: '#888',
    fontWeight: '500',
    marginRight: '6px',
  },
  
  timestamp: {
    fontSize: '0.85rem',
    color: '#4f8cff',
    marginTop: '4px',
  },
  
  instructions: {
    marginTop: '24px',
    background: '#f8fcff',
    borderRadius: '16px',
    padding: '12px 14px',
    color: '#6c7a89',
  },
  
  instructionsTitle: {
    color: '#38c8fa',
    fontWeight: '600',
    marginBottom: '12px',
  },
  
  instructionsList: {
    listStyle: 'disc inside',
    margin: '0',
    padding: '0',
  },
  
  instructionsItem: {
    fontSize: '0.95rem',
    padding: '4px 0',
  },
});

// 响应式样式函数
const getResponsiveStyles = () => `
  @media (max-width: 600px) {
    .container {
      margin: 16px 8px !important;
      border-radius: 16px !important;
      padding: 12px !important;
    }
    .title {
      font-size: 1.5rem !important;
      letter-spacing: 1px !important;
    }
    .btn-primary {
      font-size: 1rem !important;
    }
  }
`;

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

  const styles = getStyles();

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
    <div style={styles.container} className="container">
      <section>
        <h2 style={styles.title} className="title">判决利息计算器</h2>
        <p style={styles.subtitle}>精确计算判决书中的利息金额，支持LPR利率计算</p>
        
        <div onSubmit={calculateInterest}>
          <label style={styles.formLabel}>
            本金（元）
            <input
              type="number"
              step="0.01"
              name="principal"
              value={formData.principal}
              onChange={handleChange}
              placeholder="请输入本金"
              required
              style={styles.input}
              onFocus={(e) => e.target.style.borderColor = '#4f8cff'}
              onBlur={(e) => e.target.style.borderColor = '#ddd'}
            />
          </label>
          
          <label style={styles.formLabel}>
            起始日期
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
              style={styles.input}
              onFocus={(e) => e.target.style.borderColor = '#4f8cff'}
              onBlur={(e) => e.target.style.borderColor = '#ddd'}
            />
          </label>
          
          <label style={styles.formLabel}>
            LPR利率（%）
            <input
              type="number"
              step="0.01"
              name="lpr"
              value={formData.lpr}
              onChange={handleChange}
              placeholder="请输入LPR利率"
              required
              style={styles.input}
              onFocus={(e) => e.target.style.borderColor = '#4f8cff'}
              onBlur={(e) => e.target.style.borderColor = '#ddd'}
            />
          </label>
          
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="useToday"
              checked={formData.useToday}
              onChange={handleChange}
            />
            使用今天作为终止日期
          </label>
          
          {!formData.useToday && (
            <label style={styles.formLabel}>
              终止日期
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required={!formData.useToday}
                style={styles.input}
                onFocus={(e) => e.target.style.borderColor = '#4f8cff'}
                onBlur={(e) => e.target.style.borderColor = '#ddd'}
              />
            </label>
          )}
          
          <button 
            onClick={calculateInterest}
            style={styles.btnPrimary}
            className="btn-primary"
            onMouseEnter={(e) => e.target.style.background = 'linear-gradient(90deg,#3a75d1 0%,#29b7e6 100%)'}
            onMouseLeave={(e) => e.target.style.background = 'linear-gradient(90deg,#4f8cff 0%,#38c8fa 100%)'}
          >
            计算利息
          </button>
        </div>

        {error && <div style={styles.alert}>{error}</div>}

        {result && (
          <section style={styles.resultCard}>
            <h3 style={styles.resultTitle}>计算结果</h3>
            <ul style={styles.resultList}>
              <li style={styles.resultItem}>
                <span style={styles.resultItemStrong}>本金：</span>
                {result.details.principal}
              </li>
              <li style={styles.resultItem}>
                <span style={styles.resultItemStrong}>起始日期：</span>
                {result.details.startDate}
              </li>
              <li style={styles.resultItem}>
                <span style={styles.resultItemStrong}>终止日期：</span>
                {result.details.endDate}
              </li>
              <li style={styles.resultItem}>
                <span style={styles.resultItemStrong}>计息天数：</span>
                {result.details.days} 天
              </li>
              <li style={styles.resultItem}>
                <span style={styles.resultItemStrong}>LPR年利率：</span>
                {result.details.lprPercent}
              </li>
              <li style={styles.resultItem}>
                <span style={styles.resultItemStrong}>LPR日利率：</span>
                {result.details.dailyRate}
              </li>
              <li style={styles.resultItem}>
                <span style={styles.resultItemStrong}>应付利息：</span>
                {result.details.interestFormatted}
              </li>
              <li style={styles.resultItem}>
                <span style={styles.resultItemStrong}>中文大写：</span>
                {result.details.interestInChinese}
              </li>
            </ul>
            <p style={styles.timestamp}>计算时间：{new Date().toLocaleString('zh-CN')}</p>
          </section>
        )}

        <section style={styles.instructions}>
          <h3 style={styles.instructionsTitle}>使用说明</h3>
          <ul style={styles.instructionsList}>
            <li style={styles.instructionsItem}>基于360天计息方式计算判决利息</li>
            <li style={styles.instructionsItem}>LPR利率请填写百分比数值，如3.10表示3.10%</li>
            <li style={styles.instructionsItem}>计息天数包含起始日和终止日</li>
            <li style={styles.instructionsItem}>结果会自动四舍五入到分</li>
            <li style={styles.instructionsItem}>可选择使用当天作为终止日期或自定义终止日期</li>
          </ul>
        </section>
      </section>

      <style>{getResponsiveStyles()}</style>
    </div>
  );
};

export default JudgmentInterestCalculator;