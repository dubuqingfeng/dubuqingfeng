

```python
import csv
import subprocess
import time

# 定义 CSV 文件路径
csv_file_path = 'repositories.csv'

# 定义命令模板
command_template = (
    "./newreleases project add github {repo_name} --webhook xxx "
    "--webhook xxx --tag xxx"
)

# 最大重试次数
max_retries = 5

def execute_command_with_retry(command, max_retries=5):
    retries = 0
    delay = 4  # 初始延迟时间（秒）

    while retries < max_retries:
        result = ""
        try:
            result = subprocess.run(command, shell=True, capture_output=True, check=False)
            print(f"命令执行完成: {command} {result}")
            if result.returncode == 0:
                print(f"命令执行成功: {command} {result}")
                return True
            if str(result.stderr) is not None:
                error_message = str(result.stderr).lower()
                print(str(result.stderr).lower())
                if "error: too many requests" in error_message:
                    retries += 1
                    print(f"请求过多，重试第 {retries} 次，延迟 {delay} 秒后重试...")
                    time.sleep(delay)
                    delay *= 2  # 指数退避，延迟时间翻倍
                    continue
                elif "error: project already added." in error_message:
                    print(f"命令执行失败（'project already added.' 错误）: {error_message}")
                    return True
                else:
                    print(f"命令执行失败（非 'too many requests' 错误）: {error_message}")
                    return False
            else:
                return True
        except subprocess.CalledProcessError as e:
            error_message = str(e)
    print(f"达到最大重试次数 ({max_retries})，命令失败: {command}")
    return False

def filter_and_execute(csv_file_path):
    try:
        # 读取 CSV 文件内容到列表
        with open(csv_file_path, 'r', encoding='utf-8') as csvfile:
            reader = csv.reader(csvfile)
            rows = list(reader)

        # 第一行为表头
        header = rows[0]
        data = rows[1:]

        # 用于存储未处理的行
        remaining_rows = [header]

        for row in data:
            if len(row) < 2:
                continue

            # 提取仓库名称
            repo_names = row[1]

            # 拆分多个仓库名称，并过滤掉包含括号的条目
            filtered_repos = [
                repo.strip() for repo in repo_names.split(',') if '(' not in repo
            ]

            success = True
            for repo in filtered_repos:
                if repo == "none":
                    continue
                command = command_template.format(repo_name=repo)
                print(f"执行命令: {command}")

                # 调用命令并处理重试逻辑
                success = execute_command_with_retry(command, max_retries)
                if not success:
                    print(f"仓库 {repo} 的处理失败，跳过...")
                    break  # 如果当前行的某个命令失败，保留该行

                # 正常执行时的固定延迟
                time.sleep(1)

            # 如果成功处理整行，则不加入剩余行
            if not success:
                remaining_rows.append(row)

        # 覆盖写入 CSV 文件，仅写入未处理的行
        with open(csv_file_path, 'w', encoding='utf-8', newline='') as csvfile:
            writer = csv.writer(csvfile)
            writer.writerows(remaining_rows)

        print(f"CSV 文件已更新，仅保留未处理的行，共 {len(remaining_rows) - 1} 条记录。")

    except Exception as e:
        print(f"发生错误: {e}")

# 执行函数
filter_and_execute(csv_file_path)
```