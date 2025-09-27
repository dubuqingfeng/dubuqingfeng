### Maven 基础与常用配置

#### ToC

- 项目结构与生命周期
- 依赖管理与作用域
- 常用插件与构建
- 多模块与发布

#### 项目结构与生命周期

- 约定优于配置：`src/main/java`、`src/test/java`、`src/main/resources`；
- 生命周期：`validate` → `compile` → `test` → `package` → `verify` → `install` → `deploy`；
- 常用命令：`mvn -T 4C -DskipTests clean package`、`mvn test -Dtest=FooTest`。

#### 依赖管理与作用域

- `compile`（默认）、`provided`、`runtime`、`test`、`system`、`import`；
- 依赖传递与冲突：使用 `mvn dependency:tree` 诊断，必要时用 `<dependencyManagement>` 锁版本；
- 镜像与私服：在 `settings.xml` 配置 `<mirrors>` 与 `<servers>`。

#### 常用插件与构建

- `maven-compiler-plugin`：设置 `source/target` 与编码；
- `maven-surefire-plugin`：单测；`maven-failsafe-plugin`：集成测试；
- `maven-shade-plugin` 或 `spring-boot-maven-plugin`：打包可执行 jar；
- `spotless`/`checkstyle`：统一代码风格；`versions-maven-plugin`：版本管理。

示例：

```xml
<build>
  <plugins>
    <plugin>
      <groupId>org.apache.maven.plugins</groupId>
      <artifactId>maven-compiler-plugin</artifactId>
      <version>3.11.0</version>
      <configuration>
        <source>17</source>
        <target>17</target>
        <encoding>UTF-8</encoding>
      </configuration>
    </plugin>
  </plugins>
  <pluginManagement>
    <plugins>
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-surefire-plugin</artifactId>
        <version>3.2.5</version>
      </plugin>
    </plugins>
  </pluginManagement>
  
</build>
```

#### 多模块与发布

- 父 POM 管理版本与插件，多模块共享；
- 发布到仓库：`deploy` 阶段或通过 `nexus-staging-maven-plugin`；
- 使用 BOM（Bill of Materials）统一依赖版本：

```xml
<dependencyManagement>
  <dependencies>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-dependencies</artifactId>
      <version>3.3.2</version>
      <type>pom</type>
      <scope>import</scope>
    </dependency>
  </dependencies>
  
</dependencyManagement>
```

