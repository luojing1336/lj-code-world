import { useEffect, useState, useLayoutEffect, useMemo, useCallback } from "react";
import {
  Layout,
  Card,
  Form,
  Button,
  Table,
  DatePicker,
  InputNumber,
  Select,
  Row,
  Col,
  Statistic,
  message,
  Skeleton,
  Progress,
  Tabs,
  Space,
  Badge,
  Tag,
  Empty,
  Tooltip,
  Drawer,
} from "antd";
import {
  HeartOutlined,
  TrophyOutlined,
  MedicineBoxOutlined,
  PlusOutlined,
  LineChartOutlined,
  FireOutlined,
  CalendarOutlined,
  RiseOutlined,
  FallOutlined,
  ClockCircleOutlined,
  DashboardOutlined,
  BarChartOutlined,
  PieChartOutlined,
  UserOutlined,
  AimOutlined,
  ScissorOutlined,
  FundOutlined,
} from "@ant-design/icons";
import ReactECharts from "echarts-for-react";
import Decimal from "decimal.js";
import dayjs from "dayjs";

// Local imports
import "./index.css";
import { supabase } from "../../../apis/supabase";

const { Header, Content } = Layout;
const { Option } = Select;
const { TabPane } = Tabs;
const supabaseClient = supabase();


const HealthManagement = () => {
  const [form] = Form.useForm();
  const [healthRecords, setHealthRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("weight");
  const [isMobile, setIsMobile] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [chartKey, setChartKey] = useState(0);

  useLayoutEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    getHealthRecords();
  }, []);

  // Handle chart resize when tab changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setChartKey(prev => prev + 1);
      // Trigger window resize event to force ECharts to recalculate
      window.dispatchEvent(new Event('resize'));
    }, 100);
    
    return () => clearTimeout(timer);
  }, [activeTab]);

  const getHealthRecords = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabaseClient
        .from("health_records")
        .select("*")
        .order("date", { ascending: false }); // 按日期降序排列

      if (error) {
        console.error("Error loading health records:", error);
        message.error("加载健康记录失败");
        setHealthRecords([]);
      } else {
        console.log("Health records loaded:", data);
        setHealthRecords(data || []);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      message.error("加载健康记录失败");
      setHealthRecords([]);
    } finally {
      setLoading(false);
    }
  };

  // Optimized tab change handler
  const handleTabChange = useCallback((key) => {
    setActiveTab(key);
  }, []);
  
  const showDrawer = useCallback(() => {
    setDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    form.resetFields();
  }, [form]);

  const addHealthRecord = useCallback(async (values) => {
    setLoading(true);
    closeDrawer();

    try {
      // 准备要插入的数据
      const newRecord = {
        date: values.date.format("YYYY-MM-DD"),
        weight: values.weight,
        exerciseType: values.exerciseType || null,
        exerciseMinutes: values.exerciseMinutes || null,
        medicationType: values.medicationType || null,
        medicationAmount: values.medicationAmount || null,
      };

      const { data, error } = await supabaseClient
        .from("health_records")
        .insert([newRecord])
        .select(); // 返回插入的数据

      if (error) {
        console.error("Error adding health record:", error);
        if (error.code === '23505') {
          message.error("该日期已存在健康记录，请选择其他日期");
        } else {
          message.error("添加健康记录失败");
        }
      } else {
        console.log("Health record added:", data);
        message.success("健康记录添加成功");
        form.resetFields();
        // 重新加载数据以获取最新的记录列表
        await getHealthRecords();
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      message.error("添加健康记录失败");
    } finally {
      setLoading(false);
    }
  }, [form, closeDrawer]);

  // Memoized statistics calculation for better performance
  const statistics = useMemo(() => {
    if (healthRecords.length === 0) return {};

    const weights = healthRecords
      .map((record) => record.weight)
      .filter((w) => w && !isNaN(w));
    const exercises = healthRecords
      .map((record) => record.exerciseMinutes)
      .filter((e) => e && !isNaN(e));
    const medications = healthRecords.filter((record) => record.medicationType);

    // 由于数据现在是降序排列，最新的在前面，最早的在后面
    const currentWeight = weights.length > 0 ? weights[0] : 0; // 最新的体重
    const initialWeight = weights.length > 0 ? weights[weights.length - 1] : 0; // 最早的体重
    
    // 健康指标常量 - 可以后续从用户设置或表单中获取
    const userHeight = 1.73; // 身高 1.75米，可配置
    const targetWeight = 75; // 目标体重 75kg，可配置

    let weightLoss = 0;
    let weightLossPercent = 0;
    let bmi = 0;
    let remainingWeight = 0;

    if (weights.length > 1) {
      const initial = new Decimal(initialWeight);
      const current = new Decimal(currentWeight);
      weightLoss = initial.minus(current).toNumber();

      if (initial.gt(0)) {
        weightLossPercent = new Decimal(weightLoss)
          .dividedBy(initial)
          .times(100)
          .toNumber();
      }
    }
    
    // 计算BMI (体重指数)
    if (currentWeight > 0 && userHeight > 0) {
      const heightDecimal = new Decimal(userHeight);
      const weightDecimal = new Decimal(currentWeight);
      bmi = weightDecimal
        .dividedBy(heightDecimal.pow(2))
        .toNumber();
    }
    
    // 计算剩余需要减重的重量
    if (currentWeight > 0 && targetWeight > 0) {
      const current = new Decimal(currentWeight);
      const target = new Decimal(targetWeight);
      remainingWeight = Math.max(current.minus(target).toNumber(), 0);
    }

    // 计算总运动时间
    let totalExerciseMinutes = 0;
    for (const minutes of exercises) {
      totalExerciseMinutes = new Decimal(totalExerciseMinutes)
        .plus(minutes)
        .toNumber();
    }

    // 计算平均运动时间
    let averageExercise = 0;
    if (exercises.length > 0) {
      averageExercise = new Decimal(totalExerciseMinutes)
        .dividedBy(exercises.length)
        .toNumber();
    }

    return {
      currentWeight,
      initialWeight,
      weightLoss,
      weightLossPercent,
      bmi,
      targetWeight,
      remainingWeight,
      userHeight,
      totalExerciseMinutes,
      medicationCount: medications.length,
      averageExercise,
      totalDays: healthRecords.length,
      exerciseDays: exercises.length,
      medicationDays: medications.length,
    };
  }, [healthRecords]);

  // 体重趋势图表
  const WeightChart = () => {
    const weights = healthRecords
      .filter((record) => record.weight && !isNaN(record.weight))
      .map((record) => ({
        date: record.date,
        weight: record.weight,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date)); // 为图表显示按日期升序排列

    if (weights.length === 0) {
      return (
        <Empty
          description="暂无体重数据"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          className="chart-empty-state"
        />
      );
    }

    // 计算体重的最小值和最大值
    const weightValues = weights.map(item => item.weight);
    const minWeight = Math.min(...weightValues);
    const maxWeight = Math.max(...weightValues);
    
    // 计算Y轴的最小值和最大值，取最近的10的倍数
    const yAxisMin = Math.floor(minWeight / 10) * 10;
    const yAxisMax = Math.ceil(maxWeight / 10) * 10;
    
    // 确保Y轴范围合理，至少有20kg的跨度
    const minRange = 20;
    const currentRange = yAxisMax - yAxisMin;
    let finalMin = yAxisMin;
    let finalMax = yAxisMax;
    
    if (currentRange < minRange) {
      const extraRange = minRange - currentRange;
      const extraBottom = Math.floor(extraRange / 2 / 10) * 10;
      const extraTop = Math.ceil((extraRange - extraBottom) / 10) * 10;
      finalMin = Math.max(0, yAxisMin - extraBottom);
      finalMax = yAxisMax + extraTop;
    }

    const option = {
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(255,255,255,0.95)",
        borderColor: "#e8e8e8",
        borderWidth: 1,
        textStyle: { color: "#333" },
        formatter: (params) => {
          const param = params[0];
          return `
            <div class="chart-tooltip">
              <div class="chart-tooltip-title">${param.name}</div>
              <div class="chart-tooltip-value">
                <span class="chart-tooltip-circle"></span>
                体重: ${param.value}kg
              </div>
            </div>
          `;
        },
      },
      xAxis: {
        type: "category",
        data: weights.map((item) => item.date.slice(5)),
        boundaryGap: false,
        axisLine: { lineStyle: { color: "#e8e8e8" } },
        axisTick: { show: false },
        axisLabel: {
          rotate: 0,
          fontSize: 12,
          color: "#666",
        },
      },
      yAxis: {
        type: "value",
        min: finalMin,
        max: finalMax,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          formatter: "{value}kg",
          fontSize: 12,
          color: "#666",
        },
        splitLine: {
          lineStyle: { color: "#f0f0f0", type: "dashed" },
        },
      },
      series: [
        {
          data: weights.map((item) => item.weight),
          type: "line",
          smooth: true,
          symbol: "circle",
          symbolSize: 6,
          lineStyle: {
            width: 3,
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 1,
              y2: 0,
              colorStops: [
                { offset: 0, color: "#1890ff" },
                { offset: 1, color: "#40a9ff" },
              ],
            },
          },
          itemStyle: {
            color: "#1890ff",
            borderColor: "#fff",
            borderWidth: 2,
          },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(24, 144, 255, 0.3)" },
                { offset: 1, color: "rgba(24, 144, 255, 0.05)" },
              ],
            },
          },
        },
      ],
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        top: "3%",
        containLabel: true,
      },
    };

    return (
      <div className="chart-container">
        <ReactECharts
          key={`weight-chart-${chartKey}`}
          option={option}
          style={{ height: "350px", width: "100%" }}
          opts={{ renderer: "svg" }}
          notMerge={true}
          lazyUpdate={true}
        />
      </div>
    );
  };

  // 运动类型分析图
  const ExerciseChart = () => {
    const exerciseData = healthRecords
      .filter((record) => record.exerciseType)
      .reduce((acc, record) => {
        acc[record.exerciseType] =
          (acc[record.exerciseType] || 0) + (record.exerciseMinutes || 0);
        return acc;
      }, {});

    const data = Object.entries(exerciseData).map(([type, minutes]) => ({
      name: type,
      value: minutes,
    }));

    if (data.length === 0) {
      return (
        <Empty
          description="暂无运动数据"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          className="chart-empty-state"
        />
      );
    }

    const colors = [
      "#1890ff",
      "#52c41a",
      "#faad14",
      "#f5222d",
      "#722ed1",
      "#13c2c2",
    ];

    const option = {
      tooltip: {
        trigger: "item",
        backgroundColor: "rgba(255,255,255,0.95)",
        borderColor: "#e8e8e8",
        borderWidth: 1,
        formatter: "{a} <br/>{b}: {c}分钟 ({d}%)",
      },
      legend: {
        orient: "horizontal",
        bottom: "0%",
        textStyle: { fontSize: 12 },
      },
      series: [
        {
          name: "运动时长",
          type: "pie",
          radius: ["40%", "70%"],
          center: ["50%", "45%"],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 4,
            borderColor: "#fff",
            borderWidth: 2,
          },
          label: {
            show: false,
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: "bold",
            },
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },
          data: data.map((item, index) => ({
            ...item,
            itemStyle: { color: colors[index % colors.length] },
          })),
        },
      ],
    };

    return (
      <div className="chart-container">
        <ReactECharts
          key={`exercise-chart-${chartKey}`}
          option={option}
          style={{ height: "350px", width: "100%" }}
          opts={{ renderer: "svg" }}
          notMerge={true}
          lazyUpdate={true}
        />
      </div>
    );
  };

  // 每日运动时长趋势
  const ExerciseTrendChart = () => {
    const exerciseData = healthRecords
      .filter(
        (record) => record.exerciseMinutes && !isNaN(record.exerciseMinutes)
      )
      .map((record) => ({
        date: record.date.slice(5),
        fullDate: record.date,
        minutes: record.exerciseMinutes,
        type: record.exerciseType,
      }))
      .sort((a, b) => new Date(a.fullDate) - new Date(b.fullDate)); // 为图表显示按日期升序排列

    if (exerciseData.length === 0) {
      return (
        <Empty
          description="暂无运动数据"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          className="chart-empty-state"
        />
      );
    }

    const option = {
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(255,255,255,0.95)",
        borderColor: "#e8e8e8",
        borderWidth: 1,
        formatter: (params) => {
          const param = params[0];
          const data = exerciseData[param.dataIndex];
          return `
            <div class="chart-tooltip">
              <div class="chart-tooltip-title">${param.name}</div>
              <div class="chart-tooltip-value chart-tooltip-exercise">
                <span class="chart-tooltip-circle chart-tooltip-circle-exercise"></span>
                ${data.type}: ${param.value}分钟
              </div>
            </div>
          `;
        },
      },
      xAxis: {
        type: "category",
        data: exerciseData.map((item) => item.date),
        axisLine: { lineStyle: { color: "#e8e8e8" } },
        axisTick: { show: false },
        axisLabel: { fontSize: 12, color: "#666" },
      },
      yAxis: {
        type: "value",
        name: "分钟",
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { fontSize: 12, color: "#666" },
        splitLine: { lineStyle: { color: "#f0f0f0", type: "dashed" } },
      },
      series: [
        {
          data: exerciseData.map((item) => item.minutes),
          type: "bar",
          barWidth: "50%",
          itemStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "#52c41a" },
                { offset: 1, color: "#73d13d" },
              ],
            },
            borderRadius: [4, 4, 0, 0],
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: "rgba(0, 0, 0, 0.3)",
            },
          },
        },
      ],
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        top: "3%",
        containLabel: true,
      },
    };

    return (
      <div className="chart-container">
        <ReactECharts
          key={`exercise-trend-chart-${chartKey}`}
          option={option}
          style={{ height: "350px", width: "100%" }}
          opts={{ renderer: "svg" }}
          notMerge={true}
          lazyUpdate={true}
        />
      </div>
    );
  };

  // BMI 趋势图表
  const BMITrendChart = () => {
    const bmiData = healthRecords
      .filter((record) => record.weight && !isNaN(record.weight))
      .map((record) => {
        const userHeight = statistics.userHeight || 1.75;
        const bmi = new Decimal(record.weight)
          .dividedBy(new Decimal(userHeight).pow(2))
          .toNumber();
        return {
          date: record.date.slice(5),
          fullDate: record.date,
          bmi: bmi,
          weight: record.weight,
        };
      })
      .sort((a, b) => new Date(a.fullDate) - new Date(b.fullDate)); // 为图表显示按日期升序排列

    if (bmiData.length === 0) {
      return (
        <Empty
          description="暂无BMI数据"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          className="chart-empty-state"
        />
      );
    }

    const option = {
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(255,255,255,0.95)",
        borderColor: "#e8e8e8",
        borderWidth: 1,
        textStyle: { color: "#333" },
        formatter: (params) => {
          const param = params[0];
          const data = bmiData[param.dataIndex];
          let category = "";
          const bmiValue = data.bmi;
          if (bmiValue < 18.5) category = "偏瘦";
          else if (bmiValue < 24) category = "正常";
          else if (bmiValue < 28) category = "偏胖";
          else category = "肥胖";
          
          return `
            <div class="chart-tooltip">
              <div class="chart-tooltip-title">${param.name}</div>
              <div class="chart-tooltip-value">
                <span class="chart-tooltip-circle" style="background-color: #06b6d4;"></span>
                BMI: ${param.value} (${category})
              </div>
              <div class="chart-tooltip-value">
                <span class="chart-tooltip-circle" style="background-color: #94a3b8;"></span>
                体重: ${data.weight}kg
              </div>
            </div>
          `;
        },
      },
      xAxis: {
        type: "category",
        data: bmiData.map((item) => item.date),
        boundaryGap: false,
        axisLine: { lineStyle: { color: "#e8e8e8" } },
        axisTick: { show: false },
        axisLabel: {
          rotate: 0,
          fontSize: 12,
          color: "#666",
        },
      },
      yAxis: {
        type: "value",
        min: 28,
        max: 38,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          formatter: "{value}",
          fontSize: 12,
          color: "#666",
        },
        splitLine: {
          lineStyle: { color: "#f0f0f0", type: "dashed" },
        },
      },
      // 添加BMI健康范围参考线
      series: [
        {
          name: "BMI趋势",
          data: bmiData.map((item) => item.bmi.toFixed(1)),
          type: "line",
          smooth: true,
          symbol: "circle",
          symbolSize: 6,
          lineStyle: {
            width: 3,
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 1,
              y2: 0,
              colorStops: [
                { offset: 0, color: "#06b6d4" },
                { offset: 1, color: "#22d3ee" },
              ],
            },
          },
          itemStyle: {
            color: "#06b6d4",
            borderColor: "#fff",
            borderWidth: 2,
          },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(6, 182, 212, 0.3)" },
                { offset: 1, color: "rgba(6, 182, 212, 0.05)" },
              ],
            },
          },
          markLine: {
            silent: true,
            lineStyle: {
              color: "#52c41a",
              type: "dashed",
              width: 2,
            },
            data: [
              {
                yAxis: 18.5,
                label: {
                  position: "end",
                  formatter: "正常下限 18.5",
                  color: "#52c41a",
                },
              },
              {
                yAxis: 24,
                label: {
                  position: "end",
                  formatter: "正常上限 24",
                  color: "#52c41a",
                },
              },
            ],
          },
        },
      ],
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        top: "3%",
        containLabel: true,
      },
    };

    return (
      <div className="chart-container">
        <ReactECharts
          key={`bmi-trend-chart-${chartKey}`}
          option={option}
          style={{ height: "350px", width: "100%" }}
          opts={{ renderer: "svg" }}
          notMerge={true}
          lazyUpdate={true}
        />
      </div>
    );
  };

  // 骨架屏组件
  const StatisticsSkeleton = () => (
    <Row gutter={[16, 16]}>
      {[1, 2, 3, 4].map((i) => (
        <Col xs={12} sm={6} key={i}>
          <Card>
            <Skeleton active paragraph={false} />
          </Card>
        </Col>
      ))}
    </Row>
  );

  const ChartSkeleton = () => (
    <Card>
      <Skeleton active paragraph={{ rows: 8 }} />
    </Card>
  );

  // 表格列配置
  const columns = [
    {
      title: "序号",
      key: "序号",
      width: 80,
      responsive: ["sm"],
      render: (_, record, index) => <Space>{index + 1}</Space>,
    },
    {
      title: "日期",
      dataIndex: "date",
      key: "date",
      sorter: (a, b) => new Date(b.date) - new Date(a.date), // 改为降序
      defaultSortOrder: 'descend', // 设置默认排序为降序
      responsive: ["sm"],
      render: (date) => (
        <Space>
          <CalendarOutlined />
          {date}
        </Space>
      ),
    },
    {
      title: "体重",
      dataIndex: "weight",
      key: "weight",
      render: (weight) =>
        weight && !isNaN(weight) ? (
          <Tag color="blue" icon={<UserOutlined />}>
            {weight} kg
          </Tag>
        ) : (
          "-"
        ),
      sorter: (a, b) => (a.weight || 0) - (b.weight || 0),
    },
    {
      title: "运动",
      key: "exercise",
      responsive: ["md"],
      render: (_, record) => (
        <div>
          {record.exerciseType ? (
            <>
              <div>
                <Tag color="green" icon={<FireOutlined />}>
                  {record.exerciseType}
                </Tag>
              </div>
              <div className="health-text-secondary exercise-minutes-text">
                <ClockCircleOutlined />
                {record.exerciseMinutes}分钟
              </div>
            </>
          ) : (
            <div className="health-text-secondary">-</div>
          )}
        </div>
      ),
    },
    {
      title: "",
      key: "medication-indicator",
      width: 120,
      render: (_, record) => (
        <div className="medication-indicator-cell">
          {record.medicationType && (
            <span className="medication-indicator">
              <MedicineBoxOutlined className="medication-icon" />
              {record.medicationType} {record.medicationAmount}mg
            </span>
          )}
        </div>
      ),
    },
  ];

  // 长按复制数据功能
  const copyRecordData = useCallback((record) => {
    const recordText = [
      `日期: ${record.date}`,
      record.weight && !isNaN(record.weight) ? `体重: ${record.weight}kg` : null,
      record.exerciseType ? `运动: ${record.exerciseType} ${record.exerciseMinutes}分钟` : null,
      record.medicationType ? `药物: ${record.medicationType} ${record.medicationAmount}mg` : null
    ].filter(Boolean).join('\n');
    
    navigator.clipboard.writeText(recordText).then(() => {
      message.success('健康记录已复制到剪贴板');
    }).catch(() => {
      message.error('复制失败，请重试');
    });
  }, []);

  // 长按事件处理
  const handleLongPress = useCallback((record) => {
    let pressTimer = null;
    
    const startPress = () => {
      pressTimer = setTimeout(() => {
        copyRecordData(record);
      }, 800); // 800ms长按触发
    };
    
    const endPress = () => {
      if (pressTimer) {
        clearTimeout(pressTimer);
        pressTimer = null;
      }
    };
    
    return {
      onTouchStart: startPress,
      onTouchEnd: endPress,
      onTouchCancel: endPress,
      onMouseDown: startPress,
      onMouseUp: endPress,
      onMouseLeave: endPress
    };
  }, [copyRecordData]);

  // 移动端简化列配置
  const mobileColumns = [
    {
      title: "健康记录",
      key: "record",
      render: (_, record, index) => (
        <div 
          className="mobile-record-container mobile-record-longpress"
          {...handleLongPress(record)}
        >
          <div className="mobile-record-header">
            <div className="mobile-record-sequence">
              No. {index + 1}
            </div>
            <div className="mobile-record-date">
              <CalendarOutlined className="mobile-date-icon" />
              {record.date}
            </div>
          </div>

          <Space
            direction="vertical"
            size="small"
            className="mobile-record-details"
          >
            {record.weight && !isNaN(record.weight) && (
              <div>
                <Tag color="blue" icon={<UserOutlined />}>
                  体重 {record.weight} kg
                </Tag>
              </div>
            )}

            {record.exerciseType && (
              <div>
                <Tag color="green" icon={<FireOutlined />}>
                  {record.exerciseType} {record.exerciseMinutes}分钟
                </Tag>
              </div>
            )}
          </Space>
          {record.medicationType && (
            <div className="medication-badge">
              <Tag color="purple" icon={<MedicineBoxOutlined />}>
                {record.medicationType} {record.medicationAmount}mg
              </Tag>
            </div>
          )}
          <div className="mobile-copy-hint">
            长按复制数据
          </div>
        </div>
      ),
    },
  ];

  const getWeightTrend = () => {
    if (healthRecords.length < 2) return null;
    // 由于数据现在是降序排列，最新的在前面
    const recent = healthRecords.slice(0, 2);

    // 使用 Decimal.js 计算体重趋势
    const current = new Decimal(recent[0].weight || 0); // 最新的记录
    const previous = new Decimal(recent[1].weight || 0); // 上一次记录
    const diff = current.minus(previous).toNumber();

    return {
      value: new Decimal(Math.abs(diff)).toFixed(1),
      trend: diff > 0 ? "up" : "down",
      icon: diff > 0 ? <RiseOutlined /> : <FallOutlined />,
      color: diff > 0 ? "#f5222d" : "#52c41a",
    };
  };

  const weightTrend = getWeightTrend();

  // 添加健康记录表单
  const AddRecordForm = () => (
    <Form
      form={form}
      layout="vertical"
      onFinish={addHealthRecord}
      requiredMark={false}
    >
      <Form.Item
        label="日期"
        name="date"
        rules={[{ required: true, message: "请选择日期" }]}
      >
        <DatePicker
          style={{ width: "100%" }}
          placeholder="选择日期"
          format="YYYY-MM-DD"
          defaultValue={dayjs()}
        />
      </Form.Item>

      <Form.Item
        label="体重 (kg)"
        name="weight"
        rules={[{ required: true, message: "请输入体重" }]}
      >
        <InputNumber
          style={{ width: "100%" }}
          min={0}
          max={200}
          step={0.1}
          placeholder="请输入体重"
        />
      </Form.Item>

      <Form.Item label="运动类型" name="exerciseType">
        <Select placeholder="选择运动类型" allowClear>
          <Option value="爬坡">🏔️ 爬坡</Option>
          <Option value="跑步">🏃‍♂️ 跑步</Option>
          <Option value="游泳">🏊‍♂️ 游泳</Option>
          <Option value="瑜伽">🧘‍♀️ 瑜伽</Option>
          <Option value="力量训练">💪 力量训练</Option>
          <Option value="其他">🔄 其他</Option>
        </Select>
      </Form.Item>

      <Form.Item label="运动时长 (分钟)" name="exerciseMinutes">
        <InputNumber
          style={{ width: "100%" }}
          min={0}
          max={300}
          placeholder="请输入运动时长"
        />
      </Form.Item>

      <Form.Item label="药物类型" name="medicationType">
        <Select placeholder="选择药物类型" allowClear>
          <Option value="替尔泊肽">💉替尔泊肽</Option>
        </Select>
      </Form.Item>

      <Form.Item label="药物剂量 (mg)" name="medicationAmount">
        <Select placeholder="选择药物剂量" allowClear>
          <Option value="2.5">2.5</Option>
          <Option value="2.5">5.0</Option>
          <Option value="2.5">7.5</Option>
          <Option value="2.5">10.0</Option>
          <Option value="2.5">12.5</Option>
          <Option value="2.5">15.0</Option>
        </Select>
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          className="health-primary-button"
          block
        >
          添加记录
        </Button>
      </Form.Item>
    </Form>
  );

  return (
    <Layout className="health-layout">
      <Header className="health-header">
        <div className="health-header-content">
          <div className="health-title-h3 health-title">
            <DashboardOutlined />
            个人健康管理仪表板
          </div>
          {/* 桌面端显示总记录数按钮 */}
          {!isMobile && (
            <Badge count={healthRecords.length} showZero color="#52c41a">
              <Button type="primary" shape="round">
                总记录数
              </Button>
            </Badge>
          )}
        </div>
      </Header>

      <Content className="health-content">
        {/* 移动端在内容区域显示总记录数按钮 */}
        {isMobile && (
          <div className="mobile-total-records">
            <Badge count={healthRecords.length} showZero color="#52c41a">
              <Button type="primary" shape="round" size="small">
                总记录数
              </Button>
            </Badge>
          </div>
        )}
        {/* 统计卡片 - 按新顺序排列 */}
        {loading ? (
          <StatisticsSkeleton />
        ) : (
          <Row gutter={isMobile ? [8, 8] : [16, 16]} className="statistics-row">
            {/* 1. 当前体重 */}
            <Col xs={12} sm={8} md={8} lg={6} xl={6}>
              <Card
                hoverable
                className="statistic-card-weight health-card-animated"
                bodyStyle={{ color: "white" }}
              >
                <Statistic
                  title={<span className="statistic-title">当前体重</span>}
                  value={statistics.currentWeight || 0}
                  suffix="kg"
                  prefix={<HeartOutlined />}
                  valueStyle={{ color: "#fff", fontWeight: "bold" }}
                />
                {weightTrend && (
                  <div className="trend-indicator">
                    <span
                      className={
                        weightTrend.trend === "up" ? "trend-up" : "trend-down"
                      }
                    >
                      {weightTrend.icon} {weightTrend.value}kg
                    </span>
                    <div className="health-text-secondary trend-comparison-text">
                      vs 昨天
                    </div>
                  </div>
                )}
                <div className="stat-info">
                  初始体重 {statistics.initialWeight || 0}kg
                </div>
              </Card>
            </Col>
            
            {/* 2. 目标体重 */}
            <Col xs={12} sm={8} md={8} lg={6} xl={6}>
              <Card
                hoverable
                className="statistic-card-target health-card-animated"
              >
                <Statistic
                  title={<span className="statistic-title">目标体重</span>}
                  value={statistics.targetWeight || 75}
                  suffix="kg"
                  prefix={<AimOutlined />}
                  valueStyle={{ color: "#fff", fontWeight: "bold" }}
                />
                <div className="stat-info">
                  目标BMI: {new Decimal(statistics.targetWeight || 75).dividedBy(new Decimal(statistics.userHeight || 1.75).pow(2)).toFixed(1)}
                  <div className="stat-info-line">
                    健康范围: 18.5-24.0
                  </div>
                </div>
              </Card>
            </Col>
            
            {/* 3. 剩余减重 */}
            <Col xs={12} sm={8} md={8} lg={6} xl={6}>
              <Card
                hoverable
                className="statistic-card-remaining health-card-animated"
              >
                <Statistic
                  title={<span className="statistic-title">剩余减重</span>}
                  value={statistics.remainingWeight ? new Decimal(statistics.remainingWeight).toFixed(1) : "0.0"}
                  suffix="kg"
                  prefix={<ScissorOutlined />}
                  valueStyle={{ color: "#fff", fontWeight: "bold" }}
                />
                <div className="stat-info">
                  {statistics.remainingWeight > 0 ? (
                    <>
                      还需减重 {new Decimal(statistics.remainingWeight).toFixed(1)}kg
                      <div className="stat-info-line">
                        完成度: {statistics.weightLoss > 0 ? new Decimal(statistics.weightLoss).dividedBy(statistics.weightLoss + statistics.remainingWeight).times(100).toFixed(0) : 0}%
                      </div>
                    </>
                  ) : (
                    <>
                      🎉 已达到目标体重！
                      <div className="stat-info-line">
                        保持当前状态
                      </div>
                    </>
                  )}
                </div>
              </Card>
            </Col>
            
            {/* 4. 减重成果 */}
            <Col xs={12} sm={8} md={8} lg={6} xl={6}>
              <Card
                hoverable
                className="statistic-card-loss health-card-animated"
              >
                <Statistic
                  title={<span className="statistic-title">减重成果</span>}
                  value={statistics.weightLoss || 0}
                  suffix="kg"
                  prefix={<TrophyOutlined />}
                  valueStyle={{ color: "#fff", fontWeight: "bold" }}
                />
                {statistics.weightLossPercent > 0 && (
                  <Progress
                    percent={Math.min(statistics.weightLossPercent * 10, 100)}
                    strokeColor="#fff"
                    trailColor="rgba(255,255,255,0.3)"
                    size="small"
                    showInfo={false}
                    className="weight-progress"
                  />
                )}
                <div className="stat-info">
                  减重{" "}
                  {statistics.weightLossPercent
                    ? new Decimal(statistics.weightLossPercent).toFixed(1)
                    : "0.0"}
                  %
                </div>
              </Card>
            </Col>
            
            {/* 5. BMI 指数 */}
            <Col xs={12} sm={8} md={8} lg={6} xl={6}>
              <Card
                hoverable
                className="statistic-card-bmi health-card-animated"
              >
                <Statistic
                  title={<span className="statistic-title">BMI 指数</span>}
                  value={statistics.bmi ? new Decimal(statistics.bmi).toFixed(1) : "0.0"}
                  prefix={<FundOutlined />}
                  valueStyle={{ color: "#fff", fontWeight: "bold" }}
                />
                <div className="stat-info">
                  {statistics.bmi && (
                    <>
                      {statistics.bmi < 18.5 && "偏瘦"}
                      {statistics.bmi >= 18.5 && statistics.bmi < 24 && "正常"}
                      {statistics.bmi >= 24 && statistics.bmi < 28 && "偏胖"}
                      {statistics.bmi >= 28 && "肥胖"}
                    </>
                  )}
                  <div className="stat-info-line">
                    身高: {statistics.userHeight || 1.75}m
                  </div>
                </div>
              </Card>
            </Col>
            
            {/* 6. 总运动时长 */}
            <Col xs={12} sm={8} md={8} lg={6} xl={6}>
              <Card
                hoverable
                className="statistic-card-exercise health-card-animated"
              >
                <Statistic
                  title={<span className="statistic-title">总运动时长</span>}
                  value={statistics.totalExerciseMinutes || 0}
                  suffix="分钟"
                  prefix={<FireOutlined />}
                  valueStyle={{ color: "#fff", fontWeight: "bold" }}
                />
                <div className="stat-info">
                  平均{" "}
                  {statistics.averageExercise
                    ? new Decimal(statistics.averageExercise).toFixed(1)
                    : "0.0"}{" "}
                  分钟/天
                  <div className="stat-info-line">
                    运动天数: {statistics.exerciseDays || 0}/
                    {statistics.totalDays || 0}
                  </div>
                </div>
              </Card>
            </Col>
            
            {/* 7. 用药记录 */}
            <Col xs={12} sm={8} md={8} lg={6} xl={6}>
              <Card
                hoverable
                className="statistic-card-medication health-card-animated"
              >
                <Statistic
                  title={<span className="statistic-title">用药记录</span>}
                  value={statistics.medicationCount || 0}
                  suffix="次"
                  prefix={<MedicineBoxOutlined />}
                  valueStyle={{ color: "#fff", fontWeight: "bold" }}
                />
                <div className="stat-info">
                  用药天数: {statistics.medicationDays || 0}/
                  {statistics.totalDays || 0}
                  {statistics.medicationCount > 0 && (
                    <div className="stat-info-line">最近: 替尔泊肽</div>
                  )}
                </div>
              </Card>
            </Col>
          </Row>
        )}
        
        {/* 数据分析标签页 */}
        <Card className="glass-card">
          <Tabs
            activeKey={activeTab}
            onChange={handleTabChange}
            type="card"
            size="large"
            destroyInactiveTabPane={false}
          >
            <TabPane
              tab={
                <span>
                  <LineChartOutlined />
                  体重趋势
                </span>
              }
              key="weight"
            >
              {loading ? <ChartSkeleton /> : <WeightChart />}
            </TabPane>
            <TabPane
              tab={
                <span>
                  <FundOutlined />
                  BMI趋势
                </span>
              }
              key="bmi-trend"
            >
              {loading ? <ChartSkeleton /> : <BMITrendChart />}
            </TabPane>
            <TabPane
              tab={
                <span>
                  <PieChartOutlined />
                  运动分析
                </span>
              }
              key="exercise"
            >
              {loading ? <ChartSkeleton /> : <ExerciseChart />}
            </TabPane>
            <TabPane
              tab={
                <span>
                  <BarChartOutlined />
                  运动趋势
                </span>
              }
              key="exercise-trend"
            >
              {loading ? <ChartSkeleton /> : <ExerciseTrendChart />}
            </TabPane>
          </Tabs>
        </Card>

        <Row gutter={isMobile ? [8, 8] : [16, 16]}>
          {/* 健康记录列表 */}
          <Col xs={24} lg={24}>
            <Card
              title={
                <div className="record-list-header">
                  <span>
                    <CalendarOutlined />
                    健康记录列表
                  </span>
                  <div>
                    <Button
                      type="primary"
                      onClick={showDrawer}
                      shape="round"
                      className="add-record-button"
                    >
                      <PlusOutlined /> 添加记录
                    </Button>
                    <Tooltip title="显示所有健康记录数据">
                      <Badge
                        count={healthRecords.length}
                        showZero
                        color="#52c41a"
                      />
                    </Tooltip>
                  </div>
                </div>
              }
              className="records-card"
            >
              {loading ? (
                <Skeleton active paragraph={{ rows: 6 }} />
              ) : healthRecords.length > 0 ? (
                <>
                  {/* 桌面端表格 */}
                  <div className="desktop-table">
                    <Table
                      size="medium"
                      columns={columns}
                      dataSource={healthRecords}
                      rowKey="id"
                      loading={loading}
                      pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                          `第 ${range[0]}-${range[1]} 条，共 ${total} 条记录`,
                        pageSizeOptions: ["5", "10", "20", "50"],
                        locale: {
                          items_per_page: "条/页",
                          jump_to: "跳至",
                          jump_to_confirm: "确定",
                          page: "页",
                          prev_page: "上一页",
                          next_page: "下一页",
                          prev_5: "向前 5 页",
                          next_5: "向后 5 页",
                          prev_3: "向前 3 页",
                          next_3: "向后 3 页",
                        },
                      }}
                      scroll={{ x: 768 }}
                      rowClassName={(record) =>
                        `table-row ${
                          record.medicationType ? "medication-highlight" : ""
                        }`
                      }
                    />
                  </div>

                  {/* 移动端表格 */}
                  <div className="mobile-table">
                    <Table
                      size="small"
                      columns={mobileColumns}
                      dataSource={healthRecords}
                      rowKey="id"
                      loading={loading}
                      pagination={{
                        pageSize: 5,
                        simple: false,
                        showSizeChanger: false,
                        showQuickJumper: false,
                        showTotal: (total, range) =>
                          `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
                        locale: {
                          items_per_page: "条/页",
                          jump_to: "跳至",
                          jump_to_confirm: "确定",
                          page: "页",
                          prev_page: "上一页",
                          next_page: "下一页",
                          prev_5: "向前 5 页",
                          next_5: "向后 5 页",
                          prev_3: "向前 3 页",
                          next_3: "向后 3 页",
                        },
                      }}
                      showHeader={false}
                    />
                  </div>
                </>
              ) : (
                <Empty
                  description="暂无健康记录"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  className="empty-state-padding"
                />
              )}
            </Card>
          </Col>
        </Row>

        {/* 额外的洞察卡片 */}
        {!loading && healthRecords.length > 0 && (
          <Row gutter={isMobile ? [8, 8] : [16, 16]} className="insights-row">
            <Col xs={24} sm={8}>
              <Card hoverable className="insight-card">
                <div className="insight-content">
                  <div className="insight-icon">🎯</div>
                  <div className="health-title-h4 insight-title">健康目标</div>
                  <div className="health-text-secondary insight-description">
                    {new Decimal(statistics.weightLoss || 0).gt(0)
                      ? `已减重 ${new Decimal(statistics.weightLoss).toFixed(
                          1
                        )}kg，继续保持！`
                      : "设定减重目标，开始健康之旅"}
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card hoverable className="insight-card">
                <div className="insight-content">
                  <div className="insight-icon">📊</div>
                  <div className="health-title-h4 insight-title">记录频率</div>
                  <div className="health-text-secondary insight-description">
                    坚持记录 {statistics.totalDays} 天，
                    <span className="exercise-percentage">
                      运动占比{" "}
                      {statistics.totalDays > 0
                        ? new Decimal(statistics.exerciseDays)
                            .dividedBy(statistics.totalDays)
                            .times(100)
                            .toFixed(0)
                        : "0"}
                      %
                    </span>
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card hoverable className="insight-card">
                <div className="insight-content">
                  <div className="insight-icon">🏆</div>
                  <div className="health-title-h4 insight-title">成就徽章</div>
                  <Space className="badges-container">
                    {statistics.exerciseDays >= 7 && (
                      <Tooltip title="坚持运动7天">
                        <Badge
                          count="7天"
                          color="#52c41a"
                          className="achievement-badge"
                        >
                          <FireOutlined className="badge-icon" />
                        </Badge>
                      </Tooltip>
                    )}
                    {new Decimal(statistics.weightLoss || 0).gt(1) && (
                      <Tooltip title="成功减重1kg+">
                        <Badge
                          count="1kg+"
                          color="#1890ff"
                          className="achievement-badge"
                        >
                          <TrophyOutlined className="badge-icon" />
                        </Badge>
                      </Tooltip>
                    )}
                    {statistics.totalDays >= 10 && (
                      <Tooltip title="坚持记录10天">
                        <Badge
                          count="10天"
                          color="#faad14"
                          className="achievement-badge"
                        >
                          <CalendarOutlined className="badge-icon" />
                        </Badge>
                      </Tooltip>
                    )}
                  </Space>
                </div>
              </Card>
            </Col>
          </Row>
        )}
      </Content>

      {/* 添加记录抽屉 - 桌面端 */}
      <Drawer
        title="添加健康记录"
        placement="right"
        closable={true}
        onClose={closeDrawer}
        open={drawerOpen && !isMobile}
        className="add-record-drawer"
        width={400}
      >
        <AddRecordForm />
      </Drawer>

      {/* 添加记录抽屉 - 移动端 */}
      <Drawer
        title="添加健康记录"
        placement="bottom"
        closable={true}
        onClose={closeDrawer}
        open={drawerOpen && isMobile}
        className="mobile-add-record-drawer"
        height="80%"
      >
        <AddRecordForm />
      </Drawer>
    </Layout>
  );
};

export default HealthManagement;
