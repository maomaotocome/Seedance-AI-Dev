import { envConfigs } from '..';

export const localeNames: any = {
  en: 'English',
  zh: '中文',
};

export const locales = ['en', 'zh'];

export const defaultLocale = envConfigs.locale;

export const localePrefix = 'as-needed';

export const localeDetection = false;

export const localeMessagesRootPath = '@/config/locale/messages';

export const localeMessagesPaths = [
  'common',
  'landing',
  'settings/sidebar',
  'settings/profile',
  'settings/security',
  'settings/billing',
  'settings/payments',
  'settings/credits',
  'settings/apikeys',
  'admin/sidebar',
  'admin/dashboard',
  'admin/feedbacks',
  'admin/users',
  'admin/roles',
  'admin/permissions',
  'admin/categories',
  'admin/posts',
  'admin/payments',
  'admin/subscriptions',
  'admin/credits',
  'admin/settings',
  'admin/apikeys',
  'admin/ai-tasks',
  'admin/chats',
  'ai/music',
  'ai/chat',
  'ai/image',
  'ai/video',
  'activity/sidebar',
  'activity/ai-tasks',
  'activity/chats',
  'pages/index',
  'pages/pricing',
  'pages/blog',
  'video',
  'pages/seedance-2-5-free',
  'pages/seedance-2-0',
  'pages/seedance-2-5-vs-2-0',
  'pages/seedance-2-5-prompt-guide',
  'pages/seedance-2-5-api',
  'pages/unlimited-seedance-2-5',
  'pages/what-is-seedance',
  'pages/seedance-3-0',
  'pages/kling-3-0-ai-video-generator',
  'pages/wan-2-7-video-generator',
  'pages/minimax-h3-video-generator',
  'pages/grok-imagine-video-1-5',
];
