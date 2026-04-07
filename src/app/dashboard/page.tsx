const pages = [
  {
    title: "AI 실무 활용 교육 4월 과정",
    type: "교육 신청",
    status: "발행됨",
    updatedAt: "2026.03.30",
  },
  {
    title: "한국미래AI협회 협회원 모집",
    type: "협회원 모집",
    status: "초안",
    updatedAt: "2026.03.29",
  },
  {
    title: "챗GPT 세미나 신청 페이지",
    type: "세미나 · 행사",
    status: "초안",
    updatedAt: "2026.03.28",
  },
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-6 py-14 lg:px-8">
        <div className="flex flex-col gap-5 border-b border-slate-200 pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              Dashboard
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">내 상세페이지</h1>
            <p className="mt-3 text-slate-600">
              교육, 모집, 행사 페이지를 한 곳에서 관리하고 발행 상태를 확인합니다.
            </p>
          </div>
          <a
            href="/pages/new"
            className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            새 페이지 만들기
          </a>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">전체 페이지</p>
            <p className="mt-2 text-3xl font-bold text-slate-950">3</p>
          </section>
          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">발행됨</p>
            <p className="mt-2 text-3xl font-bold text-slate-950">1</p>
          </section>
          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">초안</p>
            <p className="mt-2 text-3xl font-bold text-slate-950">2</p>
          </section>
        </div>

        <section className="mt-8 rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-950">페이지 목록</h2>
          </div>
          <div className="divide-y divide-slate-200">
            {pages.map((page) => (
              <article
                key={page.title}
                className="flex flex-col gap-3 px-6 py-5 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <h3 className="text-lg font-semibold text-slate-950">{page.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {page.type} · 최근 수정 {page.updatedAt}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      page.status === "발행됨"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {page.status}
                  </span>
                  <a
                    href="/pages/new"
                    className="text-sm font-semibold text-slate-700 underline-offset-4 hover:underline"
                  >
                    열기
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
