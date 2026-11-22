### Spring/Spring Boot 概览

#### ToC

- 核心理念：IoC/DI 与 AOP
- Spring Boot 自动配置
- 常用模块与实践
- 可观察性与调优

#### 核心理念：IoC/DI 与 AOP

- IoC 容器管理 Bean 的创建与生命周期；依赖注入（构造器注入优先）提升可测试性；
- AOP 用于横切关注点：事务、缓存、日志；基于代理（JDK 动态/CGlib）。

#### Spring Boot 自动配置

- `spring-boot-autoconfigure` 通过条件注解（`@ConditionalOnClass` 等）按需装配；
- 入口：`@SpringBootApplication` = `@Configuration + @EnableAutoConfiguration + @ComponentScan`；
- 自定义配置：`@ConfigurationProperties` 绑定类型安全配置。

#### 常用模块与实践

- Web：`spring-boot-starter-web`（Tomcat/Netty）、`spring-webflux`（反应式）；
- 数据：`spring-data`（JPA/JDBC/Redis/Mongo 等）；
- 配置与管理：`spring-boot-actuator` 提供健康检查、指标、线程/堆 dump 等端点；
- 测试：`@SpringBootTest`、`@DataJpaTest`、`MockMvc`。

#### 可观察性与调优

- 打开 Actuator 指标（Micrometer）；
- 统一线程池/超时设置，避免阻塞拖垮；
- 与 JFR/日志/分布式追踪（OpenTelemetry）结合排查性能瓶颈。

