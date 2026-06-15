import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Select, Input, message, Tag, Progress } from 'antd';
import { PlayCircleOutlined, PlusOutlined, ReloadOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const { Option } = Select;

export default function TasksPage() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [models, setModels] = useState([]);
    const [datasets, setDatasets] = useState([]);
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const res = await api.get('/tasks');
            setTasks(res.data);
        } catch (err) {
            message.error("获取任务列表失败。");
        } finally {
            setLoading(false);
        }
    };

    const fetchOptions = async () => {
        try {
            const [modelsRes, datasetsRes] = await Promise.all([
                api.get('/models'),
                api.get('/datasets')
            ]);
            setModels(modelsRes.data);
            setDatasets(datasetsRes.data);
        } catch (err) {
            message.error("加载模型或数据集配置失败。");
        }
    };

    useEffect(() => {
        fetchTasks();
        fetchOptions();
    }, []);

    const handleCreate = async (values) => {
        try {
            await api.post('/tasks', values);
            message.success("任务已成功创建，评测开始运行！");
            setIsModalVisible(false);
            form.resetFields();
            fetchTasks();
        } catch (err) {
            message.error("创建任务失败。");
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/tasks/${id}`);
            message.success("任务已成功删除。");
            fetchTasks();
        } catch (err) {
            message.error("删除任务失败。");
        }
    };

    const columns = [
        { title: '任务ID', dataIndex: 'id', key: 'id', width: 90 },
        {
            title: '任务名称', dataIndex: 'name', key: 'name', render: (text, record) => (
                <a onClick={() => navigate(`/tasks/${record.id}`)} style={{ color: 'var(--accent)', fontWeight: 600 }}>
                    {text}
                </a>
            )
        },
        {
            title: '状态', dataIndex: 'status', key: 'status', render: (status) => {
                let color = 'default';
                let statusZh = status.toUpperCase();
                if (status === 'completed') { color = 'success'; statusZh = '已完成'; }
                if (status === 'running') { color = 'processing'; statusZh = '进行中'; }
                if (status === 'failed') { color = 'error'; statusZh = '失败'; }
                if (status === 'pending') { color = 'default'; statusZh = '等待中'; }
                return <Tag color={color}>{statusZh}</Tag>;
            }
        },
        {
            title: '进度', dataIndex: 'progress', key: 'progress', render: (p) => (
                <Progress percent={Math.round(p)} size="small" status={p === 100 ? 'success' : 'active'} />
            )
        },
        {
            title: '操作', key: 'action', width: 120, render: (_, record) => (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
                </div>
            ),
        },
    ];

    return (
        <div className="glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0, fontWeight: 600 }}>评测任务列表</h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Button icon={<ReloadOutlined />} onClick={fetchTasks} loading={loading}>刷新</Button>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
                        新建任务
                    </Button>
                </div>
            </div>

            <Table
                dataSource={tasks}
                columns={columns}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 15 }}
            />

            <Modal
                title="新建评测任务"
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                destroyOnClose
            >
                <Form form={form} layout="vertical" onFinish={handleCreate} style={{ marginTop: '1.5rem' }}>
                    <Form.Item name="name" label="任务名称" rules={[{ required: true, message: '请输入任务名称！' }]}>
                        <Input placeholder="例如：GPT-4o 评测 MMBench" />
                    </Form.Item>
                    <Form.Item name="model_config_id" label="评测模型" rules={[{ required: true, message: '请选择评测模型！' }]}>
                        <Select placeholder="请选择评测模型">
                            {models.map(m => <Option key={m.id} value={m.id}>{m.name} ({m.provider})</Option>)}
                        </Select>
                    </Form.Item>
                    <Form.Item name="dataset_id" label="评测数据集" rules={[{ required: true, message: '请选择评测数据集！' }]}>
                        <Select placeholder="请选择评测数据集">
                            {datasets.map(d => <Option key={d.id} value={d.id}>{d.name}</Option>)}
                        </Select>
                    </Form.Item>
                    <Form.Item style={{ textAlign: 'right', marginTop: '2rem', marginBottom: 0 }}>
                        <Button onClick={() => setIsModalVisible(false)} style={{ marginRight: '1rem' }}>取消</Button>
                        <Button type="primary" htmlType="submit" icon={<PlayCircleOutlined />}>启动评测</Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
