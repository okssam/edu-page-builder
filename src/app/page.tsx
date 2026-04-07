'use client';

import { useEffect, useMemo, useState } from 'react';

type Locale = 'ko' | 'en';
type SourceCategory = 'chatgpt-gpts' | 'chatgpt-projects' | 'gemini-gems' | 'gemini-projects';

type LinkItem = {
  id: string;
  title: string;
  url: string;
  description: string;
  category: SourceCategory;
  pinned: boolean;
};

// 카테고리별 색상과 아이콘
const categoryMeta: Record<SourceCategory, { icon: string; bg: string; border: string; text: string }> = {
  'chatgpt-gpts': { icon: '🤖', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
  'chatgpt-projects': { icon: '💬', bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-700' },
  'gemini-gems': { icon: '💎', bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700' },
  'gemini-projects': { icon: '⚡', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
};

const labels = {
  ko: {
    pageTitle: '정옥선의 AI 워크스페이스',
    pageSubtitle: 'GPT, 프로젝트, Gems를 한곳에서 관리하세요',
    addNew: '+ 새 링크 추가',
    modalTitle: '새 링크 추가',
    linkLabel: '링크 주소',
    titleLabel: '표시 제목',
    descriptionLabel: '설명 (선택)',
    categoryLabel: '분류',
    autoTitle: '자동 가져오기',
    addButton: '추가하기',
    cancel: '취소',
    emptyTitle: '아직 등록된 링크가 없어요',
    emptyDesc: '위의 "새 링크 추가" 버튼으로 자주 쓰는 AI 도구를 등록해보세요.',
    pin: '고정',
    unpin: '고정 해제',
    delete: '삭제',
    open: '열기',
    all: '전체',
    lang: 'KO',
    categories: {
      'chatgpt-gpts': 'ChatGPT GPTs',
      'chatgpt-projects': 'ChatGPT 프로젝트',
      'gemini-gems': 'Gemini Gems',
      'gemini-projects': 'Gemini James',
    },
  },
  en: {
    pageTitle: "Okseon's AI Workspace",
    pageSubtitle: 'Manage GPTs, Projects, and Gems in one place',
    addNew: '+ Add new link',
    modalTitle: 'Add new link',
    linkLabel: 'Link URL',
    titleLabel: 'Display title',
    descriptionLabel: 'Description (optional)',
    categoryLabel: 'Category',
    autoTitle: 'Auto fetch',
    addButton: 'Add',
    cancel: 'Cancel',
    emptyTitle: 'No links yet',
    emptyDesc: 'Click "Add new link" to register your favorite AI tools.',
    pin: 'Pin',
    unpin: 'Unpin',
    delete: 'Delete',
    open: 'Open',
    all: 'All',
    lang: 'EN',
    categories: {
      'chatgpt-gpts': 'ChatGPT GPTs',
      'chatgpt-projects': 'ChatGPT Projects',
      'gemini-gems': 'Gemini Gems',
      'gemini-projects': 'Gemini James',
    },
  },
} as const;

const starterLinks: LinkItem[] = [
  {
    id: '1',
    title: '한미냥 운영 GPT',
    url: 'https://chat.openai.com/',
    description: '한미냥 운영 문구와 공지 초안 정리',
    category: 'chatgpt-gpts',
    pinned: true,
  },
  {
    id: '2',
    title: '교육 상세페이지',
    url: 'https://chat.openai.com/',
    description: '상세페이지 문안과 구성 초안',
    category: 'chatgpt-projects',
    pinned: false,
  },
  {
    id: '3',
    title: '업무 자동화 James',
    url: 'https://gemini.google.com/',
    description: '반복 업무 템플릿과 리서치',
    category: 'gemini-projects',
    pinned: false,
  },
];

const STORAGE_KEY = 'okj-ai-links-v2';
const LOCALE_KEY = 'okj-ai-locale-v2';

// URL에서 카테고리 자동 추론
function inferCategory(url: string): SourceCategory {
  const u = url.toLowerCase();
  if (u.includes('gemini.google.com/gem')) return 'gemini-gems';
  if (u.includes('gemini.google.com')) return 'gemini-projects';
  if (u.includes('chatgpt.com/g/g-') || u.includes('chat.openai.com/g/g-')) return 'chatgpt-gpts';
  if (u.includes('chatgpt.com') || u.includes('chat.openai.com')) return 'chatgpt-projects';
  return 'chatgpt-gpts';
}

// 메타데이터 가져오기
async function fetchMeta(url: string) {
  try {
    const res = await fetch(`/api/title?url=${encodeURIComponent(url)}`);
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    return { title: '', description: '' };
  }
}

export default function Home() {
  const [locale, setLocale] = useState<Locale>('ko');
  const [links, setLinks] = useState<LinkItem[]>(starterLinks);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<SourceCategory | 'all'>('all');
  const [contextMenu, setContextMenu] = useState<{ id: string; x: number; y: number } | null>(null);

  // 모달 폼 상태
  const [formUrl, setFormUrl] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCategory, setFormCategory] = useState<SourceCategory>('chatgpt-gpts');
  const [loading, setLoading] = useState(false);
  const [autoFetched, setAutoFetched] = useState(false);

  const text = labels[locale];

  // localStorage 로드
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      const storedLocale = window.localStorage.getItem(LOCALE_KEY);
      if (stored) setLinks(JSON.parse(stored));
      if (storedLocale === 'ko' || storedLocale === 'en') setLocale(storedLocale);
    } catch { /* 무시 */ }
  }, []);

  // localStorage 저장
  useEffect(() => { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(links)); }, [links]);
  useEffect(() => { window.localStorage.setItem(LOCALE_KEY, locale); }, [locale]);

  // 외부 클릭시 컨텍스트 메뉴 닫기
  useEffect(() => {
    const handler = () => setContextMenu(null);
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, []);

  // 필터 + 정렬 (고정 항목 먼저)
  const displayed = useMemo(() => {
    const filtered = filter === 'all' ? links : links.filter((l) => l.category === filter);
    const pinned = filtered.filter((l) => l.pinned);
    const normal = filtered.filter((l) => !l.pinned);
    return [...pinned, ...normal];
  }, [links, filter]);

  // URL 변경시 자동으로 메타데이터 가져오기
  async function autoFetchMeta(url: string) {
    if (!url.startsWith('http') || autoFetched) return;
    setAutoFetched(true);
    setLoading(true);
    const cat = inferCategory(url);
    setFormCategory(cat);
    const meta = await fetchMeta(url);
    if (meta.title) setFormTitle(meta.title.replace(/\s*\|.*$/, '').trim());
    if (meta.description) setFormDesc(meta.description);
    setLoading(false);
  }

  // 수동 자동 가져오기 버튼
  async function handleAutoFetch() {
    if (!formUrl) return;
    setLoading(true);
    const meta = await fetchMeta(formUrl);
    const cat = inferCategory(formUrl);
    if (meta.title) setFormTitle(meta.title.replace(/\s*\|.*$/, '').trim());
    if (meta.description) setFormDesc(meta.description);
    setFormCategory(cat);
    setLoading(false);
  }

  // 링크 추가
  async function handleAdd() {
    if (!formUrl.trim()) return;
    let title = formTitle.trim();
    let desc = formDesc.trim();

    if (!title) {
      setLoading(true);
      const meta = await fetchMeta(formUrl.trim());
      title = meta.title?.replace(/\s*\|.*$/, '').trim() || formUrl.trim();
      desc = desc || meta.description || '';
      setLoading(false);
    }

    const item: LinkItem = {
      id: Date.now().toString(),
      title,
      url: formUrl.trim(),
      description: desc,
      category: formCategory,
      pinned: false,
    };

    setLinks((prev) => [item, ...prev]);
    setFormUrl('');
    setFormTitle('');
    setFormDesc('');
    setFormCategory('chatgpt-gpts');
    setAutoFetched(false);
    setShowModal(false);
  }

  function togglePin(id: string) {
    setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, pinned: !l.pinned } : l)));
  }

  function deleteLink(id: string) {
    setLinks((prev) => prev.filter((l) => l.id !== id));
    setContextMenu(null);
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* 헤더 */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{text.pageTitle}</h1>
            <p className="mt-1 text-sm text-slate-500">{text.pageSubtitle}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLocale(locale === 'ko' ? 'en' : 'ko')}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
            >
              {locale === 'ko' ? 'EN' : 'KO'}
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              {text.addNew}
            </button>
          </div>
        </div>
      </header>

      {/* 카테고리 필터 탭 */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-6 py-2">
          <button
            onClick={() => setFilter('all')}
            className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition ${
              filter === 'all' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            {text.all}
          </button>
          {(Object.keys(categoryMeta) as SourceCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition ${
                filter === cat ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {categoryMeta[cat].icon} {text.categories[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* 카드 그리드 */}
      <div className="mx-auto max-w-6xl px-6 py-8">
        {displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="mb-4 text-5xl">🔗</div>
            <h2 className="text-lg font-semibold text-slate-700">{text.emptyTitle}</h2>
            <p className="mt-2 text-sm text-slate-500">{text.emptyDesc}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {displayed.map((item) => {
              const meta = categoryMeta[item.category];
              return (
                <button
                  key={item.id}
                  onClick={() => window.open(item.url, '_blank')}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setContextMenu({ id: item.id, x: e.clientX, y: e.clientY });
                  }}
                  className={`group relative flex aspect-square flex-col items-center justify-center rounded-2xl border-2 ${meta.border} ${meta.bg} p-4 text-center transition hover:-translate-y-1 hover:shadow-lg`}
                >
                  {/* 고정 표시 */}
                  {item.pinned && (
                    <span className="absolute right-2 top-2 text-sm">📌</span>
                  )}

                  {/* 카테고리 아이콘 */}
                  <span className="mb-3 text-3xl">{meta.icon}</span>

                  {/* 제목 */}
                  <h3 className="line-clamp-2 text-sm font-semibold text-slate-800">
                    {item.title}
                  </h3>

                  {/* 설명 */}
                  {item.description && (
                    <p className="mt-1.5 line-clamp-2 text-xs text-slate-500">
                      {item.description}
                    </p>
                  )}

                  {/* 카테고리 뱃지 */}
                  <span className={`mt-3 rounded-full px-2.5 py-0.5 text-[10px] font-medium ${meta.text} ${meta.bg} border ${meta.border}`}>
                    {text.categories[item.category]}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 컨텍스트 메뉴 (우클릭) */}
      {contextMenu && (
        <div
          className="fixed z-50 min-w-[140px] rounded-xl border border-slate-200 bg-white py-1 shadow-xl"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              const item = links.find((l) => l.id === contextMenu.id);
              if (item) window.open(item.url, '_blank');
              setContextMenu(null);
            }}
            className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
          >
            🔗 {text.open}
          </button>
          <button
            onClick={() => { togglePin(contextMenu.id); setContextMenu(null); }}
            className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
          >
            📌 {links.find((l) => l.id === contextMenu.id)?.pinned ? text.unpin : text.pin}
          </button>
          <div className="my-1 border-t border-slate-100" />
          <button
            onClick={() => deleteLink(contextMenu.id)}
            className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
          >
            🗑️ {text.delete}
          </button>
        </div>
      )}

      {/* 추가 모달 */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div
            className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-5 text-lg font-bold text-slate-900">{text.modalTitle}</h2>

            <div className="space-y-4">
              {/* URL 입력 */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">{text.linkLabel}</label>
                <div className="flex gap-2">
                  <input
                    value={formUrl}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormUrl(val);
                      if (val.startsWith('http')) {
                        setFormCategory(inferCategory(val));
                      }
                    }}
                    onPaste={(e) => {
                      // 붙여넣기 시 자동으로 메타데이터 가져오기
                      const pasted = e.clipboardData.getData('text');
                      if (pasted.startsWith('http')) {
                        setTimeout(() => autoFetchMeta(pasted), 100);
                      }
                    }}
                    placeholder="https://..."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                  />
                  <button
                    onClick={handleAutoFetch}
                    disabled={loading}
                    className="shrink-0 rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    {loading ? '...' : text.autoTitle}
                  </button>
                </div>
              </div>

              {/* 제목 */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">{text.titleLabel}</label>
                <input
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                />
              </div>

              {/* 설명 */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">{text.descriptionLabel}</label>
                <input
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                />
              </div>

              {/* 카테고리 */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">{text.categoryLabel}</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as SourceCategory)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                >
                  {(Object.keys(categoryMeta) as SourceCategory[]).map((cat) => (
                    <option key={cat} value={cat}>
                      {categoryMeta[cat].icon} {text.categories[cat]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 버튼 */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                {text.cancel}
              </button>
              <button
                onClick={handleAdd}
                disabled={loading}
                className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
              >
                {loading ? '...' : text.addButton}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
