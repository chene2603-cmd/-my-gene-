// 认知架构师交付：基因核心体 v1.2
// 状态：三态变异 + 跨项目继承

const RULES = {
  block_vague_requests: {
    status: 'observe',
    fn: (user, context) => {
      if (!context.budget || !context.timeline) {
        return { deny: true, reason: '请明确预算与上线时间', code: 403 };
      }
      if (context.input?.includes('做个类似抖音')) {
        return { deny: true, reason: '需求过于模糊，请细化', code: 403 };
      }
    }
  },
  day1to3: {
    status: 'enforce',
    fn: (user, action) => {
      if (user.days < 4 && ['generate_code', 'deploy', 'access_api'].includes(action)) {
        return { deny: true, reason: '试用前3天仅可查看与编辑需求', code: 403 };
      }
    }
  },
  day4to7: {
    status: 'enforce',
    fn: (user, action) => {
      if (user.days >= 4 && user.days <= 7 && action === 'deploy') {
        return { deny: true, reason: '部署需第8天或付费验证', code: 403 };
      }
    }
  },
  day8plus: {
    status: 'enforce',
    fn: (user, action) => {
      if (user.days >= 8 && action === 'deploy' && user.tier !== 'paid') {
        return { 
          deny: true, 
          paywall: { personal: 9.9, team: 49 }, 
          reason: '请升级以部署', 
          code: 402 
        };
      }
    }
  },
  device_limit: {
    status: 'enforce',
    fn: (user) => {
      if (user.device_attempts > 3) {
        return { deny: true, reason: '该设备今日尝试次数超限', code: 429 };
      }
    }
  },
  enterprise_redirect: {
    status: 'enforce',
    fn: (user, action, context) => {
      if (context.input?.match(/团队|公司|合规|SLA/)) {
        return { 
          deny: true, 
          reason: '企业级需求请直接联系架构师', 
          code: 403 
        };
      }
    }
  },
  _placeholder: {
    status: 'retired',
    fn: () => null
  }
};

export function evaluate(user, action, context = {}) {
  for (let [name, rule] of Object.entries(RULES)) {
    if (rule.status === 'retired') continue;
    const result = rule.fn(user, action, context);
    if (!result) continue;
    if (rule.status === 'observe') {
      console.log(`🧬 [OBSERVE] ${name} 本应拦截:`, result.reason);
      continue;
    }
    if (rule.status === 'enforce') {
      return { ...result, rule: name };
    }
  }
  return { allow: true };
}

export const VERSION = '1.1.2';
export const LAST_UPDATED = '2026-02-16';
