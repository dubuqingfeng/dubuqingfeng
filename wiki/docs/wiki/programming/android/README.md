---
title: Android
slug: /wiki/programming/android
---

# Android

Android 开发的核心不是“记 API”，而是理解三件事：**组件生命周期、状态归谁管、构建产物怎么发。** 这三件事决定了应用在旋转屏幕、进程被杀、网络抖动、系统回收资源时是否还正确。

这篇文章以 Kotlin + Jetpack 为主线，给出一个可落地的最小架构和检查清单。

## 1. 应用模型与生命周期 {#model}

四大组件：

| 组件 | 作用 | 生命周期要点 |
| --- | --- | --- |
| Activity | 一个可交互界面 | 配置变更会重建；不要在这里放业务状态 |
| Service | 后台/前台任务 | 前台服务要通知；注意后台限制 |
| BroadcastReceiver | 接收广播 | `onReceive` 很短，不要做重活 |
| ContentProvider | 跨应用数据 | 注意导出与权限 |

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { AppTheme { AppNavHost() } }
    }
}
```

> **配置变更：** 旋转屏幕、切换深色模式可能重建 Activity。把状态放在 `ViewModel`，不要放在 Activity 字段里。

## 2. Compose 与 View：怎么选 {#compose}

- 新项目优先 Jetpack Compose；声明式 UI，状态驱动。
- 既有 View 体系可以逐步迁移，不必一次性重写。
- Compose 里不要直接做副作用；用 `LaunchedEffect`、`rememberCoroutineScope`、`DisposableEffect`。

```kotlin
@Composable
fun CounterScreen(vm: CounterViewModel = viewModel()) {
    val state by vm.uiState.collectAsStateWithLifecycle()

    Column(Modifier.padding(24.dp)) {
        Text("count = ${state.count}", style = MaterialTheme.typography.headlineSmall)
        Button(onClick = vm::increment) { Text("+1") }
    }
}
```

## 3. 状态管理：ViewModel + StateFlow {#state}

```kotlin
data class CounterUiState(val count: Int = 0, val loading: Boolean = false)

class CounterViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(CounterUiState())
    val uiState: StateFlow<CounterUiState> = _uiState.asStateFlow()

    fun increment() {
        _uiState.update { it.copy(count = it.count + 1) }
    }
}
```

原则：

- UI 状态用不可变 `data class`；事件用 `sealed interface`。
- 一次性事件（导航、Toast）不要塞进 `StateFlow`，用 `Channel`/`SharedFlow`。
- `collectAsStateWithLifecycle()` 按生命周期收集，避免后台浪费。
- 业务逻辑放 ViewModel/UseCase，不放在 Composable 里。

## 4. 数据：Room 与 DataStore {#data}

Room 适合结构化数据：

```kotlin
@Entity
data class Note(@PrimaryKey val id: Long, val text: String, val updatedAt: Long)

@Dao
interface NoteDao {
    @Query("SELECT * FROM Note ORDER BY updatedAt DESC")
    fun observeAll(): Flow<List<Note>>

    @Upsert
    suspend fun upsert(note: Note)
}

@Database(entities = [Note::class], version = 1)
abstract class AppDatabase : RoomDatabase() {
    abstract fun notes(): NoteDao
}
```

DataStore 适合小配置：

```kotlin
val Context.dataStore by preferencesDataStore("settings")
val THEME = booleanPreferencesKey("dark_theme")

suspend fun setDarkTheme(context: Context, dark: Boolean) {
    context.dataStore.edit { it[THEME] = dark }
}
```

> **迁移：** Room 增加字段/改表要写 `Migration`，不要用 `fallbackToDestructiveMigration()` 上线；那会清空用户数据。

## 5. 网络：Retrofit + OkHttp + 协程 {#network}

```kotlin
interface OrderApi {
    @GET("orders")
    suspend fun orders(@Query("page") page: Int): List<Order>
}

val client = OkHttpClient.Builder()
    .connectTimeout(5, TimeUnit.SECONDS)
    .readTimeout(15, TimeUnit.SECONDS)
    .build()

val api = Retrofit.Builder()
    .baseUrl("https://api.example.com/")
    .client(client)
    .addConverterFactory(MoshiConverterFactory.create())
    .build()
    .create(OrderApi::class.java)
```

- 网络请求放 `viewModelScope`/`lifecycleScope`，不要阻塞主线程。
- 区分“可重试错误”（超时、5xx）和“不可重试错误”（4xx、鉴权失败）。
- 失败要有 UI 状态，不要只打日志。
- 大文件上传/下载用 WorkManager，不要依赖 Activity 生命周期。

## 6. 构建：Gradle、变体、签名、R8 {#build}

```kotlin
android {
    namespace = "com.example.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.example.app"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
}
```

- `versionCode` 必须单调递增；`versionName` 只用于展示。
- 签名密钥放 CI secret/Keystore，不进仓库。
- 发布用 App Bundle；保留 mapping 文件用于崩溃还原。
- 不同环境用 `buildConfigField`/`productFlavors`，不要把生产地址写死在代码里。

## 7. 测试 {#test}

| 层级 | 工具 | 适合 |
| --- | --- | --- |
| 单元测试 | JUnit、Kotlin Test | ViewModel、UseCase、纯逻辑 |
| 协程测试 | `kotlinx-coroutines-test` | 挂起函数、超时、重试 |
| UI 测试 | Compose UI Test、Espresso | 关键用户路径 |
| 集成测试 | Room in-memory、MockWebServer | DAO、网络层 |

```kotlin
@Test
fun increment_updatesState() = runTest {
    val vm = CounterViewModel()
    vm.increment()
    assertEquals(1, vm.uiState.value.count)
}
```

## 8. 性能与发布 {#performance}

- 启动：用 Macrobenchmark 测冷启动；避免在 `Application.onCreate` 做重活。
- 卡顿：看 jank、主线程 IO、过度重组；Compose 用 `key`、`derivedStateOf`、`remember`。
- 内存：LeakCanary 查泄漏；大图按目标尺寸解码。
- 包体：R8、资源压缩、按需下发；注意 `keep` 规则。
- 发布：分阶段灰度、崩溃监控、ANR 监控、mapping 上传。

## 9. 最小检查清单 {#checklist}

- [ ] 状态在 ViewModel，不依赖 Activity 字段。
- [ ] 配置变更/进程被杀后能恢复关键状态。
- [ ] 网络错误有可重试/不可重试区分和 UI 反馈。
- [ ] Room 有迁移，未使用 destructive migration。
- [ ] 敏感数据不写日志、不放外部存储。
- [ ] release 开启 R8/资源压缩，保留 mapping。
- [ ] 关键路径有单元测试/UI 测试。
- [ ] 启动、卡顿、内存、包体有基线。

## 相关阅读 {#related}

- [编程与数据库](./../README.md)
- [安全：Android](./../../security/android/README.md)
- [Java](./../java/README.md)
- [Kotlin 与 Flutter](./../dart/flutter-basics.md)
