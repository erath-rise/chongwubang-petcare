/**
 * 生成唯一订单号
 * 格式：ORD + YYYYMMDD + 4位随机字符
 * 示例：ORD20240115A3B2
 */
export function generateOrderNumber() {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD${dateStr}${randomStr}`;
}

/**
 * 验证订单号格式
 */
export function validateOrderNumber(orderNumber) {
  const pattern = /^ORD\d{8}[A-Z0-9]{4}$/;
  return pattern.test(orderNumber);
}

