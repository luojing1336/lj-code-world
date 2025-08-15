import React, { useState } from 'react';
import { 
  Card, 
  InputNumber, 
  DatePicker, 
  Checkbox, 
  Button, 
  Alert, 
  Descriptions, 
  Typography, 
  Space,
  Divider,
  Row,
  Col 
} from 'antd';
import { 
  CalculatorOutlined, 
  CalendarOutlined, 
  DollarOutlined,
  InfoCircleOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';
import './index.css';

const { Title, Paragraph, Text } = Typography;

const JudgmentCalculator = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [formData, setFormData] = useState({
    principal: 446386.8,
    startDate: dayjs('2025-02-27'),
    lpr: 3.10,
    useToday: true,
    endDate: null
  });

  // 数字转中文大写函数
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

  // 处理表单输入变化
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 表单验证
  const validateForm = () => {
    if (!formData.principal || formData.principal <= 0) {
      throw new Error('本金必须为正数');
    }
    if (!formData.lpr || formData.lpr < 0) {
      throw new Error('利率必须为非负数');
    }
    if (!formData.startDate) {
      throw new Error('请选择起始日期');
    }
    if (!formData.useToday && !formData.endDate) {
      throw new Error('请选择终止日期');
    }
  };

  // 计算利息
  const calculateInterest = async () => {
    try {
      setLoading(true);
      setError('');

      validateForm();

      const { principal, startDate, lpr, endDate, useToday } = formData;

      const start = dayjs(startDate);
      const end = useToday ? dayjs() : dayjs(endDate);

      if (end.isBefore(start)) {
        throw new Error('终止日不能早于起始日');
      }

      const days = end.diff(start, 'day') + 1;
      const dailyRate = lpr / 100 / 360;
      const interest = principal * dailyRate * days;
      const roundedInterest = Math.round(interest * 100) / 100;

      setResult({
        days,
        interest: roundedInterest,
        details: {
          principal: principal.toLocaleString('zh-CN', { style: 'currency', currency: 'CNY' }),
          startDate: start.format('YYYY年MM月DD日'),
          endDate: end.format('YYYY年MM月DD日'),
          days,
          lprPercent: `${lpr}%`,
          dailyRate: `${(dailyRate * 100).toFixed(6)}%`,
          interestFormatted: roundedInterest.toLocaleString('zh-CN', { style: 'currency', currency: 'CNY' }),
          interestInChinese: convertCurrency(roundedInterest),
        },
      });
    } catch (err) {
      setError(err.message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="judgment-calculator">
      <Card className="calculator-card">
        {/* 头部标题 */}
        <div className="header">
          <Title level={2} className="title">
            <CalculatorOutlined className="title-icon" />
            判决利息计算器
          </Title>
          <Paragraph className="subtitle">
            精确计算判决书中的利息金额，支持LPR利率计算
          </Paragraph>
        </div>

        {/* 表单输入区域 */}
        <div className="calculator-form">
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <div className="form-item">
                <label className="form-label">
                  <Space>
                    <DollarOutlined />
                    本金（元）
                  </Space>
                </label>
                <InputNumber
                  value={formData.principal}
                  onChange={(value) => handleInputChange('principal', value)}
                  placeholder="请输入本金"
                  style={{ width: '100%' }}
                  size="large"
                  precision={2}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                />
              </div>
            </Col>

            <Col span={12}>
              <div className="form-item">
                <label className="form-label">
                  <Space>
                    <CalendarOutlined />
                    起始日期
                  </Space>
                </label>
                <DatePicker 
                  value={formData.startDate}
                  onChange={(date) => handleInputChange('startDate', date)}
                  style={{ width: '100%' }} 
                  size="large"
                />
              </div>
            </Col>

            <Col span={12}>
              <div className="form-item">
                <label className="form-label">LPR利率（%）</label>
                <InputNumber
                  value={formData.lpr}
                  onChange={(value) => handleInputChange('lpr', value)}
                  placeholder="请输入LPR利率"
                  style={{ width: '100%' }}
                  size="large"
                  precision={2}
                  min={0}
                  max={100}
                />
              </div>
            </Col>

            <Col span={24}>
              <Checkbox
                checked={formData.useToday}
                onChange={(e) => handleInputChange('useToday', e.target.checked)}
                className="checkbox-item"
              >
                使用今天作为终止日期
              </Checkbox>
            </Col>

            {!formData.useToday && (
              <Col span={24}>
                <div className="form-item">
                  <label className="form-label">
                    <Space>
                      <CalendarOutlined />
                      终止日期
                    </Space>
                  </label>
                  <DatePicker 
                    value={formData.endDate}
                    onChange={(date) => handleInputChange('endDate', date)}
                    style={{ width: '100%' }} 
                    size="large"
                  />
                </div>
              </Col>
            )}

            <Col span={24}>
              <Button
                type="primary"
                onClick={calculateInterest}
                loading={loading}
                size="large"
                className="calculate-button"
                icon={<CalculatorOutlined />}
                block
              >
                计算利息
              </Button>
            </Col>
          </Row>
        </div>

        {/* 错误提示 */}
        {error && (
          <Alert
            message="计算错误"
            description={error}
            type="error"
            showIcon
            className="error-alert"
          />
        )}

        {/* 计算结果 */}
        {result && (
          <Card className="result-card" title="计算结果" type="inner">
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="本金">
                <Text strong>{result.details.principal}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="起始日期">
                {result.details.startDate}
              </Descriptions.Item>
              <Descriptions.Item label="终止日期">
                {result.details.endDate}
              </Descriptions.Item>
              <Descriptions.Item label="计息天数">
                <Text strong>{result.details.days} 天</Text>
              </Descriptions.Item>
              <Descriptions.Item label="LPR年利率">
                {result.details.lprPercent}
              </Descriptions.Item>
              <Descriptions.Item label="LPR日利率">
                <Text type="secondary">{result.details.dailyRate}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="应付利息">
                <Text strong className="interest-amount">
                  {result.details.interestFormatted}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="中文大写">
                <Text code>{result.details.interestInChinese}</Text>
              </Descriptions.Item>
            </Descriptions>
            <Divider />
            <Text type="secondary" className="timestamp">
              计算时间：{dayjs().format('YYYY-MM-DD HH:mm:ss')}
            </Text>
          </Card>
        )}

        {/* 使用说明 */}
        <Card className="instructions-card" type="inner">
          <Title level={4}>
            <InfoCircleOutlined className="info-icon" />
            使用说明
          </Title>
          <ul className="instructions-list">
            <li>基于360天计息方式计算判决利息</li>
            <li>LPR利率请填写百分比数值，如3.10表示3.10%</li>
            <li>计息天数包含起始日和终止日</li>
            <li>结果会自动四舍五入到分</li>
            <li>可选择使用当天作为终止日期或自定义终止日期</li>
          </ul>
        </Card>
      </Card>
    </div>
  );
};

export default JudgmentCalculator;