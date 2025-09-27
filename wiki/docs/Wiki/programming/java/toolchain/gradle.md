### Gradle 基础与常用配置

#### ToC

- Groovy/Kotlin DSL 与项目结构
- 配置阶段与执行阶段
- 依赖管理与缓存
- 常用插件与任务

#### Groovy/Kotlin DSL 与项目结构

- `build.gradle(.kts)`、`settings.gradle(.kts)`；
- 多项目构建在 `settings.gradle` 中包含子模块；
- 常用命令：`gradle clean build -x test`、`gradle test --tests FooTest`。

#### 配置阶段与执行阶段

- Gradle 分为配置（构建脚本求值）与执行（任务图执行），避免在配置阶段做昂贵操作；
- 使用 `providers`/`lazy` API 与任务输入输出声明，启用增量与缓存。

#### 依赖管理与缓存

- 配置（Configuration）：`implementation`、`api`、`runtimeOnly`、`testImplementation`；
- 缓存：本地缓存与远端缓存（Gradle Enterprise）；
- 版本对齐：使用平台 `platform()` 或 BOM。

#### 常用插件与任务

- `java`/`application`/`maven-publish`/`shadow`（胖包）/`spotless`；
- Kotlin DSL 示例：

```kotlin
plugins {
  java
  id("com.github.johnrengelman.shadow") version "8.1.1"
}

java { toolchain { languageVersion.set(JavaLanguageVersion.of(17)) } }

tasks.test { useJUnitPlatform() }
```

