#!/bin/bash

# ECS Monitor 智能安装脚本
# 使用方法: sudo bash install.sh [操作] [选项]
# 操作: install|upgrade|uninstall|status
# 示例: sudo bash install.sh install --webhook-url "https://example.com/webhook"

# 检查是否使用 bash 执行
if [ -z "$BASH_VERSION" ]; then
    echo "错误: 请使用 bash 执行此脚本"
    echo "正确用法: bash install.sh 或 sudo bash install.sh"
    echo "而不是: sh install.sh"
    exit 1
fi

set -e

# ============================================
# 配置项
# ============================================
VERSION="1.0.0"
DEFAULT_INSTALL_DIR="/opt/ecs-monitor"
DEFAULT_LOG_DIR="/var/log/ecs-monitor"
SERVICE_NAME="ecs-monitor"
CONFIG_FILE="/etc/ecs-monitor/config.conf"

# 默认下载地址
DEFAULT_DOWNLOAD_URL="https://raw.githubusercontent.com/dubuqingfeng/dubuqingfeng/refs/heads/master/scripts/ecs-monitor/main.py"

# 日志配置
DEFAULT_LOG_ROTATE_DAYS=7          # 日志保留天数
DEFAULT_LOG_ROTATE_COUNT=10        # 保留的日志文件数
DEFAULT_LOG_MAX_SIZE="100M"        # 单个日志文件最大大小

# Python 环境
PYTHON_BIN=""
PYTHON_PATH=""
PYENV_ROOT=""
USE_PYENV=false

# ============================================
# 颜色定义
# ============================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================
# 辅助函数
# ============================================
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

prompt_yes_no() {
    local prompt="$1"
    local default="${2:-n}"

    if [ "$default" = "y" ]; then
        prompt="$prompt [Y/n]: "
    else
        prompt="$prompt [y/N]: "
    fi

    read -p "$prompt" -r response
    response=${response:-$default}

    if [[ "$response" =~ ^[Yy]$ ]]; then
        return 0
    else
        return 1
    fi
}

# ============================================
# 系统检查
# ============================================
check_root() {
    if [ "$EUID" -ne 0 ]; then
        log_error "需要 root 权限运行此脚本"
        echo "使用方法: sudo bash install.sh"
        exit 1
    fi
}

detect_os() {
    if [ -f /etc/os-release ]; then
        # 临时禁用 set -e 以防止 source 失败导致脚本中断
        set +e
        . /etc/os-release
        set -e
        
        OS=${ID:-unknown}
        OS_VERSION=${VERSION_ID:-unknown}
        
        # 特殊处理 Alibaba Cloud Linux
        if [[ "$OS" == "alinux" ]] || [[ "$PRETTY_NAME" =~ "Alibaba Cloud Linux" ]]; then
            OS="alinux"
            log_info "检测到操作系统: ${PRETTY_NAME:-Alibaba Cloud Linux} (使用 yum 包管理器)"
        else
            log_info "检测到操作系统: ${PRETTY_NAME:-$OS $OS_VERSION}"
        fi
    else
        log_warn "无法检测操作系统类型"
        OS="unknown"
    fi
}

check_systemd() {
    if ! command -v systemctl >/dev/null 2>&1; then
        log_error "此系统不支持 systemd"
        exit 1
    fi
}

