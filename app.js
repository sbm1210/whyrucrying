(function (global) {
  const STORAGE_KEY = "whyrucrying.v1";

  const UI_COPY = {
    eyebrow: "Why R U crying?",
    reset: "또 운다",
    title: "왜 우냐",
    complete: "그쳤다!!!!",
    memoPlaceholder: "예: 기저귀 확인 후에도 계속 울었고, 안아서 조용한 곳에 가니 조금 진정됨",
  };

  const ATTEMPTS = [
    {
      id: "diaper",
      label: "기저귀가 불편하니?",
      hint: "젖었거나 대변을 봤는지, 엉덩이가 불편해 보이는지 확인해요.",
    },
    {
      id: "hot",
      label: "덥니?",
      hint: "목덜미와 등을 만져 보고, 옷이나 이불이 너무 두껍지 않은지 확인해요.",
    },
    {
      id: "cold",
      label: "춥니?",
      hint: "손발이 차가운지, 실내 온도와 옷차림이 괜찮은지 확인해요.",
    },
    {
      id: "clothes",
      label: "옷이 불편하니?",
      hint: "허리밴드, 양말, 옷 태그, 단추, 지퍼가 조이거나 찌르지 않는지 확인해요.",
    },
    {
      id: "position",
      label: "자세가 불편하니?",
      hint: "눕거나 안긴 자세를 바꿔 보고, 목이나 몸이 불편하게 꺾이지 않았는지 살펴봐요.",
    },
    {
      id: "hungry",
      label: "배고프니?",
      hint: "마지막 수유나 식사 시간과 양을 떠올려 보고, 먹고 싶어 하는 신호가 있는지 확인해요.",
    },
    {
      id: "burp",
      label: "트림하고 싶니?",
      hint: "최근에 먹었다면 세워 안고 등을 부드럽게 토닥여 봐요.",
    },
    {
      id: "gas",
      label: "배에 가스가 찼니?",
      hint: "배가 빵빵한지 보고, 다리를 천천히 움직이거나 배를 부드럽게 마사지해요.",
    },
    {
      id: "hold",
      label: "안기고 싶니?",
      hint: "가까이 안아 주고 작게 말을 걸었을 때 진정되는지 확인해요.",
    },
    {
      id: "noise",
      label: "시끄러워서 힘드니?",
      hint: "TV, 대화 소리, 생활 소음이 큰지 보고 조용한 곳으로 옮겨 봐요.",
    },
    {
      id: "light",
      label: "빛이 너무 밝니?",
      hint: "조명을 낮추거나 커튼을 쳐서 눈부시지 않은 환경을 만들어 봐요.",
    },
    {
      id: "sleepy",
      label: "졸리니?",
      hint: "마지막 낮잠이나 밤잠 시간을 떠올려 보고, 졸린 신호가 있었는지 확인해요.",
    },
    {
      id: "overtired",
      label: "너무 피곤하니?",
      hint: "오래 깨어 있었거나 자극이 많았다면, 조용하고 어두운 환경에서 쉬게 해요.",
    },
    {
      id: "unfamiliar",
      label: "낯설어서 불안하니?",
      hint: "낯선 장소, 낯선 사람, 갑작스러운 변화가 있었는지 떠올려 봐요.",
    },
    {
      id: "startled",
      label: "놀랐니?",
      hint: "큰 소리, 갑작스러운 움직임, 낯선 상황 이후 울기 시작했는지 확인해요.",
    },
    {
      id: "want",
      label: "원하는 게 있니?",
      hint: "장난감, 음식, 이동, 놀이 중단처럼 아이가 원하던 것이 있었는지 살펴봐요.",
    },
    {
      id: "gums",
      label: "잇몸이 불편하니?",
      hint: "침을 많이 흘리거나 손을 입에 넣는지, 잇몸이 예민해 보이는지 확인해요.",
    },
    {
      id: "skin",
      label: "피부가 불편하니?",
      hint: "발진, 땀띠, 벌레 물림, 옷에 쓸린 자국이 있는지 살펴봐요.",
    },
    {
      id: "pain",
      label: "어딘가 아프니?",
      hint: "특정 부위를 만지면 더 우는지, 평소와 다른 자세나 움직임이 있는지 확인해요.",
    },
    {
      id: "stuck",
      label: "어디 끼거나 감긴 게 있니?",
      hint: "머리카락이 손가락이나 발가락에 감겼는지, 작은 상처나 끼임이 없는지 살펴봐요.",
    },
  ];

  function createSession(now = Date.now()) {
    return {
      id: String(now),
      startedAt: now,
      attempts: ATTEMPTS.map((item) => ({
        id: item.id,
        label: item.label,
        hint: item.hint,
        checked: false,
      })),
      memo: "",
    };
  }

  function normalizeSession(session) {
    const templateIds = ATTEMPTS.map((item) => item.id).join("|");
    const sessionIds = Array.isArray(session && session.attempts)
      ? session.attempts.map((item) => item.id).join("|")
      : "";

    if (sessionIds === templateIds) {
      return session;
    }

    return {
      ...createSession(session && session.startedAt ? session.startedAt : Date.now()),
      memo: session && session.memo ? session.memo : "",
    };
  }

  function toggleAttempt(session, id) {
    return {
      ...session,
      attempts: session.attempts.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      ),
    };
  }

  function setMemo(session, memo) {
    return { ...session, memo };
  }

  function getProgress(session) {
    const total = session.attempts.length;
    const done = session.attempts.filter((item) => item.checked).length;
    return {
      done,
      total,
      percent: total ? Math.round((done / total) * 100) : 0,
    };
  }

  function completeSession(session, options = {}) {
    const endedAt = options.endedAt || Date.now();
    const startedAt = options.startedAt || session.startedAt || endedAt;
    return {
      id: `${endedAt}-${Math.random().toString(36).slice(2, 8)}`,
      startedAt,
      endedAt,
      durationMinutes: Math.max(0, Math.round((endedAt - startedAt) / 60000)),
      memo: options.memo !== undefined ? options.memo : session.memo || "",
      checkedAttempts: session.attempts
        .filter((item) => item.checked)
        .map((item) => item.label),
    };
  }

  function safeRead() {
    try {
      const raw = global.localStorage && global.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.history)) return null;
      return parsed;
    } catch (error) {
      return null;
    }
  }

  function safeWrite(state) {
    try {
      global.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch (error) {
      return false;
    }
  }

  function formatClock(value) {
    return new Intl.DateTimeFormat("ko-KR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  }

  function formatDuration(minutes) {
    if (minutes < 1) return "1분 미만";
    if (minutes < 60) return `${minutes}분`;
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return rest ? `${hours}시간 ${rest}분` : `${hours}시간`;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function initApp() {
    const root = document.querySelector("#app");
    if (!root) return;

    let state =
      safeRead() || {
        session: createSession(),
        history: [],
        storageOk: true,
      };

    state.session = normalizeSession(state.session);

    function commit(next) {
      state = next;
      state.storageOk = safeWrite({
        session: state.session,
        history: state.history,
      });
      render();
    }

    function renderAttempts() {
      return state.session.attempts
        .map(
          (item) => `
            <button class="attempt ${item.checked ? "is-checked" : ""}" data-toggle="${item.id}">
              <span class="attempt-check" aria-hidden="true">${item.checked ? "✓" : ""}</span>
              <span class="attempt-copy">
                <strong>${escapeHtml(item.label)}</strong>
                <small>${escapeHtml(item.hint)}</small>
              </span>
            </button>
          `
        )
        .join("");
    }

    function renderHistory() {
      if (!state.history.length) {
        return `<div class="empty">아직 저장된 울음 이력이 없어요.</div>`;
      }

      return state.history
        .map(
          (entry) => `
            <article class="history-item">
              <div class="history-top">
                <div>
                  <strong>${formatClock(entry.endedAt)}</strong>
                  <span>${formatDuration(entry.durationMinutes)} 후 진정</span>
                </div>
                <button class="icon-btn" data-delete="${entry.id}" aria-label="이력 삭제">×</button>
              </div>
              <div class="history-tags">
                ${
                  entry.checkedAttempts.length
                    ? entry.checkedAttempts
                        .map((label) => `<span>${escapeHtml(label)}</span>`)
                        .join("")
                    : "<em>체크한 항목 없음</em>"
                }
              </div>
              ${
                entry.memo
                  ? `<p class="history-memo">${escapeHtml(entry.memo)}</p>`
                  : ""
              }
            </article>
          `
        )
        .join("");
    }

    function render() {
      const progress = getProgress(state.session);
      const started = formatClock(state.session.startedAt);

      root.innerHTML = `
        <div class="shell">
          <header class="app-head">
            <div>
              <p class="eyebrow">${UI_COPY.eyebrow}</p>
              <h1>${UI_COPY.title}</h1>
              <span class="started">시작 ${started}</span>
            </div>
            <button class="reset-btn" data-reset>${UI_COPY.reset}</button>
          </header>

          ${
            state.storageOk === false
              ? `<div class="warn">이 브라우저에서 저장이 막혀 있어요. 홈 화면에 추가한 앱이나 일반 탭에서 다시 열어 보세요.</div>`
              : ""
          }

          <section class="progress-panel" aria-label="체크 진행률">
            <div class="progress-meta">
              <strong>${progress.done}/${progress.total}</strong>
              <span>${progress.percent}% 체크</span>
            </div>
            <div class="bar"><span style="width:${progress.percent}%"></span></div>
          </section>

          <main class="attempt-list">
            ${renderAttempts()}
          </main>

          <section class="memo-panel">
            <label for="memo">메모</label>
            <textarea id="memo" rows="4" placeholder="${UI_COPY.memoPlaceholder}">${escapeHtml(
              state.session.memo || ""
            )}</textarea>
          </section>

          <div class="primary-actions">
            <button class="secondary" data-export>백업 코드</button>
            <button class="primary" data-complete>${UI_COPY.complete}</button>
          </div>

          <section class="care-note">
            <strong>바로 도움을 받아야 할 때</strong>
            <p>숨쉬기 힘들어 보이거나, 입술이 파랗거나, 고열/축 처짐/평소와 다른 울음이 있으면 체크리스트보다 의료진 연락이 먼저입니다.</p>
          </section>

          <section class="history">
            <div class="section-head">
              <h2>이력</h2>
              <span>${state.history.length}개</span>
            </div>
            ${renderHistory()}
          </section>
        </div>

        <dialog id="backupDialog" class="backup-dialog">
          <form method="dialog">
            <div class="dialog-head">
              <strong>백업 / 가져오기</strong>
              <button class="icon-btn" value="cancel" aria-label="닫기">×</button>
            </div>
            <p>아래 코드를 복사해 두면 다른 브라우저에서 이력을 옮길 수 있어요.</p>
            <textarea id="backupText" rows="5"></textarea>
            <div class="dialog-actions">
              <button value="cancel">닫기</button>
              <button id="importBtn" value="default">가져오기</button>
            </div>
          </form>
        </dialog>
      `;

      const memo = root.querySelector("#memo");
      memo.addEventListener("input", (event) => {
        state.session = setMemo(state.session, event.target.value);
        safeWrite({ session: state.session, history: state.history });
      });
    }

    root.addEventListener("click", (event) => {
      const toggle = event.target.closest("[data-toggle]");
      if (toggle) {
        commit({
          ...state,
          session: toggleAttempt(state.session, toggle.dataset.toggle),
        });
        return;
      }

      if (event.target.closest("[data-reset]")) {
        commit({ ...state, session: createSession() });
        return;
      }

      if (event.target.closest("[data-complete]")) {
        const entry = completeSession(state.session);
        commit({
          ...state,
          session: createSession(),
          history: [entry, ...state.history].slice(0, 100),
        });
        return;
      }

      const del = event.target.closest("[data-delete]");
      if (del) {
        commit({
          ...state,
          history: state.history.filter((entry) => entry.id !== del.dataset.delete),
        });
        return;
      }

      if (event.target.closest("[data-export]")) {
        const dialog = root.querySelector("#backupDialog");
        const text = root.querySelector("#backupText");
        text.value = btoa(
          unescape(
            encodeURIComponent(
              JSON.stringify({
                session: state.session,
                history: state.history,
              })
            )
          )
        );
        dialog.showModal();
        text.focus();
        text.select();
      }
    });

    root.addEventListener("click", (event) => {
      if (event.target.id !== "importBtn") return;
      event.preventDefault();
      const text = root.querySelector("#backupText").value.trim();
      try {
        const imported = JSON.parse(decodeURIComponent(escape(atob(text))));
        if (!Array.isArray(imported.history) || !imported.session) {
          throw new Error("Invalid backup");
        }
        root.querySelector("#backupDialog").close();
        commit({
          ...state,
          session: imported.session,
          history: imported.history,
        });
      } catch (error) {
        alert("백업 코드가 올바르지 않아요.");
      }
    });

    render();
  }

  const api = {
    ATTEMPTS,
    UI_COPY,
    createSession,
    normalizeSession,
    toggleAttempt,
    setMemo,
    getProgress,
    completeSession,
    initApp,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  global.CryTracker = api;

  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", initApp);
  }
})(typeof window !== "undefined" ? window : globalThis);
