### 条件变量 std::condition_variable

用于线程间等待/通知，配合 `std::unique_lock<std::mutex>` 和谓词使用，避免虚假唤醒。

生产者-消费者示例：

```cpp
#include <condition_variable>
#include <mutex>
#include <queue>
#include <thread>

std::mutex mtx;
std::condition_variable cv;
std::queue<int> q;
bool done = false;

void producer() {
  for (int i = 0; i < 10; ++i) {
    {
      std::lock_guard<std::mutex> lk(mtx);
      q.push(i);
    }
    cv.notify_one();
  }
  {
    std::lock_guard<std::mutex> lk(mtx);
    done = true;
  }
  cv.notify_all();
}

void consumer() {
  for (;;) {
    std::unique_lock<std::mutex> lk(mtx);
    cv.wait(lk, [] { return !q.empty() || done; });
    if (!q.empty()) {
      int v = q.front(); q.pop();
      lk.unlock();
      // consume v
    } else if (done) {
      break;
    }
  }
}
```

要点：始终使用带谓词的 `wait`，并在持锁状态下检查共享状态。