detect_pyenv() {
    local detected_pyenv_root=""
    local detected_python_bin=""

    log_info "检测 pyenv 环境..."

    # 优先级 1: 检测命令行可用的 pyenv
    if command -v pyenv >/dev/null 2>&1; then
        detected_pyenv_root="$(pyenv root 2>/dev/null)"
        if [ -n "$detected_pyenv_root" ]; then
            log_info "检测到 pyenv (命令行): $detected_pyenv_root"

            # 立即检查并使用 shim（最高优先级）
            if [ -f "$detected_pyenv_root/shims/python3" ]; then
                PYENV_ROOT="$detected_pyenv_root"
                PYTHON_BIN="$detected_pyenv_root/shims/python3"
                USE_PYENV=true

                local current_version=$(pyenv version-name 2>/dev/null || echo "unknown")
                log_success "使用 pyenv shim: $PYTHON_BIN"
                log_info "当前版本: $current_version (切换版本后重启服务即可生效)"
                return 0
            fi
        fi
    fi

    # 优先级 2: 检查常见的 pyenv 安装位置
    local possible_roots=("/root/.pyenv" "$HOME/.pyenv")

    # 如果是通过 sudo 运行，也检查实际用户的目录
    if [ -n "$SUDO_USER" ]; then
        local sudo_user_home=$(eval echo ~$SUDO_USER)
        possible_roots+=("$sudo_user_home/.pyenv")
    fi

    # 去重
    local unique_roots=()
    for root in "${possible_roots[@]}"; do
        local found=false
        for uroot in "${unique_roots[@]}"; do
            if [ "$root" = "$uroot" ]; then
                found=true
                break
            fi
        done
        if [ "$found" = false ]; then
            unique_roots+=("$root")
        fi
    done

    # 检查每个可能的 pyenv 安装位置
    for pyenv_dir in "${unique_roots[@]}"; do
        if [ -d "$pyenv_dir" ] && [ -z "$detected_pyenv_root" ]; then
            log_info "检测到 pyenv (目录): $pyenv_dir"

            # 检查 shim 是否存在
            if [ -f "$pyenv_dir/shims/python3" ]; then
                PYENV_ROOT="$pyenv_dir"
                PYTHON_BIN="$pyenv_dir/shims/python3"
                USE_PYENV=true

                # 获取版本信息
                local current_version="unknown"
                if [ -f "$pyenv_dir/bin/pyenv" ]; then
                    current_version=$("$pyenv_dir/bin/pyenv" version-name 2>/dev/null || echo "unknown")
                fi

                log_success "使用 pyenv shim: $PYTHON_BIN"
                log_info "当前版本: $current_version (切换版本后重启服务即可生效)"
                return 0
            fi

            # 如果 shim 不存在，记录但继续查找其他位置
            log_warn "未找到 shim: $pyenv_dir/shims/python3"
            detected_pyenv_root="$pyenv_dir"
        fi
    done

    # 优先级 3: 如果找到了 pyenv 但没有 shim，使用具体版本路径（备用方案）
    if [ -n "$detected_pyenv_root" ]; then
        PYENV_ROOT="$detected_pyenv_root"
        USE_PYENV=true

        log_warn "未找到 pyenv shim，尝试获取具体版本路径"

        if command -v pyenv >/dev/null 2>&1; then
            detected_python_bin=$(pyenv which python3 2>/dev/null || pyenv which python 2>/dev/null)
        elif [ -f "$PYENV_ROOT/bin/pyenv" ]; then
            detected_python_bin=$("$PYENV_ROOT/bin/pyenv" which python3 2>/dev/null || "$PYENV_ROOT/bin/pyenv" which python 2>/dev/null)
        fi

        if [ -n "$detected_python_bin" ]; then
            PYTHON_BIN="$detected_python_bin"
            log_info "使用 pyenv Python: $PYTHON_BIN"
            log_warn "使用固定版本路径，切换版本需要重新运行安装脚本"
            return 0
        fi
    fi

    log_info "未检测到 pyenv，将使用系统 Python"
    return 1
}

fix_pyenv_shims() {
    if [ "$USE_PYENV" = true ] && [ -n "$PYENV_ROOT" ]; then
        # 检查 shims 目录是否存在
        if [ ! -d "$PYENV_ROOT/shims" ]; then
            log_warn "pyenv shims 目录不存在，尝试创建"

            if command -v pyenv >/dev/null 2>&1; then
                pyenv rehash 2>/dev/null || true
            elif [ -f "$PYENV_ROOT/bin/pyenv" ]; then
                "$PYENV_ROOT/bin/pyenv" rehash 2>/dev/null || true
            fi

            if [ -f "$PYENV_ROOT/shims/python3" ]; then
                log_success "成功创建 pyenv shims"
                PYTHON_BIN="$PYENV_ROOT/shims/python3"
                return 0
            fi
        fi
    fi
    return 1
}

check_python() {
    # 首先检测 pyenv
    if detect_pyenv; then
        log_success "已成功检测到 pyenv 环境"
        
        # 如果检测到 pyenv 但没有找到 shim，尝试修复
        if [ "$USE_PYENV" = true ] && [[ "$PYTHON_BIN" != *"/shims/"* ]]; then
            log_warn "检测到 pyenv 但未使用 shim，尝试修复..."
            fix_pyenv_shims
        fi
    fi

    # 如果没有通过 pyenv 找到 Python，使用系统 Python
    if [ -z "$PYTHON_BIN" ]; then
        log_info "尝试使用系统 Python..."
        
        if ! command -v python3 >/dev/null 2>&1; then
            log_error "未找到 python3"

            if prompt_yes_no "是否尝试自动安装 Python3?" "y"; then
                install_python
                
                # 重新检查是否安装成功
                if ! command -v python3 >/dev/null 2>&1; then
                    log_error "Python3 安装失败"
                    exit 1
                fi
            else
                log_error "Python3 是必需的依赖"
                exit 1
            fi
        fi

        PYTHON_BIN=$(command -v python3)
        log_success "使用系统 Python: $PYTHON_BIN"
    fi

    # 验证 Python 是否可执行
    if [ ! -f "$PYTHON_BIN" ] || [ ! -x "$PYTHON_BIN" ]; then
        log_error "Python 可执行文件不存在或无执行权限: $PYTHON_BIN"
        exit 1
    fi

    local python_version=$($PYTHON_BIN --version 2>&1 | awk '{print $2}')
    log_info "Python 版本: $python_version (路径: $PYTHON_BIN)"

    # 检查最低版本要求 (3.6+)
    local major=$(echo $python_version | cut -d. -f1)
    local minor=$(echo $python_version | cut -d. -f2)

    if [ "$major" -lt 3 ] || ([ "$major" -eq 3 ] && [ "$minor" -lt 6 ]); then
        log_error "需要 Python 3.6 或更高版本，当前版本: $python_version"
        exit 1
    fi

    # 设置 Python PATH
    PYTHON_PATH=$(dirname "$PYTHON_BIN")

    # 最终确认使用的路径
    if [ "$USE_PYENV" = true ]; then
        if [[ "$PYTHON_BIN" == *"/shims/"* ]]; then
            log_success "✓ 将使用 pyenv shim，支持自动版本切换"
        else
            log_warn "✗ 使用固定版本路径，版本切换需重新安装"
        fi
    else
        log_info "✓ 使用系统 Python"
    fi
}

