import React, { createContext, useContext, useState, useEffect } from 'react';

const LANGS = {
  vi: {
    flag: '🇻🇳',
    label: 'VI',
    sb_sub: 'Hội viên doanh nghiệp',
    search_placeholder: 'Tìm kiếm...',
    menu_manage: 'Quản lý',
    menu_dashboard: 'Tổng quan',
    menu_members: 'Hội viên',
    menu_posts: 'Bài viết',
    menu_register: 'Đăng ký',
    menu_admin: 'Duyệt hội viên',
    menu_ai: 'Trợ lý AI',
    menu_system: 'Hệ thống',
    menu_settings: 'Cài đặt AI',
    lang_label: 'NGÔN NGỮ',
    stat_total_members: 'Tổng hội viên',
    stat_active: 'đang hoạt động',
    stat_pending: 'Chờ duyệt',
    stat_need_action: 'cần xử lý',
    stat_posts: 'Bài viết tháng này',
    stat_published: 'đã xuất bản',
    stat_events: 'Sự kiện sắp tới',
    stat_this_month: 'trong tháng này',
    section_new_members: 'Hội viên mới đăng ký',
    section_pending_posts: 'Bài chờ duyệt',
    btn_add: 'Thêm mới',
    notify_lang_switch: (n) => `Đã chuyển sang ${n}`
  },
  en: {
    flag: '🇺🇸',
    label: 'EN',
    sb_sub: 'Member Management',
    search_placeholder: 'Search...',
    menu_manage: 'Management',
    menu_dashboard: 'Dashboard',
    menu_members: 'Members',
    menu_posts: 'Posts',
    menu_register: 'Register',
    menu_admin: 'Approve Members',
    menu_ai: 'AI Assistant',
    menu_system: 'System',
    menu_settings: 'AI Settings',
    lang_label: 'LANGUAGE',
    stat_total_members: 'Total members',
    stat_active: 'active',
    stat_pending: 'Pending',
    stat_need_action: 'need review',
    stat_posts: 'Posts this month',
    stat_published: 'published',
    stat_events: 'Upcoming events',
    stat_this_month: 'this month',
    section_new_members: 'New registrations',
    section_pending_posts: 'Posts awaiting review',
    btn_add: 'Add new',
    notify_lang_switch: (n) => `Switched to ${n}`
  },
  zh: {
    flag: '🇨🇳',
    label: 'ZH',
    sb_sub: '会员管理',
    search_placeholder: '搜索...',
    menu_manage: '管理',
    menu_dashboard: '总览',
    menu_members: '会员',
    menu_posts: '文章',
    menu_register: '注册',
    menu_admin: '审核会员',
    menu_ai: 'AI助手',
    menu_system: '系统',
    menu_settings: 'AI设置',
    lang_label: '语言',
    stat_total_members: '总会员数',
    stat_active: '活跃',
    stat_pending: '待审核',
    stat_need_action: '需处理',
    stat_posts: '本月文章',
    stat_published: '已发布',
    stat_events: '即将举办',
    stat_this_month: '本月',
    section_new_members: '新注册会员',
    section_pending_posts: '待审文章',
    btn_add: '新增',
    notify_lang_switch: (n) => `已切换到${n}`
  },
  ja: {
    flag: '🇯🇵',
    label: 'JA',
    sb_sub: '会員管理',
    search_placeholder: '検索...',
    menu_manage: '管理',
    menu_dashboard: 'ダッシュボード',
    menu_members: '会員',
    menu_posts: '投稿',
    menu_register: '登録',
    menu_admin: '会員承認',
    menu_ai: 'AIアシスタント',
    menu_system: 'システム',
    menu_settings: 'AI設定',
    lang_label: '言語',
    stat_total_members: '総会員数',
    stat_active: 'アクティブ',
    stat_pending: '承認待ち',
    stat_need_action: '要対応',
    stat_posts: '今月の投稿',
    stat_published: '公開済み',
    stat_events: '今後のイベント',
    stat_this_month: '今月',
    section_new_members: '新規会員',
    section_pending_posts: '承認待ち記事',
    btn_add: '新規追加',
    notify_lang_switch: (n) => `${n}に切り替えました`
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [currentLang, setCurrentLang] = useState(() => {
    return localStorage.getItem('bizhub_lang') || 'vi';
  });

  const t = (key) => {
    const langObj = LANGS[currentLang] || LANGS.vi;
    const value = langObj[key] || LANGS.vi[key];
    if (typeof value === 'function') return value;
    return value || key;
  };

  const changeLang = (lang) => {
    if (LANGS[lang]) {
      setCurrentLang(lang);
      localStorage.setItem('bizhub_lang', lang);
    }
  };

  const getLangDetails = () => LANGS[currentLang] || LANGS.vi;

  return (
    <LanguageContext.Provider value={{ currentLang, t, changeLang, getLangDetails, LANGS }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => useContext(LanguageContext);
