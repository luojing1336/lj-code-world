/**
 * 将GitHub URL转换为jsDelivr CDN URL
 * 
 * @param {string} originalUrl - GitHub文件的完整URL
 * @param {ConvertOptions} [options] - 转换选项
 * @returns {string | null} 转换后的jsDelivr CDN URL，如果输入无效则返回null
 * 
 * @example
 * // 基本使用
 * const cdnUrl = convertGithubToJsdelivr('https://github.com/jquery/jquery/blob/main/dist/jquery.min.js');
 * console.log(cdnUrl); // https://cdn.jsdelivr.net/gh/jquery/jquery@main/dist/jquery.min.js
 * 
 * // 使用最新版本
 * const latestUrl = convertGithubToJsdelivr(
 *   'https://github.com/jquery/jquery/blob/main/dist/jquery.min.js',
 *   { useLatest: true }
 * );
 * console.log(latestUrl); // https://cdn.jsdelivr.net/gh/jquery/jquery@latest/dist/jquery.min.js
 * 
 * // 指定特定版本
 * const versionUrl = convertGithubToJsdelivr(
 *   'https://github.com/jquery/jquery/blob/main/dist/jquery.min.js',
 *   { version: '3.6.0' }
 * );
 * console.log(versionUrl); // https://cdn.jsdelivr.net/gh/jquery/jquery@3.6.0/dist/jquery.min.js
 */
function convertGithubToJsdelivr(originalUrl, options = {}) {
  try {
    // 验证输入是否为有效的URL
    const url = new URL(originalUrl);
    
    // 验证是否为GitHub域名
    if (url.hostname !== 'github.com') {
      console.warn('URL must be from github.com domain');
      return originalUrl;
    }
    
    // 解析路径部分
    const pathSegments = url.pathname.split('/').filter(segment => segment.length > 0);
    
    // GitHub URL 格式：/username/repository/blob/branch/filepath
    // 至少需要：username, repository, blob, branch
    if (pathSegments.length < 4) {
      console.warn('Invalid GitHub URL format');
      return originalUrl;
    }
    
    // 检查是否包含 'blob' 关键字
    if (pathSegments[2] !== 'blob') {
      console.warn('URL must contain /blob/ in the path');
      return originalUrl;
    }
    
    const [username, repository, , branch, ...fileParts] = pathSegments;
    
    // 验证必要的部分是否存在
    if (!username || !repository || !branch) {
      console.warn('Missing required URL components (username, repository, or branch)');
      return originalUrl;
    }
    
    // 构建文件路径
    const filePath = fileParts.length > 0 ? '/' + fileParts.join('/') : '';
    
    // 确定使用的版本
    let versionTag;
    if (options.version) {
      versionTag = options.version;
    } else if (options.useLatest) {
      versionTag = 'latest';
    } else {
      versionTag = branch;
    }
    
    // 构建jsDelivr URL
    const jsdelivrUrl = `https://cdn.jsdelivr.net/gh/${username}/${repository}@${versionTag}${filePath}`;
    
    return jsdelivrUrl;
    
  } catch (error) {
    console.error('Error parsing GitHub URL:', error);
    return originalUrl;
  }
}

/**
 * 验证GitHub URL格式是否正确
 * 
 * @param {string} url - 要验证的URL
 * @returns {boolean} 是否为有效的GitHub文件URL
 * 
 * @example
 * console.log(isValidGithubUrl('https://github.com/jquery/jquery/blob/main/dist/jquery.min.js')); // true
 * console.log(isValidGithubUrl('https://github.com/jquery/jquery')); // false
 * console.log(isValidGithubUrl('https://gitlab.com/user/repo/blob/main/file.js')); // false
 */
function isValidGithubUrl(url) {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname !== 'github.com') {
      return false;
    }
    
    const pathSegments = urlObj.pathname.split('/').filter(segment => segment.length > 0);
    return pathSegments.length >= 4 && pathSegments[2] === 'blob';
  } catch {
    return false;
  }
}

export {
  convertGithubToJsdelivr,
  isValidGithubUrl
};