install_python() {
    log_info "尝试安装 Python3..."

    case "$OS" in
        ubuntu|debian)
            apt-get update && apt-get install -y python3 python3-pip
            ;;
        centos|rhel|fedora|alinux|alios)
            yum install -y python3 python3-pip
            ;;
        *)
            log_error "不支持的操作系统: $OS，请手动安装 Python3"
            exit 1
            ;;
    esac
}

check_docker() {
    if ! command -v docker >/dev/null 2>&1; then
        log_warn "未检测到 Docker，容器监控功能将不可用"

        if prompt_yes_no "是否安装 Docker?" "n"; then
            install_docker
        fi
    else
        local docker_version=$(docker --version 2>&1 | awk '{print $3}' | tr -d ',')
        log_info "Docker 版本: $docker_version"
    fi
}

install_docker() {
    log_warn "请手动安装 Docker: https://docs.docker.com/engine/install/"
}

detect_download_tool() {
    if command -v curl >/dev/null 2>&1; then
        echo "curl"
    elif command -v wget >/dev/null 2>&1; then
        echo "wget"
    else
        log_error "需要安装 curl 或 wget"

        if prompt_yes_no "是否安装 curl?" "y"; then
            case "$OS" in
                ubuntu|debian)
                    apt-get update && apt-get install -y curl
                    ;;
                centos|rhel|fedora|alinux|alios)
                    yum install -y curl
                    ;;
            esac
            echo "curl"
        else
            exit 1
        fi
    fi
}

# ============================================
# 安装函数
# ============================================
load_config() {
    if [ -f "$CONFIG_FILE" ]; then
        log_info "加载配置文件: $CONFIG_FILE"
        source "$CONFIG_FILE"
    fi
}

save_config() {
    mkdir -p "$(dirname $CONFIG_FILE)"
    cat > "$CONFIG_FILE" <<EOF
# ECS Monitor 配置文件
INSTALL_DIR="${INSTALL_DIR}"
WEBHOOK_URL="${WEBHOOK_URL}"
LOG_DIR="${LOG_DIR}"
VERSION="${VERSION}"
INSTALL_DATE="$(date '+%Y-%m-%d %H:%M:%S')"

# Python 环境
PYTHON_BIN="${PYTHON_BIN}"
USE_PYENV="${USE_PYENV}"
PYENV_ROOT="${PYENV_ROOT}"

# 日志配置
LOG_ROTATE_DAYS="${LOG_ROTATE_DAYS:-$DEFAULT_LOG_ROTATE_DAYS}"
LOG_ROTATE_COUNT="${LOG_ROTATE_COUNT:-$DEFAULT_LOG_ROTATE_COUNT}"
LOG_MAX_SIZE="${LOG_MAX_SIZE:-$DEFAULT_LOG_MAX_SIZE}"
EOF
    log_success "配置已保存到: $CONFIG_FILE"
}

backup_existing() {
    if [ -d "${INSTALL_DIR}" ] && [ -f "${INSTALL_DIR}/main.py" ]; then
        local backup_dir="${INSTALL_DIR}.backup.$(date +%Y%m%d_%H%M%S)"
        log_info "备份现有安装到: $backup_dir"
        cp -r "${INSTALL_DIR}" "$backup_dir"
        echo "$backup_dir" > /tmp/ecs-monitor-backup-path
        return 0
    fi
    return 1
}

restore_backup() {
    if [ -f /tmp/ecs-monitor-backup-path ]; then
        local backup_dir=$(cat /tmp/ecs-monitor-backup-path)
        if [ -d "$backup_dir" ]; then
            log_info "恢复备份: $backup_dir"
            rm -rf "${INSTALL_DIR}"
            mv "$backup_dir" "${INSTALL_DIR}"
            rm /tmp/ecs-monitor-backup-path
            log_success "已恢复备份"
        fi
    fi
}

download_or_copy_main() {
    local source_file="$1"

    # 优先使用本地文件
    if [ -f "main.py" ]; then
        log_info "使用本地 main.py 文件"
        cp main.py "${INSTALL_DIR}/"
        return 0
    fi

    # 使用指定的下载地址
    if [ -n "$source_file" ]; then
        DOWNLOAD_URL="$source_file"
    elif [ -z "$DOWNLOAD_URL" ]; then
        DOWNLOAD_URL="$DEFAULT_DOWNLOAD_URL"
    fi

    log_info "从 URL 下载: ${DOWNLOAD_URL:0:60}..."

    local download_tool=$(detect_download_tool)

    if [ "$download_tool" = "curl" ]; then
        curl -fsSL "$DOWNLOAD_URL" -o "${INSTALL_DIR}/main.py" || {
            log_error "下载失败"
            return 1
        }
    else
        wget -q "$DOWNLOAD_URL" -O "${INSTALL_DIR}/main.py" || {
            log_error "下载失败"
            return 1
        }
    fi

    log_success "下载完成"
    return 0
}

