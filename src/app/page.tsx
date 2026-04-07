'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type Locale = 'ko' | 'en';
type SourceCategory = 'chatgpt-gpts' | 'chatgpt-projects' | 'gemini-gems';

type LinkItem = {
  id: string;
  title: string;
  url: string;
  description: string;
  category: SourceCategory;
  pinned: boolean;
  colorIdx: number;
};

// 카드 배경색 팔레트
const cardColors = [
  { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
  { bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-700' },
  { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700' },
  { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700' },
  { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
  { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700' },
];

// 카테고리 아이콘
const categoryIcons: Record<SourceCategory, string> = {
  'chatgpt-gpts': '🤖',
  'chatgpt-projects': '💬',
  'gemini-gems': '💎',
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
    addButton: '추가하기',
    cancel: '취소',
    emptyTitle: '아직 등록된 링크가 없어요',
    emptyDesc: '위의 "새 링크 추가" 버튼으로 자주 쓰는 AI 도구를 등록해보세요.',
    all: '전체',
    categories: {
      'chatgpt-gpts': 'ChatGPT GPTs',
      'chatgpt-projects': 'ChatGPT 프로젝트',
      'gemini-gems': 'Gemini Gems',
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
    addButton: 'Add',
    cancel: 'Cancel',
    emptyTitle: 'No links yet',
    emptyDesc: 'Click "Add new link" to register your favorite AI tools.',
    all: 'All',
    categories: {
      'chatgpt-gpts': 'ChatGPT GPTs',
      'chatgpt-projects': 'ChatGPT Projects',
      'gemini-gems': 'Gemini Gems',
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
    colorIdx: 0,
  },
  {
    id: '2',
    title: '교육 상세페이지',
    url: 'https://chat.openai.com/',
    description: '상세페이지 문안과 구성 초안',
    category: 'chatgpt-projects',
    pinned: false,
    colorIdx: 1,
  },
];

const STORAGE_KEY = 'okj-ai-links-v4';
const LOCALE_KEY = 'okj-ai-locale-v4';

export default function Home() {
  const [locale, setLocale] = useState<Locale>('ko');
  const [links, setLinks] = useState<LinkItem[]>(starterLinks);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<SourceCategory | 'all'>('all');

  // 드래그 앤 드롭 상태
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const didDrag = useRef(false);

  // 모달 폼 상태
  const [formUrl, setFormUrl] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCategory, setFormCategory] = useState<SourceCategory>('chatgpt-gpts');

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

  // 필터 + 정렬 (고정 항목 먼저)
  const displayed = useMemo(() => {
    const filtered = filter === 'all' ? links : links.filter((l) => l.category === filter);
    const pinned = filtered.filter((l) => l.pinned);
    const normal = filtered.filter((l) => !l.pinned);
    return [...pinned, ...normal];
  }, [links, filter]);

  // 링크 추가
  function handleAdd() {
    if (!formUrl.trim() || !formTitle.trim()) return;

    const item: LinkItem = {
      id: Date.now().toString(),
      title: formTitle.trim(),
      url: formUrl.trim(),
      description: formDesc.trim(),
      category: formCategory,
      pinned: false,
      colorIdx: links.length % cardColors.length,
    };

    setLinks((prev) => [item, ...prev]);
    setFormUrl('');
    setFormTitle('');
    setFormDesc('');
    setFormCategory('chatgpt-gpts');
    setShowModal(false);
  }

  // 드래그로 카드 순서 변경
  function handleDrop(targetId: string) {
    if (!draggingId || draggingId === targetId) return;
    setLinks((prev) => {
      const next = [...prev];
      const fromIdx = next.findIndex((l) => l.id === draggingId);
      const toIdx = next.findIndex((l) => l.id === targetId);
      if (fromIdx === -1 || toIdx === -1) return prev;
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next;
    });
    setDraggingId(null);
    setDragOverId(null);
  }

  function togglePin(id: string) {
    setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, pinned: !l.pinned } : l)));
  }

  function cycleColor(id: string) {
    setLinks((prev) => prev.map((l) => {
      if (l.id !== id) return l;
      return { ...l, colorIdx: (l.colorIdx + 1) % cardColors.length };
    }));
  }

  function deleteLink(id: string) {
    setLinks((prev) => prev.filter((l) => l.id !== id));
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
          {(Object.keys(categoryIcons) as SourceCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition ${
                filter === cat ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {categoryIcons[cat]} {text.categories[cat]}
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
              const color = cardColors[item.colorIdx] || cardColors[0];
              const isDragOver = dragOverId === item.id && draggingId !== item.id;
              return (
                <div
                  key={item.id}
                  draggable
                  onDragStart={() => { setDraggingId(item.id); didDrag.current = true; }}
                  onDragEnd={() => { setDraggingId(null); setDragOverId(null); setTimeout(() => { didDrag.current = false; }, 0); }}
                  onDragOver={(e) => { e.preventDefault(); setDragOverId(item.id); }}
                  onDragLeave={() => setDragOverId(null)}
                  onDrop={(e) => { e.preventDefault(); handleDrop(item.id); }}
                  className={`group relative flex aspect-square cursor-grab flex-col rounded-2xl border-2 p-4 transition active:cursor-grabbing ${
                    draggingId === item.id
                      ? 'opacity-40 scale-95'
                      : isDragOver
                        ? `${color.bg} ${color.border} -translate-y-1 shadow-lg ring-2 ring-slate-400`
                        : `${color.bg} ${color.border} hover:shadow-md`
                  }`}
                >
                  {/* 상단: 핀 표시 + 액션 버튼들 */}
                  <div className="flex items-start justify-between">
                    <span className="text-2xl">{categoryIcons[item.category]}</span>
                    <div className="flex items-center gap-1">
                      {item.pinned && <span className="text-xs">📌</span>}
                    </div>
                  </div>

                  {/* 중앙: 제목 + 설명 (클릭하면 URL 열기) */}
                  <div
                    className="mt-2 flex-1 cursor-pointer"
                    onClick={() => { if (!didDrag.current) window.open(item.url, '_blank'); }}
                  >
                    <h3 className="line-clamp-2 text-sm font-semibold text-slate-800">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* 하단: 액션 버튼 바 */}
                  <div className="mt-2 flex items-center justify-between border-t border-slate-200/60 pt-2">
                    <span className={`text-[10px] font-medium ${color.text}`}>
                      {text.categories[item.category]}
                    </span>
                    <div className="flex gap-0.5">
                      {/* 핀 고정/해제 */}
                      <button
                        onClick={(e) => { e.stopPropagation(); togglePin(item.id); }}
                        className={`rounded-md p-1.5 text-xs transition hover:bg-white/80 ${item.pinned ? 'text-amber-600' : 'text-slate-400'}`}
                        title={item.pinned ? '고정 해제' : '고정'}
                      >
                        📌
                      </button>
                      {/* 색 변경 */}
                      <button
                        onClick={(e) => { e.stopPropagation(); cycleColor(item.id); }}
                        className="rounded-md p-1.5 text-xs text-slate-400 transition hover:bg-white/80"
                        title="색 바꾸기"
                      >
                        🎨
                      </button>
                      {/* 삭제 */}
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteLink(item.id); }}
                        className="rounded-md p-1.5 text-xs text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                        title="삭제"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 추가 모달 */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div
            className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-5 text-lg font-bold text-slate-900">{text.modalTitle}</h2>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">{text.linkLabel}</label>
                <input
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">{text.titleLabel}</label>
                <input
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">{text.descriptionLabel}</label>
                <input
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">{text.categoryLabel}</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as SourceCategory)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                >
                  {(Object.keys(categoryIcons) as SourceCategory[]).map((cat) => (
                    <option key={cat} value={cat}>
                      {categoryIcons[cat]} {text.categories[cat]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                {text.cancel}
              </button>
              <button
                onClick={handleAdd}
                className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                {text.addButton}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
