import json
import subprocess
import psutil
import requests
import os
import argparse
import time
import signal
import sys
import socket
import logging
from typing import Dict, List, Optional

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
log = logging.getLogger(__name__)

# /usr/bin/python3 /data/monitor.py --daemon --interval 60 --state-file /data/monitor.json > /data/monitor.log 2>&1 &
# /usr/bin/python3 /data1/monitor.py --daemon --interval 60 --state-file /data1/monitor.json > /data1/monitor.log 2>&1 &
# /usr/bin/python3 /data2/monitor.py --daemon --interval 60 --state-file /data2/monitor.json > /data2/monitor.log 2>&1 &
# 
# 单次执行 (cron): * * * * * /usr/bin/python3 /data2/monitor.py --state-file /data2/monitor.json > /data2/monitor.log
# 持续运行模式: /usr/bin/python3 /data/monitor.py --daemon --interval 60 --state-file /data/monitor.json > /data/monitor.log 2>&1 &
# 手动指定 IP: /usr/bin/python3 /data2/monitor.py --source-ip "" --daemon --interval 60 > /data2/monitor.log 2>&1 &
# 自定义阈值: /usr/bin/python3 /data/monitor.py --daemon --interval 60 --cpu-threshold 30 --memory-threshold 25 > /data/monitor.log 2>&1 &
# 配置参数（使用时请替换为实际值）
# WEBHOOK_URL 可以通过环境变量或命令行参数指定
WEBHOOK_URL = os.getenv('WEBHOOK_URL', '')  # 从环境变量读取，默认为空

# 全局标志用于优雅退出
running = True

def signal_handler(signum, frame):
    """信号处理函数，用于优雅退出"""
    global running
    log.info(f"\n接收到信号 {signum}，准备退出...")
    running = False
    sys.exit(0)

def get_local_ip() -> str:
    """获取本机 IP 地址"""
    try:
        # 创建一个 UDP socket 连接到外部地址（不实际发送数据）
        # 这样可以获取本机用于外部通信的 IP 地址
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception as e:
        log.warning(f"获取本机 IP 失败: {str(e)}，使用默认值 127.0.0.1")
        return "127.0.0.1"

def get_container_info() -> List[Dict]:
    """获取当前运行的Docker容器信息"""
    try:
        cmd = ['docker', 'ps', '--format', '{{json .}}']
        output = subprocess.check_output(cmd, stderr=subprocess.STDOUT)
    except (subprocess.CalledProcessError, FileNotFoundError) as e:
        log.error(f"获取容器信息失败: {str(e)}")
        return []

    containers = []
    for line in output.decode().splitlines():
        try:
            data = json.loads(line)
            containers.append({
                'id': data['ID'],
                'name': data['Names'],
                'status': data['Status']
            })
        except (json.JSONDecodeError, KeyError) as e:
            log.error(f"解析容器信息错误: {str(e)}")

    containers.sort(key=lambda x: x['id'])
    return containers

def get_directory_size(path: str) -> int:
    """获取目录大小（字节）"""
    total_size = 0
    try:
        for entry in os.scandir(path):
            if entry.is_file():
                total_size += entry.stat().st_size
            elif entry.is_dir():
                total_size += get_directory_size(entry.path)
    except (PermissionError, FileNotFoundError) as e:
        log.error(f"获取目录大小错误 {path}: {str(e)}")
    return total_size

def get_top_level_dirs(mountpoint: str, max_depth: int = 3) -> List[Dict]:
    """获取挂载点下的一级目录及其大小信息
    
    Args:
        mountpoint: 挂载点路径
        max_depth: 最大扫描深度
    """
    dirs_info = []
    try:
        for entry in os.scandir(mountpoint):
            if entry.is_dir():
                # 跳过 Docker overlay2 目录
                if '/docker/overlay2' in entry.path:
                    continue
                try:
                    size_bytes = get_directory_size(entry.path)
                    dirs_info.append({
                        'name': entry.name,
                        'path': entry.path,
                        'size': format_size(size_bytes),
                        'size_bytes': size_bytes  # 添加原始字节大小用于排序
                    })
                except Exception as e:
                    log.error(f"获取目录大小错误 {entry.path}: {str(e)}")
                    continue
    except (PermissionError, FileNotFoundError) as e:
        log.error(f"获取目录信息错误 {mountpoint}: {str(e)}")

    # 按原始字节大小降序排序
    dirs_info.sort(key=lambda x: x['size_bytes'], reverse=True)
    # 移除临时排序用的字节大小字段
    for dir_info in dirs_info:
        dir_info.pop('size_bytes')
    return dirs_info

