import React from 'react';
import { Card, Row, Col, Typography, Timeline, Tag } from 'antd';
import { InfoCircleOutlined, RocketOutlined, CodeOutlined, SettingOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

export default function AboutPage() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <Title level={2} style={{ color: 'var(--text-main)', margin: 0 }}>关于项目</Title>
            
            <Card className="glass-panel" bordered={false}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <InfoCircleOutlined style={{ fontSize: '24px', color: 'var(--accent)' }} />
                    <Title level={3} style={{ margin: 0, color: 'var(--text-main)' }}>系统概述 (System Overview)</Title>
                </div>
                <Paragraph style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.8' }}>
                    <strong>AIPCVL</strong> (AI Perception, Comprehension, Vision & Language) 是一款专为多模态大模型研发人员设计的评测系统。随着视觉语言大模型（如 GPT-4o、Claude 3.5、Qwen-VL 等）的快速迭代更新，对其在图文理解、OCR文字识别、图表分析等各类复杂视觉任务上的性能进行系统化、自动化的对比评测变得尤为关键。
                </Paragraph>
                <Paragraph style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.8' }}>
                    本系统致力于提供一个统一、高效、低成本的评测平台，帮助研发团队快速评估模型性能、直观进行结果对比，并精准定位错误案例以推进模型优化。
                </Paragraph>
            </Card>

            <Row gutter={16}>
                <Col span={12}>
                    <Card className="glass-panel" bordered={false} style={{ height: '100%' }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <RocketOutlined style={{ fontSize: '24px', color: 'var(--success)' }} />
                            <Title level={4} style={{ margin: 0, color: 'var(--text-main)' }}>核心特性 (Core Features)</Title>
                        </div>
                        <Timeline
                            pending="更多功能持续开发中..."
                            style={{ marginTop: '1rem' }}
                            items={[
                                {
                                    color: 'blue',
                                    children: (
                                        <div>
                                            <strong style={{ color: 'var(--text-main)' }}>断点续跑 (Breakpoint Continuation)</strong>
                                            <p style={{ color: 'var(--text-muted)', margin: '4px 0 12px' }}>
                                                当评测任务中断或重启时，系统将自动检索历史评测记录并跳过已处理的样本，防止产生重复的 API 调用和额外计费。
                                            </p>
                                        </div>
                                    ),
                                },
                                {
                                    color: 'green',
                                    children: (
                                        <div>
                                            <strong style={{ color: 'var(--text-main)' }}>多重缓存机制 (Multi-tier Caching)</strong>
                                            <p style={{ color: 'var(--text-muted)', margin: '4px 0 12px' }}>
                                                提供输入数据 <code>(模型, 图片, Prompt)</code> 结果哈希缓存以及本地图片缓存，极大减少重复请求开销和网络 I/O 延迟。
                                            </p>
                                        </div>
                                    ),
                                },
                                {
                                    color: 'orange',
                                    children: (
                                        <div>
                                            <strong style={{ color: 'var(--text-main)' }}>细粒度限流 (Rate Limiting)</strong>
                                            <p style={{ color: 'var(--text-muted)', margin: '4px 0 12px' }}>
                                                对不同的模型服务提供商适配专属的限流频控算法，确保调用平稳，避免因并发过高触发服务端的 429 报错限制。
                                            </p>
                                        </div>
                                    ),
                                },
                                {
                                    color: 'red',
                                    children: (
                                        <div>
                                            <strong style={{ color: 'var(--text-main)' }}>错误错例深度对比与分析</strong>
                                            <p style={{ color: 'var(--text-muted)', margin: '4px 0 0' }}>
                                                直观对比两个模型在同一数据集上的平均分、通过率、耗时以及估算成本。支持一键筛选和展示得分低于阈值（&lt; 0.5）的错误案例。
                                            </p>
                                        </div>
                                    ),
                                },
                            ]}
                        />
                    </Card>
                </Col>

                <Col span={12}>
                    <Card className="glass-panel" bordered={false} style={{ height: '100%' }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <CodeOutlined style={{ fontSize: '24px', color: 'var(--accent)' }} />
                            <Title level={4} style={{ margin: 0, color: 'var(--text-main)' }}>技术架构 (Tech Stack)</Title>
                        </div>
                        <Paragraph style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                            系统采用模块化设计与前后端分离方案，无需改动后端代码即可支持灵活的部署与子路径路由转发：
                        </Paragraph>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
                            <div>
                                <strong style={{ color: 'var(--text-main)' }}>前端 (Frontend)：</strong>
                                <div style={{ marginTop: '0.5rem' }}>
                                    <Tag color="cyan">React</Tag>
                                    <Tag color="blue">Ant Design</Tag>
                                    <Tag color="geekblue">Vite</Tag>
                                    <Tag color="purple">TypeScript</Tag>
                                </div>
                            </div>
                            <div style={{ marginTop: '0.5rem' }}>
                                <strong style={{ color: 'var(--text-main)' }}>后端与异步任务 (Backend & Worker)：</strong>
                                <div style={{ marginTop: '0.5rem' }}>
                                    <Tag color="green">FastAPI</Tag>
                                    <Tag color="blue">SQLAlchemy</Tag>
                                    <Tag color="red">Celery</Tag>
                                    <Tag color="purple">Redis</Tag>
                                    <Tag color="gold">MySQL 8.0</Tag>
                                </div>
                            </div>
                            <div style={{ marginTop: '0.5rem' }}>
                                <strong style={{ color: 'var(--text-main)' }}>部署与隔离反代 (Deployment)：</strong>
                                <div style={{ marginTop: '0.5rem' }}>
                                    <Tag color="magenta">Nginx (路径重写与静态托管)</Tag>
                                    <Tag color="volcano">Docker Compose</Tag>
                                </div>
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>

            <Card className="glass-panel" bordered={false}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <SettingOutlined style={{ fontSize: '24px', color: 'var(--text-main)' }} />
                    <Title level={4} style={{ margin: 0, color: 'var(--text-main)' }}>项目声明</Title>
                </div>
                <Paragraph style={{ color: 'var(--text-muted)', margin: 0 }}>
                    当前项目版本为 <strong style={{ color: 'var(--accent)' }}>aipcVL (未完成版)</strong>。核心框架已打通并支持基础评测，后续版本规划包括引入更细维度的能力雷达图展示、多模型联合裁判打分（Ensemble Judge）及自动化 PDF 评测报告导出，敬请期待！
                </Paragraph>
            </Card>
        </div>
    );
}
