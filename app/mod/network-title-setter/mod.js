// name: network-title-setter
// author: MingTechpro
// date: 2026-03-11
// description: 检测当前网络环境并动态设置页面标题，支持内网/公网环境识别和自定义配置
// description: Detect network env, set page title dynamically—support intranet/public identification & custom config.

(function () {
  // 网络配置对象，可自由修改这些值
  const NETWORK_CONFIG = {
    internal: {
      networkName: "", // 内网网络名称，默认为"局域网"
      systemName: "", // 内网系统名称，默认为"HomeOS"
    },
    external: {
      networkName: "", // 外网网络名称，默认为"公网"
      systemName: "", // 外网系统名称，默认为当前文档标题
    },
  };

  /**
   * 检测是否为内网地址
   * @param {string} hostname - 主机名或IP地址
   * @returns {boolean} 如果是内网地址返回true，否则返回false
   */
  function isInternalNetwork(hostname) {
    // 1. 检测本地主机
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return true;
    }

    // 2. 检测IPv4私有地址段
    // 10.x.x.x, 172.16-31.x.x, 192.168.x.x, 127.x.x.x
    if (
      /^(?:(?:10|127|172\.(?:1[6-9]|2[0-9]|3[01])|192\.168))\..*/.test(hostname)
    ) {
      return true;
    }

    // 3. 检测IPv6私有地址
    if (hostname.includes(":")) {
      const ipv6 = hostname.toLowerCase();
      if (
        ipv6 === "::1" ||
        ipv6.startsWith("fc") ||
        ipv6.startsWith("fd") ||
        ipv6.startsWith("fe80:")
      ) {
        return true;
      }
    }

    return false;
  }

  // 默认配置值，当NETWORK_CONFIG中的对应字段为空时使用
  const DEFAULT_CONFIG = {
    internal: {
      networkName: "局域网",
      systemName: "HomeOS",
    },
    external: {
      networkName: "公网",
      // 外网systemName默认为当前文档标题
      systemName: document.title,
    },
  };

  /**
   * 获取配置值，如果用户配置为空则使用默认值
   * @param {string} networkType - 网络类型: "internal" 或 "external"
   * @param {string} field - 字段名: "networkName" 或 "systemName"
   * @returns {string} 配置值
   */
  function getConfigValue(networkType, field) {
    const userValue = NETWORK_CONFIG[networkType][field];
    const defaultValue = DEFAULT_CONFIG[networkType][field];

    // 如果用户配置为空字符串，使用默认值
    return userValue === "" ? defaultValue : userValue;
  }

  // 获取当前页面主机信息
  const hostname = window.location.hostname;
  const host = window.location.host;
  const isInternal = isInternalNetwork(hostname);

  /**
   * 格式化页面标题
   * @returns {string} 格式化后的标题
   */
  function formatTitle() {
    if (isInternal) {
      // 内网标题格式：网络名称 - 系统名称 | 主机名:端口
      const networkName = getConfigValue("internal", "networkName");
      const systemName = getConfigValue("internal", "systemName");
      return `${networkName} - ${systemName} | ${host}`;
    } else {
      // 外网标题格式：网络名称 - 系统名称 | 主机名:端口
      const networkName = getConfigValue("external", "networkName");
      const systemName = getConfigValue("external", "systemName");
      return `${networkName} - ${systemName} | ${host}`;
    }
  }

  // 设置页面标题
  document.title = formatTitle();
})();