def get_disk_info() -> List[Dict]:
    """获取磁盘使用信息"""
    disks = []
    for part in psutil.disk_partitions():
        try:
            usage = psutil.disk_usage(part.mountpoint)
            disk_info = {
                'device': part.device,
                'mountpoint': part.mountpoint,
                'total': format_size(usage.total),
                'used': format_size(usage.used),
                'free': format_size(usage.free),
                'percent': usage.percent,
                'top_dirs': []
            }
            try:
                disk_info['top_dirs'] = get_top_level_dirs(part.mountpoint, 1)
            except Exception as e:
                log.error(f"获取目录信息错误 {part.mountpoint}: {str(e)}")
            
            disks.append(disk_info)
        except Exception as e:
            log.error(f"获取磁盘信息错误 {part.mountpoint}: {str(e)}")
            continue

    disks.sort(key=lambda x: x['mountpoint'])
    return disks

def get_system_info() -> Dict:
    """获取系统 CPU 和内存信息"""
    try:
        # CPU 信息
        cpu_percent = psutil.cpu_percent(interval=1)
        cpu_count = psutil.cpu_count()
        
        # 内存信息
        memory = psutil.virtual_memory()
        memory_info = {
            'total': format_size(memory.total),
            'used': format_size(memory.used),
            'free': format_size(memory.free),
            'percent': memory.percent
        }
        
        return {
            'cpu': {
                'percent': cpu_percent,
                'count': cpu_count
            },
            'memory': memory_info
        }
    except Exception as e:
        log.error(f"获取系统信息错误: {str(e)}")
        return {
            'cpu': {'percent': 0, 'count': 0},
            'memory': {'total': '0B', 'used': '0B', 'free': '0B', 'percent': 0}
        }

def load_previous_state(state_file: str) -> Optional[Dict]:
    """加载上次存储的状态"""
    try:
        with open(state_file, 'r') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return None

def save_current_state(state: Dict, state_file: str) -> None:
    """保存当前状态"""
    with open(state_file, 'w') as f:
        json.dump(state, f, indent=2)

def send_webhook(content: Dict, source_ip: str, webhook_url: str) -> bool:
    """发送Webhook通知"""
    if not webhook_url:
        log.warning("Webhook URL 未配置，跳过发送通知")
        return False
    
    try:
        payload = {}
        payload['source_ip'] = source_ip
        payload['payload'] = content
        # 添加一个时间
        payload['time'] = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
        response = requests.post(webhook_url, json=payload)
        return response.status_code == 200
    except requests.RequestException as e:
        log.error(f"Webhook发送失败: {str(e)}")
        return False

def format_size(size_bytes: int) -> str:
    """将字节大小转换为人类可读的格式"""
    for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
        if size_bytes < 1024.0:
            return f"{size_bytes:.2f}{unit}"
        size_bytes /= 1024.0
    return f"{size_bytes:.2f}PB"

def check_and_notify(source_ip: str, state_file: str, webhook_url: str, cpu_threshold: float = 20.0, memory_threshold: float = 20.0) -> None:
    """执行一次监控检查并在状态变化时发送通知
    
    Args:
        source_ip: 源IP地址
        state_file: 状态文件路径
        webhook_url: Webhook URL
        cpu_threshold: CPU 使用率变化阈值（百分比），默认20%
        memory_threshold: 内存使用率变化阈值（百分比），默认20%
    """
    start_time = time.time()

    disks = get_disk_info()
    percent_dir = ''
    for disk in disks:
        # 也加上总大小
        percent_dir += disk['mountpoint'] + ' ' + str(disk['percent']) + '% ' + str(disk['total']) + '\n'

    # 获取系统信息
    system_info = get_system_info()

    # 获取当前系统状态
    current_state = {
        'containers': get_container_info(),
        'disks': disks,
        'percent_dir': percent_dir,
        'system': system_info
    }

    # 转成 json
    current_state_json = json.dumps(current_state)

    # 获取上次状态并比较
    previous_state = load_previous_state(state_file)

    if previous_state is None:
        send_webhook(current_state, source_ip, webhook_url)
        save_current_state(current_state, state_file)
        elapsed_time = time.time() - start_time
        log.info(f"检查完成，耗时: {elapsed_time:.2f}秒")
        return

    # 把容器的名称和目录单独列出来进行比较，不比较大小
    data_compare_cur = []
    if 'containers' in current_state and len(current_state['containers']) > 0:
        for container in current_state['containers']:
            data_compare_cur.append({
                'name': container['name']
            })
    if 'disks' in current_state and len(current_state['disks']) > 0:
        for disk in current_state['disks']:
            for dir in disk['top_dirs']:
                data_compare_cur.append({
                    'name': dir['name'],
                    'path': dir['path']
                })
    data_compare_cur.sort(key=lambda x: x['name'])
    data_compare_prev = []
    if 'containers' in previous_state and len(previous_state['containers']) > 0:
        for container in previous_state['containers']:
            data_compare_prev.append({
                'name': container['name']
            })
    if 'disks' in previous_state and len(previous_state['disks']) > 0:
        for disk in previous_state['disks']:
            for dir in disk['top_dirs']:
                data_compare_prev.append({
                    'name': dir['name'],
                    'path': dir['path']
                })
    data_compare_prev.sort(key=lambda x: x['name'])

    # 检查 CPU 和内存变化
    cpu_changed = False
    memory_changed = False
    change_reason = []
    
    if 'system' in previous_state and 'system' in current_state:
        # CPU 变化检查
        prev_cpu = previous_state['system'].get('cpu', {}).get('percent', 0)
        curr_cpu = current_state['system'].get('cpu', {}).get('percent', 0)
        cpu_diff = abs(curr_cpu - prev_cpu)
        
        if cpu_diff >= cpu_threshold:
            cpu_changed = True
            change_reason.append(f"CPU使用率变化: {prev_cpu:.1f}% -> {curr_cpu:.1f}% (变化{cpu_diff:.1f}%)")
            log.info(f"检测到CPU使用率大幅变化: {prev_cpu:.1f}% -> {curr_cpu:.1f}%")
        
        # 内存变化检查
        prev_memory = previous_state['system'].get('memory', {}).get('percent', 0)
        curr_memory = current_state['system'].get('memory', {}).get('percent', 0)
        memory_diff = abs(curr_memory - prev_memory)
        
        if memory_diff >= memory_threshold:
            memory_changed = True
            change_reason.append(f"内存使用率变化: {prev_memory:.1f}% -> {curr_memory:.1f}% (变化{memory_diff:.1f}%)")
            log.info(f"检测到内存使用率大幅变化: {prev_memory:.1f}% -> {curr_memory:.1f}%")

    # 检查容器和目录是否变化
    structure_changed = data_compare_prev != data_compare_cur
    
    if structure_changed:
        change_reason.append("容器或目录结构变化")

    # 如果没有任何变化，直接返回
    if not structure_changed and not cpu_changed and not memory_changed:
        elapsed_time = time.time() - start_time
        log.info(f"状态未变化，耗时: {elapsed_time:.2f}秒")
        return

    # 状态变化处理
    log.info(f"检测到状态变化: {', '.join(change_reason)}")
    log.info(current_state_json)
    
    # 添加变化原因到通知内容
    notification_content = current_state.copy()
    notification_content['change_reason'] = change_reason
    
    if send_webhook(notification_content, source_ip, webhook_url):
        save_current_state(current_state, state_file)
        elapsed_time = time.time() - start_time
        log.info(f"状态已更新并发送通知，耗时: {elapsed_time:.2f}秒")
    else:
        elapsed_time = time.time() - start_time
        log.warning(f"状态变化未保存，耗时: {elapsed_time:.2f}秒")