install_dependencies() {
    log_info "安装 Python 依赖..."

    local pip_cmd=""

    # 如果使用 pyenv，优先使用 pyenv 的 pip
    if [ "$USE_PYENV" = true ] && [ -n "$PYTHON_BIN" ]; then
        local pip_path=$(dirname "$PYTHON_BIN")/pip3
        if [ -f "$pip_path" ]; then
            pip_cmd="$pip_path"
            log_info "使用 pyenv pip: $pip_cmd"
        else
            pip_path=$(dirname "$PYTHON_BIN")/pip
            if [ -f "$pip_path" ]; then
                pip_cmd="$pip_path"
                log_info "使用 pyenv pip: $pip_cmd"
            else
                # 尝试使用 python -m pip
                pip_cmd="$PYTHON_BIN -m pip"
                log_info "使用 python -m pip"
            fi
        fi
    else
        # 使用系统 pip
        if command -v pip3 >/dev/null 2>&1; then
            pip_cmd="pip3"
            log_info "使用系统 pip3"
        else
            log_warn "未找到 pip3，尝试使用 python -m pip 或安装 pip..."
            
            # 先尝试使用 python -m pip
            if $PYTHON_BIN -m pip --version >/dev/null 2>&1; then
                pip_cmd="$PYTHON_BIN -m pip"
                log_success "使用 python -m pip"
            else
                # 尝试安装 pip
                log_info "尝试安装 pip..."
                case "$OS" in
                    ubuntu|debian)
                        apt-get update >/dev/null 2>&1 || true
                        apt-get install -y python3-pip || {
                            log_warn "无法通过 apt 安装 pip，尝试使用 ensurepip"
                            $PYTHON_BIN -m ensurepip --upgrade 2>/dev/null || true
                        }
                        ;;
                    centos|rhel|fedora|alinux|alios)
                        yum install -y python3-pip || {
                            log_warn "无法通过 yum 安装 pip，尝试使用 ensurepip"
                            $PYTHON_BIN -m ensurepip --upgrade 2>/dev/null || true
                        }
                        ;;
                    *)
                        log_warn "未知操作系统，尝试使用 ensurepip"
                        $PYTHON_BIN -m ensurepip --upgrade 2>/dev/null || true
                        ;;
                esac
                
                # 重新检查
                if $PYTHON_BIN -m pip --version >/dev/null 2>&1; then
                    pip_cmd="$PYTHON_BIN -m pip"
                    log_success "pip 安装成功"
                elif command -v pip3 >/dev/null 2>&1; then
                    pip_cmd="pip3"
                    log_success "pip3 可用"
                else
                    log_error "无法安装或找到 pip"
                    exit 1
                fi
            fi
        fi
    fi

    log_info "使用 pip 命令: $pip_cmd"

    # 安装依赖
    log_info "升级 pip..."
    $pip_cmd install --upgrade pip >/dev/null 2>&1 || log_warn "pip 升级失败，继续使用当前版本"
    
    log_info "安装 psutil 和 requests..."
    if $pip_cmd install psutil requests; then
        log_success "依赖安装完成"
    else
        log_warn "某些依赖安装失败，但将继续安装"
    fi
}

create_systemd_service() {
    log_info "创建 systemd 服务..."

    # 构建执行命令
    local exec_cmd="${PYTHON_BIN} ${INSTALL_DIR}/main.py --daemon --interval 60 --state-file ${INSTALL_DIR}/monitor.json"

    if [ -n "${WEBHOOK_URL}" ]; then
        exec_cmd="${exec_cmd} --webhook-url \"${WEBHOOK_URL}\""
    fi

    # 构建 PATH 环境变量
    local env_path="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

    # 如果使用 pyenv，将 shims 目录添加到 PATH 开头
    if [ "$USE_PYENV" = true ] && [ -n "$PYENV_ROOT" ]; then
        env_path="${PYENV_ROOT}/shims:${env_path}"
        log_info "添加 pyenv shims 到 PATH: ${PYENV_ROOT}/shims"
    elif [ -n "$PYTHON_PATH" ]; then
        env_path="${PYTHON_PATH}:${env_path}"
    fi

    # 构建环境变量部分
    local env_vars=""
    env_vars="${env_vars}Environment=\"PATH=${env_path}\"\n"

    # 如果使用 pyenv，添加 pyenv 相关环境变量
    if [ "$USE_PYENV" = true ] && [ -n "$PYENV_ROOT" ]; then
        env_vars="${env_vars}Environment=\"PYENV_ROOT=${PYENV_ROOT}\"\n"

        # 如果使用 shim，不设置具体版本，让 pyenv 自动处理
        if [[ "$PYTHON_BIN" == *"/shims/"* ]]; then
            log_info "使用 pyenv shim，版本将自动跟随 pyenv 设置"
        else
            # 只有在使用具体版本路径时才设置 PYENV_VERSION
            local pyenv_version=$(basename $(dirname ${PYTHON_BIN}))
            if [[ "$pyenv_version" =~ ^[0-9] ]]; then
                env_vars="${env_vars}Environment=\"PYENV_VERSION=${pyenv_version}\"\n"
            fi
        fi
    fi

    # 添加 Webhook URL
    if [ -n "${WEBHOOK_URL}" ]; then
        env_vars="${env_vars}Environment=\"WEBHOOK_URL=${WEBHOOK_URL}\"\n"
    fi

    cat > "/etc/systemd/system/${SERVICE_NAME}.service" <<EOF
[Unit]
Description=ECS Monitor Service
Documentation=https://github.com/dubuqingfeng/dubuqingfeng/tree/master/scripts/ecs-monitor
After=network.target docker.service
Wants=docker.service

[Service]
Type=simple
User=root
WorkingDirectory=${INSTALL_DIR}
ExecStart=${exec_cmd}
Restart=always
RestartSec=10

# 日志输出到文件
StandardOutput=append:${LOG_DIR}/monitor.log
StandardError=append:${LOG_DIR}/error.log

# 环境变量
$(echo -e "$env_vars")
# 安全设置
PrivateTmp=yes
NoNewPrivileges=yes

# 资源限制
LimitNOFILE=65535
MemoryLimit=512M
CPUQuota=50%

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload

    if [ "$USE_PYENV" = true ]; then
        if [[ "$PYTHON_BIN" == *"/shims/"* ]]; then
            log_success "systemd 服务已创建（使用 pyenv shim，将自动跟随版本切换）"
        else
            log_success "systemd 服务已创建（使用 pyenv Python: $PYTHON_BIN）"
        fi
    else
        log_success "systemd 服务已创建（使用系统 Python: $PYTHON_BIN）"
    fi
}

