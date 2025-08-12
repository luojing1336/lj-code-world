import { useState } from 'react';
import { Form, Input, DatePicker, Checkbox, Button, Card, Alert, List, Typography, Space } from 'antd';
import dayjs from 'dayjs';
import 'antd/dist/reset.css';

const { Title, Paragraph } = Typography;

const JudgmentInterestCalculator = () => {
  const [form] = Form.useForm();
  const [useToday, setUseToday] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const formatDate = (dateObj) => {
    if (!dateObj) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return today;
    }
    return new Date(dateObj.year(), dateObj.month(), dateObj.date());
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

  const calculateInterest = (values) => {
    try {
      setError('');
      const principalNum = parseFloat(values.principal);
      const lprNum = parseFloat(values.lpr);

      if (isNaN(principalNum) || principalNum <= 0) {
        throw new Error('本金必须为正数');
      }
      if (isNaN(lprNum) || lprNum < 0) {
        throw new Error('利率必须为非负数');
      }

      const start = formatDate(values.startDate);
      const end = useToday ? formatDate(null) : formatDate(values.endDate);

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
    <div>
      <Card
        style={{
          margin: '0 auto',
          borderRadius: 24,
          boxShadow: '0 8px 32px rgba(100, 150, 200, 0.18)',
          background: '#fff',
        }}
        bodyStyle={{ padding: '32px 24px' }}
      >
        <Title level={2} style={{ textAlign: 'center', marginBottom: 8, fontWeight: 700, letterSpacing: 2 }}>
          判决利息计算器
        </Title>
        <Paragraph style={{ textAlign: 'center', color: '#6c7a89', marginBottom: 24 }}>
          精确计算判决书中的利息金额，支持LPR利率计算
        </Paragraph>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            principal: '446386.8',
            startDate: dayjs('2025-02-27'),
            lpr: '3.10',
            endDate: null,
          }}
          onFinish={calculateInterest}
          style={{ marginBottom: 16 }}
        >
          <Form.Item
            label={<span style={{ fontWeight: 500 }}>本金（元）</span>}
            name="principal"
            rules={[{ required: true, message: '请输入本金' }]}
            style={{ marginBottom: 18 }}
          >
            <Input type="number" step="0.01" placeholder="请输入本金" size="large" />
          </Form.Item>
          <Form.Item
            label={<span style={{ fontWeight: 500 }}>起始日期</span>}
            name="startDate"
            rules={[{ required: true, message: '请选择起始日期' }]}
            style={{ marginBottom: 18 }}
          >
            <DatePicker style={{ width: '100%' }} size="large" />
          </Form.Item>
          <Form.Item
            label={<span style={{ fontWeight: 500 }}>LPR利率（%）</span>}
            name="lpr"
            rules={[{ required: true, message: '请输入LPR利率' }]}
            style={{ marginBottom: 18 }}
          >
            <Input type="number" step="0.01" placeholder="请输入LPR利率" size="large" />
          </Form.Item>
          <Form.Item label={<span style={{ fontWeight: 500 }}>终止日期</span>} style={{ marginBottom: 18 }}>
            <Checkbox checked={useToday} onChange={e => setUseToday(e.target.checked)}>
              使用今天作为终止日期
            </Checkbox>
            {!useToday && (
              <Form.Item
                name="endDate"
                rules={[{ required: true, message: '请选择终止日期' }]}
                style={{ marginTop: 8, marginBottom: 0 }}
              >
                <DatePicker style={{ width: '100%' }} size="large" />
              </Form.Item>
            )}
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              style={{
                width: '100%',
                background: 'linear-gradient(90deg,#4f8cff 0%,#38c8fa 100%)',
                border: 'none',
                fontWeight: 600,
                letterSpacing: 1,
              }}
            >
              计算利息
            </Button>
          </Form.Item>
        </Form>
        {error && (
          <Alert
            type="error"
            message={error}
            style={{
              marginBottom: 16,
              borderRadius: 12,
              fontWeight: 500,
            }}
            showIcon
          />
        )}
        {result && (
          <Card
            type="inner"
            title={<span style={{ color: '#4f8cff', fontWeight: 600 }}>计算结果</span>}
            style={{
              marginBottom: 16,
              borderRadius: 16,
              background: 'linear-gradient(90deg,#e0f7fa 0%,#f1f8ff 100%)',
              border: 'none',
            }}
            bodyStyle={{ padding: '18px 16px' }}
          >
            <List
              size="small"
              dataSource={[
                { label: '本金', value: result.详情.本金 },
                { label: '起始日期', value: result.详情.起始日 },
                { label: '终止日期', value: result.详情.终止日 },
                { label: '计息天数', value: `${result.详情.计息天数} 天` },
                { label: 'LPR年利率', value: result.详情.LPR利率 },
                { label: 'LPR日利率', value: result.详情.LPR日利率 },
                { label: '应付利息', value: result.详情.利息结果 },
                { label: '中文大写', value: result.详情.利息文字 },
              ]}
              renderItem={item => (
                <List.Item style={{ padding: '6px 0', fontSize: 16 }}>
                  <span style={{ color: '#888', fontWeight: 500 }}>{item.label}：</span>
                  <span style={{ color: '#222', fontWeight: 600 }}>{item.value}</span>
                </List.Item>
              )}
            />
            <Paragraph type="secondary" style={{ marginTop: 8, fontSize: 13, color: '#4f8cff' }}>
              计算时间：{new Date().toLocaleString('zh-CN')}
            </Paragraph>
          </Card>
        )}
        <Card
          type="inner"
          title={<span style={{ color: '#38c8fa', fontWeight: 600 }}>使用说明</span>}
          style={{
            borderRadius: 16,
            background: '#f8fcff',
            border: 'none',
          }}
          bodyStyle={{ padding: '16px 14px' }}
        >
          <List
            size="small"
            dataSource={[
              '基于360天计息方式计算判决利息',
              'LPR利率请填写百分比数值，如3.10表示3.10%',
              '计息天数包含起始日和终止日',
              '结果会自动四舍五入到分',
              '可选择使用当天作为终止日期或自定义终止日期',
            ]}
            renderItem={item => (
              <List.Item style={{ color: '#6c7a89', fontSize: 15, padding: '4px 0' }}>
                {item}
              </List.Item>
            )}
          />
        </Card>
      </Card>
      <style>{`
        @media (max-width: 600px) {
          .ant-card {
            max-width: 98vw !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default JudgmentInterestCalculator;