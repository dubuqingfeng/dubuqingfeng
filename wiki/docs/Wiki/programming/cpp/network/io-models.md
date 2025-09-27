### IO 模型概览（select/poll/epoll/kqueue/IOCP）

常见模型：

- select/poll：通用但可扩展性一般；fd 数量较大时开销上升。
- epoll（Linux）：边沿/水平触发，适合大规模连接；配合非阻塞 IO。
- kqueue（BSD/macOS）：更通用的事件过滤器机制。
- IOCP（Windows）：完成端口，基于投递-完成模型。

工程建议：采用跨平台抽象（如 Asio）或统一事件层，业务层屏蔽平台差异。