setup_logrotate() {
    log_info "配置日志轮转..."

    local rotate_days="${LOG_ROTATE_DAYS:-$DEFAULT_LOG_ROTATE_DAYS}"
    local rotate_count="${LOG_ROTATE_COUNT:-$DEFAULT_LOG_ROTATE_COUNT}"
    local max_size="${LOG_MAX_SIZE:-$DEFAULT_LOG_MAX_SIZE}"

    cat > /etc/logrotate.d/ecs-monitor <<EOF
${LOG_DIR}/*.log {
    # 按大小或每天轮转（哪个先达到条件）
    daily
    size ${max_size}

    # 保留最近 ${rotate_count} 个文件
    rotate ${rotate_count}

    # 超过 ${rotate_days} 天的删除
    maxage ${rotate_days}

    # 压缩旧日志节省空间
    compress
    delaycompress

    # 日志文件不存在不报错
    missingok

    # 空日志不轮转
    notifempty

    # 轮转后创建新文件
    create 0644 root root

    # 添加日期后缀
    dateext
    dateformat -%Y%m%d

    # 所有日志轮转后只执行一次
    sharedscripts

    # 轮转后重新打开日志文件
    postrotate
        systemctl kill -s HUP ${SERVICE_NAME}.service >/dev/null 2>&1 || true
    endscript
}
EOF

    chmod 644 /etc/logrotate.d/ecs-monitor

    log_success "日志轮转已配置（保留 ${rotate_count} 个文件或 ${rotate_days} 天，单文件最大 ${max_size}）"

    # 测试配置
    if logrotate -d /etc/logrotate.d/ecs-monitor >/dev/null 2>&1; then
        log_info "logrotate 配置测试通过"
    else
        log_warn "logrotate 配置可能有问题，请检查"
    fi
}

verify_installation() {
    log_info "验证安装..."

    local errors=0

    # 检查文件
    if [ ! -f "${INSTALL_DIR}/main.py" ]; then
        log_error "main.py 文件未找到"
        ((errors++))
    fi

    # 检查服务文件
    if [ ! -f "/etc/systemd/system/${SERVICE_NAME}.service" ]; then
        log_error "服务文件未找到"
        ((errors++))
    fi

    # 检查 Python 可执行文件
    if [ ! -f "$PYTHON_BIN" ]; then
        log_error "Python 可执行文件未找到: $PYTHON_BIN"
        ((errors++))
    fi

    # 检查 Python 语法
    if ! $PYTHON_BIN -m py_compile "${INSTALL_DIR}/main.py" 2>/dev/null; then
        log_error "main.py 语法检查失败"
        ((errors++))
    fi

    # 检查依赖
    if ! $PYTHON_BIN -c "import psutil, requests" 2>/dev/null; then
        log_warn "某些 Python 依赖可能未正确安装"
    fi

    if [ $errors -eq 0 ]; then
        log_success "安装验证通过"
        return 0
    else
        log_error "安装验证失败，发现 $errors 个错误"
        return 1
    fi
}

do_install() {
    echo ""
    echo "=========================================="
    echo "ECS Monitor 安装向导"
    echo "=========================================="
    echo ""

    # 系统检查
    log_info "执行系统检查..."
    check_root
    detect_os
    check_systemd

    # 先加载已有配置（获取 INSTALL_DIR、WEBHOOK_URL 等）
    load_config

    # 重新检测 Python 环境（优先使用新检测到的 shim）
    check_python
    check_docker

    # 交互式配置
    if [ -z "$INSTALL_DIR" ]; then
        read -p "安装目录 [${DEFAULT_INSTALL_DIR}]: " INSTALL_DIR
        INSTALL_DIR=${INSTALL_DIR:-$DEFAULT_INSTALL_DIR}
    fi

    if [ -z "$LOG_DIR" ]; then
        LOG_DIR="$DEFAULT_LOG_DIR"
    fi

    if [ -z "$WEBHOOK_URL" ]; then
        echo ""
        log_info "Webhook URL 用于发送监控告警通知"
        read -p "Webhook URL (留空稍后配置): " WEBHOOK_URL
    fi

    echo ""
    log_info "安装配置:"
    echo "  安装目录: ${INSTALL_DIR}"
    echo "  日志目录: ${LOG_DIR}"
    echo "  Webhook:  ${WEBHOOK_URL:-未配置}"
    echo ""

    if ! prompt_yes_no "确认安装?" "y"; then
        log_info "安装已取消"
        exit 0
    fi

    # 备份现有安装
    if backup_existing; then
        log_info "检测到现有安装，已自动备份"
    fi

    # 创建目录
    log_info "创建安装目录..."
    mkdir -p "${INSTALL_DIR}"
    mkdir -p "${LOG_DIR}"
    chmod 755 "${LOG_DIR}"

    # 下载或复制文件
    if ! download_or_copy_main "$SOURCE_FILE"; then
        log_error "获取 main.py 失败"
        restore_backup
        exit 1
    fi

    chmod +x "${INSTALL_DIR}/main.py"

    # 安装依赖
    install_dependencies

    # 创建服务
    create_systemd_service

    # 配置日志轮转
    setup_logrotate

    # 保存配置
    save_config

    # 验证安装
    if ! verify_installation; then
        log_error "安装验证失败"
        if prompt_yes_no "是否回滚到备份?" "y"; then
            restore_backup
            exit 1
        fi
    fi

    # 清理备份标记
    rm -f /tmp/ecs-monitor-backup-path

    echo ""
    log_success "安装完成!"
    echo ""

    # 显示后续步骤
    show_next_steps

    # 询问是否启动
    echo ""
    if prompt_yes_no "是否立即启动服务?" "y"; then
        systemctl start ${SERVICE_NAME}
        sleep 2

        if systemctl is-active --quiet ${SERVICE_NAME}; then
            log_success "服务已启动"

            if prompt_yes_no "是否设置开机自启?" "y"; then
                systemctl enable ${SERVICE_NAME}
                log_success "已设置开机自启"
            fi

            echo ""
            log_info "实时日志："
            echo "  sudo tail -f ${LOG_DIR}/monitor.log"
            echo "  sudo tail -f ${LOG_DIR}/error.log"
        else
            log_error "服务启动失败"
            echo "查看详细信息:"
            echo "  sudo systemctl status ${SERVICE_NAME}"
        fi
    fi
}

do_upgrade() {
    log_info "升级 ECS Monitor..."

    check_root

    # 先加载配置获取安装目录等信息
    load_config

    if [ ! -d "${INSTALL_DIR}" ]; then
        log_error "未找到现有安装"
        exit 1
    fi

    # 保存旧的 Python 配置用于对比
    local old_python_bin="$PYTHON_BIN"
    local old_use_pyenv="$USE_PYENV"

    # 重新检测 Python 环境（确保使用最新的 shim）
    log_info "重新检测 Python 环境..."
    check_python

    # 显示 Python 配置变化
    if [ "$old_python_bin" != "$PYTHON_BIN" ]; then
        echo ""
        log_info "Python 配置变化:"
        echo "  旧配置: $old_python_bin"
        echo "  新配置: $PYTHON_BIN"

        if [[ "$old_python_bin" == *"/versions/"* ]] && [[ "$PYTHON_BIN" == *"/shims/"* ]]; then
            log_success "✓ 已从固定版本路径升级到 shim（支持自动版本切换）"
        fi
        echo ""
    else
        log_info "Python 配置未变化: $PYTHON_BIN"
    fi

    # 停止服务
    if systemctl is-active --quiet ${SERVICE_NAME}; then
        log_info "停止服务..."
        systemctl stop ${SERVICE_NAME}
    fi

    # 备份
    backup_existing

    # 下载新版本
    if download_or_copy_main "$SOURCE_FILE"; then
        chmod +x "${INSTALL_DIR}/main.py"

        # 更新依赖
        install_dependencies

        # 重新创建 systemd 服务（使用新的 Python 路径）
        create_systemd_service

        # 重新配置日志轮转
        setup_logrotate

        # 保存更新后的配置
        save_config

        # 验证
        if verify_installation; then
            log_success "升级完成"

            if prompt_yes_no "是否启动服务?" "y"; then
                systemctl start ${SERVICE_NAME}
                log_success "服务已启动"
            fi
        else
            log_error "升级验证失败，恢复备份"
            restore_backup
        fi
    else
        log_error "下载失败，恢复备份"
        restore_backup
    fi
}

do_uninstall() {
    log_warn "准备卸载 ECS Monitor"

    if ! prompt_yes_no "确认卸载?" "n"; then
        log_info "卸载已取消"
        exit 0
    fi

    check_root
    load_config

    # 停止并禁用服务
    if systemctl is-active --quiet ${SERVICE_NAME} 2>/dev/null; then
        log_info "停止服务..."
        systemctl stop ${SERVICE_NAME}
    fi

    if systemctl is-enabled --quiet ${SERVICE_NAME} 2>/dev/null; then
        log_info "禁用服务..."
        systemctl disable ${SERVICE_NAME}
    fi

    # 删除服务文件
    if [ -f "/etc/systemd/system/${SERVICE_NAME}.service" ]; then
        log_info "删除服务文件..."
        rm "/etc/systemd/system/${SERVICE_NAME}.service"
        systemctl daemon-reload
    fi

    # 询问是否删除文件
    if prompt_yes_no "是否删除安装目录 ${INSTALL_DIR}?" "y"; then
        rm -rf "${INSTALL_DIR}"
        log_success "已删除安装目录"
    fi

    if prompt_yes_no "是否删除日志 ${LOG_DIR}?" "n"; then
        rm -rf "${LOG_DIR}"
        log_success "已删除日志"
    fi

    if prompt_yes_no "是否删除配置文件?" "n"; then
        rm -f "$CONFIG_FILE"
        rm -f /etc/logrotate.d/ecs-monitor
        log_success "已删除配置文件"
    fi

    log_success "卸载完成"
}

diagnose_pyenv() {
    echo ""
    log_info "=== pyenv 环境诊断 ==="
    echo ""

    # 检查 pyenv 命令
    if command -v pyenv >/dev/null 2>&1; then
        log_success "✓ pyenv 命令可用"
        echo "  路径: $(which pyenv)"
        echo "  版本: $(pyenv --version)"
    else
        log_warn "✗ pyenv 命令不可用"
    fi

    # 检查 PYENV_ROOT
    local pyenv_roots=("/root/.pyenv" "$HOME/.pyenv")
    if [ -n "$SUDO_USER" ]; then
        local sudo_user_home=$(eval echo ~$SUDO_USER)
        pyenv_roots+=("$sudo_user_home/.pyenv")
    fi

    echo ""
    log_info "检查 pyenv 安装位置:"
    for root in "${pyenv_roots[@]}"; do
        if [ -d "$root" ]; then
            log_success "✓ 找到: $root"

            # 检查 shims 目录
            if [ -d "$root/shims" ]; then
                log_success "  ✓ shims 目录存在"
                if [ -f "$root/shims/python3" ]; then
                    log_success "  ✓ python3 shim 存在"
                    echo "    $($root/shims/python3 --version 2>&1)"
                else
                    log_warn "  ✗ python3 shim 不存在"
                    log_info "  修复方法: 运行 'pyenv rehash'"
                fi
            else
                log_warn "  ✗ shims 目录不存在"
            fi

            # 检查已安装的版本
            if [ -d "$root/versions" ]; then
                echo "  已安装版本:"
                ls -1 "$root/versions" | sed 's/^/    - /'
            fi
        else
            echo "  ✗ 未找到: $root"
        fi
    done

    echo ""
}

show_status() {
    log_info "ECS Monitor 状态"
    echo ""

    if [ -f "$CONFIG_FILE" ]; then
        log_info "配置信息:"
        cat "$CONFIG_FILE" | grep -v "^#" | sed 's/^/  /'
        echo ""
    fi

    # 显示 Python 环境信息
    if [ -f "$CONFIG_FILE" ]; then
        source "$CONFIG_FILE"
        if [ "$USE_PYENV" = "true" ]; then
            log_info "Python 环境: pyenv ($PYTHON_BIN)"
            if [ -n "$PYENV_ROOT" ]; then
                echo "  PYENV_ROOT: $PYENV_ROOT"

                # 判断是否使用 shim
                if [[ "$PYTHON_BIN" == *"/shims/"* ]]; then
                    log_success "  使用 shim（支持自动版本切换）"
                else
                    log_warn "  使用固定版本路径（不支持自动版本切换）"
                    echo ""
                    log_info "  要启用自动版本切换，请运行:"
                    echo "    1. pyenv rehash  # 重建 shims"
                    echo "    2. sudo bash install.sh upgrade  # 重新配置"
                fi
            fi
        else
            log_info "Python 环境: 系统 Python ($PYTHON_BIN)"
        fi
        echo ""
    fi

    if systemctl list-unit-files | grep -q ${SERVICE_NAME}; then
        log_info "服务状态:"
        systemctl status ${SERVICE_NAME} --no-pager || true
    else
        log_warn "服务未安装"
    fi

    # 提供诊断选项
    echo ""
    if prompt_yes_no "是否运行 pyenv 环境诊断?" "n"; then
        diagnose_pyenv
    fi
}

show_next_steps() {
    echo "常用命令:"
    echo "  启动服务:   sudo systemctl start ${SERVICE_NAME}"
    echo "  停止服务:   sudo systemctl stop ${SERVICE_NAME}"
    echo "  重启服务:   sudo systemctl restart ${SERVICE_NAME}"
    echo "  查看状态:   sudo systemctl status ${SERVICE_NAME}"
    echo "  开机自启:   sudo systemctl enable ${SERVICE_NAME}"
    echo "  禁用自启:   sudo systemctl disable ${SERVICE_NAME}"
    echo ""
    echo "日志管理:"
    echo "  查看日志:       sudo tail -f ${LOG_DIR}/monitor.log"
    echo "  查看错误日志:   sudo tail -f ${LOG_DIR}/error.log"
    echo "  手动轮转日志:   sudo logrotate -f /etc/logrotate.d/ecs-monitor"
    echo "  查看日志大小:   sudo du -sh ${LOG_DIR}"
    echo ""
    echo "其他:"
    echo "  升级:       sudo bash install.sh upgrade"
    echo "  卸载:       sudo bash install.sh uninstall"

    # pyenv 版本切换提示
    if [ "$USE_PYENV" = true ]; then
        echo ""
        log_info "pyenv Python 环境"
        if [[ "$PYTHON_BIN" == *"/shims/"* ]]; then
            echo "  当前使用 pyenv shim，切换 Python 版本后会自动生效"
            echo ""
            echo "  切换 Python 版本的步骤:"
            echo "    1. pyenv global 3.12.0  # 或 pyenv local 3.12.0"
            echo "    2. sudo systemctl restart ${SERVICE_NAME}"
            echo ""
            echo "  验证当前版本:"
            echo "    pyenv version"
            echo "    sudo systemctl status ${SERVICE_NAME}"
        else
            echo "  当前使用固定 Python 路径: $PYTHON_BIN"
            echo ""
            echo "  如需切换 Python 版本:"
            echo "    1. pyenv global 3.12.0  # 切换版本"
            echo "    2. sudo bash install.sh upgrade  # 重新配置服务"
        fi
    fi

    if [ -z "$WEBHOOK_URL" ]; then
        echo ""
        log_warn "Webhook URL 未配置，无法发送告警通知"
        echo "配置方法:"
        echo "  1. 编辑配置: sudo nano $CONFIG_FILE"
        echo "  2. 添加或修改: WEBHOOK_URL=\"https://your-webhook-url\""
        echo "  3. 重新运行: sudo bash install.sh install"
    fi
}

show_help() {
    cat <<EOF
ECS Monitor 智能安装脚本 v${VERSION}

使用方法:
  sudo bash install.sh [操作] [选项]

操作:
  install      安装 ECS Monitor (默认)
  upgrade      升级到最新版本
  uninstall    卸载 ECS Monitor
  status       显示当前状态
  diagnose     诊断 pyenv 环境
  help         显示此帮助信息

特性:
  ✅ 自动检测并支持 pyenv Python 环境
  ✅ 自动检测并安装系统依赖
  ✅ 智能备份与回滚机制
  ✅ 完整的日志轮转管理

选项:
  --install-dir DIR         指定安装目录 (默认: /opt/ecs-monitor)
  --webhook-url URL         Webhook 通知地址
  --download-url URL        下载地址 (默认使用内置地址)
  --log-dir DIR             日志目录 (默认: /var/log/ecs-monitor)
  --log-rotate-days N       日志保留天数 (默认: 7)
  --log-rotate-count N      保留的日志文件数 (默认: 10)
  --log-max-size SIZE       单个日志文件最大大小 (默认: 100M)
  --non-interactive         非交互模式

示例:
  # 交互式安装
  sudo bash install.sh

  # 指定配置安装
  sudo bash install.sh install --webhook-url "https://hooks.example.com" \\
    --install-dir /opt/monitor

  # 从自定义 URL 安装
  sudo bash install.sh install --download-url "https://example.com/main.py"

  # 自定义日志配置
  sudo bash install.sh install --log-rotate-days 30 \\
    --log-rotate-count 20 --log-max-size 200M

  # 升级
  sudo bash install.sh upgrade

  # 卸载
  sudo bash install.sh uninstall

环境变量:
  INSTALL_DIR      安装目录
  WEBHOOK_URL      Webhook URL
  DOWNLOAD_URL     下载地址
  LOG_DIR          日志目录
  PYENV_ROOT       pyenv 安装路径（自动检测）

Python 环境支持:
  - 自动检测 pyenv 环境并优先使用（如果已安装）
  - 支持 pyenv 管理的 Python 版本
  - 完全兼容没有安装 pyenv 的环境
  - 如果未检测到 pyenv，自动使用系统 Python
  - 自动配置 systemd 服务使用正确的 Python 路径

配置文件:
  ${CONFIG_FILE}

EOF
}

# ============================================
# 参数解析
# ============================================
parse_args() {
    ACTION="${1:-install}"
    shift || true

    while [[ $# -gt 0 ]]; do
        case $1 in
            --install-dir)
                INSTALL_DIR="$2"
                shift 2
                ;;
            --webhook-url)
                WEBHOOK_URL="$2"
                shift 2
                ;;
            --download-url)
                DOWNLOAD_URL="$2"
                shift 2
                ;;
            --source-file)
                SOURCE_FILE="$2"
                shift 2
                ;;
            --log-dir)
                LOG_DIR="$2"
                shift 2
                ;;
            --log-rotate-days)
                LOG_ROTATE_DAYS="$2"
                shift 2
                ;;
            --log-rotate-count)
                LOG_ROTATE_COUNT="$2"
                shift 2
                ;;
            --log-max-size)
                LOG_MAX_SIZE="$2"
                shift 2
                ;;
            --non-interactive)
                NON_INTERACTIVE=1
                shift
                ;;
            *)
                log_error "未知选项: $1"
                show_help
                exit 1
                ;;
        esac
    done
}

# ============================================
# 主函数
# ============================================
main() {
    parse_args "$@"

    case "$ACTION" in
        install)
            do_install
            ;;
        upgrade)
            do_upgrade
            ;;
        uninstall)
            do_uninstall
            ;;
        status)
            show_status
            ;;
        diagnose)
            diagnose_pyenv
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            log_error "未知操作: $ACTION"
            show_help
            exit 1
            ;;
    esac
}

main "$@"
