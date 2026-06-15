import React, { useState, useEffect } from 'react';
import { Form, Select, Button, Card, Row, Col, Typography, message, Table, List } from 'antd';
import { SwapOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import api from '../api';

const { Title, Text } = Typography;
const { Option } = Select;

export default function ComparePage() {
    const [models, setModels] = useState([]);
    const [datasets, setDatasets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [compareData, setCompareData] = useState(null);

    const [form] = Form.useForm();

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [modelsRes, datasetsRes] = await Promise.all([
                    api.get('/models'),
                    api.get('/datasets')
                ]);
                setModels(modelsRes.data);
                setDatasets(datasetsRes.data);
            } catch (err) {
                message.error("加载对比选项失败。");
            }
        };
        fetchOptions();
    }, []);

    const handleCompare = async (values) => {
        if (values.model_1 === values.model_2) {
            return message.warning("请选择两个不同的模型进行对比！");
        }
        setLoading(true);
        try {
            const res = await api.post('/compare/models', {
                model_config_ids: [values.model_1, values.model_2],
                dataset_id: values.dataset_id
            });
            setCompareData(res.data);
        } catch (err) {
            if (err.response && err.response.status === 404) {
                message.error("未找到这两个模型在此数据集上的已完成评测任务，请先运行评测。");
            } else {
                message.error("模型对比失败。");
            }
        } finally {
            setLoading(false);
        }
    };

    const renderMetric = (label, value1, value2, isPercent = false, isCost = false) => {
        const val1 = isPercent ? (value1 * 100).toFixed(1) + '%' : (isCost ? '$' + value1.toFixed(4) : value1?.toFixed(2));
        const val2 = isPercent ? (value2 * 100).toFixed(1) + '%' : (isCost ? '$' + value2.toFixed(4) : value2?.toFixed(2));

        // Simple win logic
        const winColor = 'var(--success)';
        const defaultColor = 'var(--text-main)';
        let color1 = defaultColor;
        let color2 = defaultColor;

        if (value1 > value2) {
            if (isCost) color2 = winColor; else color1 = winColor;
        } else if (value2 > value1) {
            if (isCost) color1 = winColor; else color2 = winColor;
        }

        return (
            <Row style={{ marginBottom: 12, borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                <Col span={8} style={{ color: color1, fontWeight: 'bold' }}>{val1}</Col>
                <Col span={8} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{label}</Col>
                <Col span={8} style={{ textAlign: 'right', color: color2, fontWeight: 'bold' }}>{val2}</Col>
            </Row>
        );
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <Title level={2} style={{ color: 'var(--text-main)', margin: 0 }}>模型评测对比</Title>

            <Card className="glass-panel" bordered={false}>
                <Form form={form} layout="inline" onFinish={handleCompare}>
                    <Form.Item name="model_1" rules={[{ required: true, message: '请选择模型 1' }]}>
                        <Select placeholder="请选择模型 1" style={{ width: 200 }}>
                            {models.map(m => <Option key={m.id} value={m.id}>{m.name}</Option>)}
                        </Select>
                    </Form.Item>
                    <div style={{ padding: '0 1rem', display: 'flex', alignItems: 'center', color: 'var(--accent)' }}>
                        <SwapOutlined />
                    </div>
                    <Form.Item name="model_2" rules={[{ required: true, message: '请选择模型 2' }]}>
                        <Select placeholder="请选择模型 2" style={{ width: 200 }}>
                            {models.map(m => <Option key={m.id} value={m.id}>{m.name}</Option>)}
                        </Select>
                    </Form.Item>

                    <Form.Item name="dataset_id" rules={[{ required: true, message: '请选择对比数据集' }]} style={{ marginLeft: '1rem' }}>
                        <Select placeholder="请选择对比数据集" style={{ width: 200 }}>
                            {datasets.map(d => <Option key={d.id} value={d.id}>{d.name}</Option>)}
                        </Select>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading}>开始对比</Button>
                    </Form.Item>
                </Form>
            </Card>

            {compareData && (
                <>
                    <Card className="glass-panel" bordered={false}>
                        <Title level={4} style={{ color: 'var(--text-main)', textAlign: 'center', marginTop: 0 }}>
                            {compareData.dataset_name}
                        </Title>
                        <Row style={{ marginBottom: 20 }}>
                            <Col span={8}><Title level={3} style={{ color: 'var(--accent)', margin: 0 }}>{compareData.model_1.model_name}</Title></Col>
                            <Col span={8}></Col>
                            <Col span={8} style={{ textAlign: 'right' }}><Title level={3} style={{ color: 'var(--success)', margin: 0 }}>{compareData.model_2.model_name}</Title></Col>
                        </Row>

                        {renderMetric('平均得分', compareData.model_1.avg_score, compareData.model_2.avg_score)}
                        {renderMetric('通过率 (得分≥0.5)', compareData.model_1.pass_rate, compareData.model_2.pass_rate, true)}
                        {renderMetric('平均耗时 (ms)', compareData.model_1.avg_latency, compareData.model_2.avg_latency)}
                        {renderMetric('预估成本', compareData.model_1.total_cost, compareData.model_2.total_cost, false, true)}
                    </Card>

                    <Row gutter={24}>
                        <Col span={12}>
                            <Card className="glass-panel" title={`${compareData.model_1.model_name} 错误案例 (得分 < 0.5)`} bordered={false}>
                                <List
                                    itemLayout="horizontal"
                                    dataSource={compareData.model_1.error_cases}
                                    renderItem={item => (
                                        <List.Item>
                                            <List.Item.Meta
                                                title={<span style={{ color: 'var(--danger)' }}>样本 ID: {item.id}</span>}
                                                description={<div style={{ color: 'var(--text-main)' }}>{item.output}</div>}
                                            />
                                        </List.Item>
                                    )}
                                />
                            </Card>
                        </Col>
                        <Col span={12}>
                            <Card className="glass-panel" title={`${compareData.model_2.model_name} 错误案例 (得分 < 0.5)`} bordered={false}>
                                <List
                                    itemLayout="horizontal"
                                    dataSource={compareData.model_2.error_cases}
                                    renderItem={item => (
                                        <List.Item>
                                            <List.Item.Meta
                                                title={<span style={{ color: 'var(--danger)' }}>样本 ID: {item.id}</span>}
                                                description={<div style={{ color: 'var(--text-main)' }}>{item.output}</div>}
                                            />
                                        </List.Item>
                                    )}
                                />
                            </Card>
                        </Col>
                    </Row>
                </>
            )}
        </div>
    );
}