def main():
    # 注册信号处理器
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    # 解析命令行参数
    parser = argparse.ArgumentParser(description='ECS系统监控脚本')
    parser.add_argument('--source-ip', help='源IP地址标识（不指定则自动获取本机IP）')
    parser.add_argument('--state-file', default='system_state.json', help='状态存储文件路径 (default: system_state.json)')
    parser.add_argument('--webhook-url', help='Webhook URL 地址（也可通过 WEBHOOK_URL 环境变量指定）')
    parser.add_argument('--daemon', action='store_true', help='持续运行模式')
    parser.add_argument('--interval', type=int, default=60, help='持续运行模式下的检查间隔（秒），默认60秒')
    parser.add_argument('--cpu-threshold', type=float, default=50.0, help='CPU使用率变化阈值（百分比），默认50%%')
    parser.add_argument('--memory-threshold', type=float, default=50.0, help='内存使用率变化阈值（百分比），默认50%%')
    args = parser.parse_args()

    # 如果没有指定 source-ip，则自动获取
    source_ip = args.source_ip if args.source_ip else get_local_ip()
    log.info(f"使用 IP 地址: {source_ip}")
    
    # 确定 webhook_url：命令行参数优先，其次是环境变量，最后是全局默认值
    webhook_url = args.webhook_url if args.webhook_url else WEBHOOK_URL
    if webhook_url:
        log.info(f"使用 Webhook URL: {webhook_url[:50]}...")  # 只显示前50个字符
    else:
        log.warning("未配置 Webhook URL，将不会发送通知")
    
    log.info(f"监控阈值 - CPU: {args.cpu_threshold}%, 内存: {args.memory_threshold}%")

    if args.daemon:
        log.info(f"以持续运行模式启动，检查间隔: {args.interval}秒")
        log.info("按 Ctrl+C 退出")

        global running
        while running:
            try:
                timestamp = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
                log.info(f"\n[{timestamp}] 开始检查...")
                check_and_notify(source_ip, args.state_file, webhook_url, args.cpu_threshold, args.memory_threshold)

                if running:
                    log.info(f"等待 {args.interval} 秒后进行下次检查...")
                    time.sleep(args.interval)
            except Exception as e:
                log.error(f"执行出错: {str(e)}")
                if running:
                    log.info(f"等待 {args.interval} 秒后重试...")
                    time.sleep(args.interval)
    else:
        # 单次执行模式（向后兼容）
        check_and_notify(source_ip, args.state_file, webhook_url, args.cpu_threshold, args.memory_threshold)

if __name__ == "__main__":
    main()