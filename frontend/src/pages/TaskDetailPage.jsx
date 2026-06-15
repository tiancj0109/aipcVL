import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Statistic, Table, Tag, Button, Typography, message, InputNumber, Space } from 'antd';
import { ArrowLeftOutlined, CheckCircleOutlined, CloseCircleOutlined, DollarOutlined, ClockCircleOutlined, SearchOutlined } from '@ant-design/icons';
import api from '../api';

const { Title, Text } = Typography;

export default function TaskDetailPage() {
    const { taskId } = useParams();
    const navigate = useNavigate();
    const [task, setTask] = useState(null);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    const [minScore, setMinScore] = useState(null);
    const [maxScore, setMaxScore] = useState(null);

    const fetchDetail = async () => {
        setLoading(true);
        try {
            const params = {};
            if (minScore !== null) params.min_score = minScore;
            if (maxScore !== null) params.max_score = maxScore;

            const [taskRes, resultsRes] = await Promise.all([
                api.get(`/tasks/${taskId}`),
                api.get(`/tasks/${taskId}/results`, { params }).catch(() => ({ data: [] }))
            ]);
            setTask(taskRes.data);
            setResults(resultsRes.data);
        } catch (err) {
            message.error("加载任务详情失败。");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetail();
        const interval = setInterval(() => {
            if (task?.status === 'running' || task?.status === 'pending') {
                fetchDetail();
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [taskId, task?.status]);

    const handleFilter = () => {
        fetchDetail();
    };

    if (!task) return <div style={{ padding: '2rem' }}>加载中...</div>;

    const columns = [
        { title: '样本ID', dataIndex: 'dataset_item_id', width: 100 },
        {
            title: '得分', dataIndex: 'score', width: 100, render: val => (
                <span className={val >= 0.5 ? 'text-success' : 'text-danger'} style={{ fontWeight: 'bold' }}>
                    {val >= 0.5 ? <CheckCircleOutlined /> : <CloseCircleOutlined />} {val}
                </span>
            )
        },
        { title: '耗时 (ms)', dataIndex: 'latency_ms', width: 120 },
        { title: '模型输出', dataIndex: 'model_output', ellipsis: true },
    ];

    const expandedRowRender = (record) => (
        <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.1)', borderRadius: '8px' }}>
            <Row gutter={16}>
                <Col span={12}>
                    <Text strong className="text-muted">模型输出详情</Text>
                    <div style={{ padding: '1rem', background: 'var(--bg-color)', borderRadius: '4px', marginTop: '0.5rem', border: '1px solid var(--border)' }}>
                        {record.model_output}
                    </div>
                </Col>
                <Col span={12}>
                    <Text strong className="text-muted">评判细节</Text>
                    <pre style={{ padding: '1rem', background: 'var(--bg-color)', borderRadius: '4px', marginTop: '0.5rem', border: '1px solid var(--border)', whiteSpace: 'pre-wrap' }}>
                        {JSON.stringify(record.judge_details, null, 2)}
                    </pre>
                    <Text strong className="text-muted" style={{ display: 'block', marginTop: '1rem' }}>Token 使用量</Text>
                    <pre style={{ padding: '1rem', background: 'var(--bg-color)', borderRadius: '4px', marginTop: '0.5rem', border: '1px solid var(--border)', whiteSpace: 'pre-wrap' }}>
                        {JSON.stringify(record.token_usage, null, 2)}
                    </pre>
                </Col>
            </Row>
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} type="text" style={{ color: 'var(--text-muted)' }} />
                <Title level={2} style={{ margin: 0, color: 'var(--text-main)' }}>任务：{task.name}</Title>
                <Tag color={task.status === 'completed' ? 'success' : 'processing'}>
                    {task.status === 'completed' ? '已完成' : (task.status === 'running' ? '进行中' : (task.status === 'failed' ? '失败' : '等待中'))}
                </Tag>
            </div>

            <Row gutter={16}>
                <Col span={6}>
                    <Card className="glass-panel" bordered={false}>
                        <Statistic
                            title={<span className="text-muted">平均得分</span>}
                            value={task.metrics?.avg_score || 0}
                            precision={2}
                            valueStyle={{ color: 'var(--success)' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card className="glass-panel" bordered={false}>
                        <Statistic
                            title={<span className="text-muted">通过率 (得分≥0.5)</span>}
                            value={(task.metrics?.pass_rate || 0) * 100}
                            precision={1}
                            suffix="%"
                            valueStyle={{ color: 'var(--accent)' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card className="glass-panel" bordered={false}>
                        <Statistic
                            title={<span className="text-muted">平均耗时</span>}
                            value={task.metrics?.avg_latency || 0}
                            suffix="ms"
                            prefix={<ClockCircleOutlined />}
                            valueStyle={{ color: 'var(--text-main)' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card className="glass-panel" bordered={false}>
                        <Statistic
                            title={<span className="text-muted">估算成本</span>}
                            value={task.metrics?.total_cost || 0}
                            precision={4}
                            prefix={<DollarOutlined />}
                            valueStyle={{ color: 'var(--danger)' }}
                        />
                    </Card>
                </Col>
            </Row>

            <div className="glass-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <Title level={4} style={{ color: 'var(--text-main)', margin: 0 }}>详细评测结果</Title>
                    <Space>
                        <InputNumber placeholder="最低得分" min={0} max={1} step={0.1} onChange={setMinScore} style={{ width: 140 }} />
                        <InputNumber placeholder="最高得分" min={0} max={1} step={0.1} onChange={setMaxScore} style={{ width: 140 }} />
                        <Button type="primary" icon={<SearchOutlined />} onClick={handleFilter}>筛选</Button>
                    </Space>
                </div>
                <Table
                    columns={columns}
                    dataSource={results}
                    rowKey="id"
                    loading={loading}
                    expandable={{ expandedRowRender }}
                    pagination={{ pageSize: 15 }}
                />
            </div>
        </div>
    );
}
