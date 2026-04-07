const templates = [
  {
    name: "교육 신청",
    description: "커리큘럼, 강사 소개, 신청 버튼이 들어가는 교육용 템플릿",
  },
  {
    name: "협회원 모집",
    description: "가입 혜택, 활동 소개, 협회 비전을 담는 모집용 템플릿",
  },
  {
    name: "세미나 · 행사",
    description: "행사 개요, 연사, 시간표, 장소 안내를 담는 홍보용 템플릿",
  },
];

export default function NewPagePage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto max-w-5xl px-6 py-14 lg:px-8">
        <div className="max-w-3xl space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            New Page
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            새 상세페이지 만들기
          </h1>
          <p className="text-slate-600">
            MVP에서는 템플릿을 고르고 핵심 정보만 입력하면 상세페이지 초안을 빠르게 만들 수 있게
            설계합니다.
          </p>
        </div>

        <section className="mt-10 grid gap-5 md:grid-cols-3">
          {templates.map((template) => (
            <article
              key={template.name}
              className="rounded-3xl border border-slate-200 bg-slate-50 p-6"
            >
              <h2 className="text-xl font-semibold text-slate-950">{template.name}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{template.description}</p>
              <button className="mt-6 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
                이 템플릿 선택
              </button>
            </article>
          ))}
        </section>

        <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">입력 폼 초안</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">페이지 제목</span>
              <input
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500"
                placeholder="예: AI 실무 활용 교육 4월 과정"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">슬러그</span>
              <input
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500"
                placeholder="ai-course-april"
              />
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-medium text-slate-700">한 줄 소개</span>
              <input
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500"
                placeholder="실무에 바로 적용하는 생성형 AI 교육 프로그램"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">일정</span>
              <input
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500"
                placeholder="2026년 4월 15일 오후 2시"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">장소</span>
              <input
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500"
                placeholder="강남 상록회관 / Zoom"
              />
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-medium text-slate-700">상세 설명</span>
              <textarea
                className="min-h-40 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500"
                placeholder="교육 소개, 대상, 기대 효과 등을 입력"
              />
            </label>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
              초안 저장
            </button>
            <button className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
              미리보기
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
