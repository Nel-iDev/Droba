(function () {
  'use strict';

  const {
    createApp,
    ref,
    reactive,
    computed,
    onMounted,
    onUnmounted,
    nextTick
  } = Vue;

  const DATA = window.BEND_DATA;
  const stretches = DATA.stretches;
  const routines = DATA.routines;
  const levels = DATA.levels;
  const tips = DATA.tips;
  const routineMap = routines.reduce(function (map, routine) {
    map[routine.id] = routine;
    return map;
  }, {});
  const stretchMap = stretches;

  const STORAGE_KEY = 'bend.state.v1';
  const TIMER_CIRCUMFERENCE = 2 * Math.PI * 62;

  function defaultState() {
    return {
      sessions: [],
      sound: true,
      dailyGoal: DATA.dailyGoalMinutes,
      createdAt: new Date().toISOString()
    };
  }

  function loadState() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (!raw || typeof raw !== 'object') return defaultState();
      const state = Object.assign(defaultState(), raw);
      state.sessions = Array.isArray(raw.sessions)
        ? raw.sessions
            .filter(function (session) {
              return session &&
                typeof session.seconds === 'number' &&
                session.seconds > 0 &&
                typeof session.date === 'string';
            })
            .map(function (session) {
              return Object.assign({
                id: String(session.timestamp || Date.now()),
                routineId: 'desconhecida',
                routineTitle: 'Alongamento',
                exercises: 0,
                completed: false
              }, session, {
                timestamp: Number(session.timestamp) || Date.parse(session.date + 'T12:00:00') || Date.now()
              });
            })
            .slice(-500)
        : [];
      state.sound = typeof raw.sound === 'boolean' ? raw.sound : true;
      state.dailyGoal = Number.isFinite(raw.dailyGoal) && raw.dailyGoal > 0
        ? raw.dailyGoal
        : DATA.dailyGoalMinutes;
      return state;
    } catch (error) {
      return defaultState();
    }
  }

  function dateKey(date) {
    const value = date || new Date();
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
  }

  function addDays(date, amount) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
  }

  function dayDifference(later, earlier) {
    return Math.round(
      (Date.parse(later + 'T12:00:00Z') - Date.parse(earlier + 'T12:00:00Z')) / 86400000
    );
  }

  function capitalize(text) {
    return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
  }

  const app = createApp({
    setup() {
      const state = reactive(loadState());

      const view = ref('home');
      const activeRoutine = ref(null);
      const activeFilter = ref('todas');
      const lastRoutine = ref(null);
      const deferredPrompt = ref(null);
      const canInstall = ref(false);
      const isStandalone = ref(false);
      const isIOS = ref(false);
      const showExitConfirm = ref(false);
      const showResetConfirm = ref(false);
      const showInstallHelp = ref(false);
      const toast = ref('');
      let toastTimer = null;
      let resumeAfterExit = false;
      let wakeLock = null;
      let timerHandle = null;
      let audioCtx = null;

      const summary = ref({
        routineTitle: '',
        minutes: 0,
        exercises: 0,
        xp: 0,
        streak: 0,
        levelUp: false
      });

      const player = reactive({
        routine: null,
        index: 0,
        remainingMs: 0,
        exerciseDurationMs: 0,
        running: false,
        startedAt: 0,
        accumulatedMs: 0,
        sessionSeconds: 0,
        completedCount: 0,
        recorded: false,
        threeBeeped: false
      });

      const filters = [
        { value: 'todas', label: 'Todas' },
        { value: 'Manhã', label: 'Manhã' },
        { value: 'Corrida', label: 'Corrida' },
        { value: 'Recuperação', label: 'Recuperação' },
        { value: 'Completo', label: 'Completo' },
        { value: 'Noite', label: 'Noite' }
      ];

      function saveState() {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (error) {
          showToast('Não foi possível salvar os dados');
        }
      }

      function showToast(message) {
        toast.value = message;
        window.clearTimeout(toastTimer);
        toastTimer = window.setTimeout(function () {
          toast.value = '';
        }, 2400);
      }

      function scrollTop() {
        nextTick(function () {
          window.scrollTo(0, 0);
        });
      }

      function routineExercises(routine) {
        if (!routine) return [];
        return routine.exerciseIds
          .map(function (id) { return stretchMap[id]; })
          .filter(Boolean);
      }

      function routineSeconds(routine) {
        return routineExercises(routine).reduce(function (total, exercise) {
          return total + exercise.duration;
        }, 0);
      }

      function routineMinutes(routine) {
        return Math.max(1, Math.round(routineSeconds(routine) / 60));
      }

      function coverImage(routine) {
        const list = routineExercises(routine);
        return list.length ? list[0].image : 'assets/poses/breathing.svg';
      }

      function formatDuration(seconds) {
        if (seconds < 60) return seconds + ' s';
        if (seconds % 60 === 0) return seconds / 60 + ' min';
        return Math.floor(seconds / 60) + ' min ' + (seconds % 60) + ' s';
      }

      function formatTimer(seconds) {
        const value = Math.max(0, Math.round(seconds));
        const minutes = Math.floor(value / 60);
        const remainder = value % 60;
        return String(minutes).padStart(2, '0') + ':' + String(remainder).padStart(2, '0');
      }

      function pad2(value) {
        return String(value).padStart(2, '0');
      }

      function minutesFromSeconds(seconds) {
        return Math.max(1, Math.round(seconds / 60));
      }

      const soundOn = computed(function () {
        return state.sound;
      });

      const totalSeconds = computed(function () {
        return state.sessions.reduce(function (total, session) {
          return total + (session.seconds || 0);
        }, 0);
      });

      const totalMinutes = computed(function () {
        return Math.round(totalSeconds.value / 60);
      });

      const totalSessions = computed(function () {
        return state.sessions.length;
      });

      const todaySeconds = computed(function () {
        const today = dateKey();
        return state.sessions.reduce(function (total, session) {
          return session.date === today ? total + (session.seconds || 0) : total;
        }, 0);
      });

      const todayMinutes = computed(function () {
        return Math.round(todaySeconds.value / 60);
      });

      const dailyGoal = computed(function () {
        return state.dailyGoal || DATA.dailyGoalMinutes;
      });

      const dailyGoalPct = computed(function () {
        return Math.min(100, Math.round((todayMinutes.value / dailyGoal.value) * 100));
      });

      const sessionDates = computed(function () {
        const dates = state.sessions.map(function (session) { return session.date; });
        return Array.from(new Set(dates)).sort();
      });

      const activeDays = computed(function () {
        return sessionDates.value.length;
      });

      const streak = computed(function () {
        const dates = sessionDates.value;
        if (!dates.length) return 0;
        const today = new Date();
        const todayKey = dateKey(today);
        const yesterdayKey = dateKey(addDays(today, -1));
        const last = dates[dates.length - 1];
        if (last !== todayKey && last !== yesterdayKey) return 0;
        let count = 1;
        for (let index = dates.length - 2; index >= 0; index -= 1) {
          if (dayDifference(dates[index + 1], dates[index]) === 1) {
            count += 1;
          } else {
            break;
          }
        }
        return count;
      });

      const bestStreak = computed(function () {
        const dates = sessionDates.value;
        if (!dates.length) return 0;
        let best = 1;
        let current = 1;
        for (let index = 1; index < dates.length; index += 1) {
          if (dayDifference(dates[index], dates[index - 1]) === 1) {
            current += 1;
            best = Math.max(best, current);
          } else {
            current = 1;
          }
        }
        return best;
      });

      const xp = computed(function () {
        return totalMinutes.value + activeDays.value * 10;
      });

      const levelIndex = computed(function () {
        let index = 0;
        for (let i = 0; i < levels.length; i += 1) {
          if (xp.value >= levels[i].min) index = i;
        }
        return index;
      });

      const level = computed(function () {
        return levels[levelIndex.value];
      });

      const nextLevel = computed(function () {
        return levels[levelIndex.value + 1] || null;
      });

      const levelProgress = computed(function () {
        if (!nextLevel.value) return 100;
        const start = level.value.min;
        const end = nextLevel.value.min;
        return Math.min(100, Math.max(0, ((xp.value - start) / (end - start)) * 100));
      });

      const totalTimeLabel = computed(function () {
        if (totalMinutes.value >= 60) {
          return Math.floor(totalMinutes.value / 60) + ' h ' + (totalMinutes.value % 60) + ' min';
        }
        if (totalMinutes.value > 0) return 'Continue somando';
        return 'Comece hoje';
      });

      const todayLabel = computed(function () {
        const formatted = new Intl.DateTimeFormat('pt-BR', {
          weekday: 'short',
          day: 'numeric',
          month: 'short'
        }).format(new Date());
        return capitalize(formatted.replace('.', ''));
      });

      const greeting = computed(function () {
        const hour = new Date().getHours();
        if (hour < 12) return 'Bom dia';
        if (hour < 18) return 'Boa tarde';
        return 'Boa noite';
      });

      const recommended = computed(function () {
        const hour = new Date().getHours();
        let id = 'corpo-inteiro';
        if (hour < 11) id = 'despertar-matinal';
        else if (hour < 17) id = 'corpo-inteiro';
        else if (hour < 21) id = 'pos-corrida';
        else id = 'preparacao-sono';
        return routineMap[id] || routines[0];
      });

      const dailyTip = computed(function () {
        const index = Math.floor(Date.now() / 86400000) % tips.length;
        return tips[index];
      });

      const filteredRoutines = computed(function () {
        if (activeFilter.value === 'todas') return routines;
        return routines.filter(function (routine) {
          return routine.category === activeFilter.value;
        });
      });

      const activeRoutineExercises = computed(function () {
        return routineExercises(activeRoutine.value);
      });

      const weekData = computed(function () {
        const labels = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
        const now = new Date();
        const totals = {};
        state.sessions.forEach(function (session) {
          totals[session.date] = (totals[session.date] || 0) + session.seconds;
        });
        const days = [];
        for (let offset = 6; offset >= 0; offset -= 1) {
          const date = addDays(now, -offset);
          const key = dateKey(date);
          const minutes = Math.round((totals[key] || 0) / 60);
          days.push({
            key: key,
            label: labels[date.getDay()],
            minutes: minutes,
            today: offset === 0
          });
        }
        const max = Math.max.apply(null, [dailyGoal.value, 1].concat(days.map(function (day) {
          return day.minutes;
        })));
        return days.map(function (day) {
          return Object.assign({}, day, {
            height: day.minutes === 0 ? 6 : Math.max(9, Math.round((day.minutes / max) * 100))
          });
        });
      });

      const achievements = computed(function () {
        const completedRoutines = new Set(state.sessions.map(function (session) {
          return session.routineId;
        }));
        return [
          {
            id: 'first',
            name: 'Primeiro passo',
            description: 'Conclua 1 treino',
            icon: 'sparkles',
            unlocked: totalSessions.value >= 1
          },
          {
            id: 'streak3',
            name: 'Três dias',
            description: 'Mantenha 3 dias seguidos',
            icon: 'flame',
            unlocked: bestStreak.value >= 3
          },
          {
            id: 'streak7',
            name: 'Semana em chamas',
            description: 'Alcance 7 dias de ofensiva',
            icon: 'flame',
            unlocked: bestStreak.value >= 7
          },
          {
            id: 'minutes30',
            name: '30 minutos',
            description: 'Some 30 min alongados',
            icon: 'clock',
            unlocked: totalMinutes.value >= 30
          },
          {
            id: 'minutes100',
            name: '100 minutos',
            description: 'Some 100 min alongados',
            icon: 'trophy',
            unlocked: totalMinutes.value >= 100
          },
          {
            id: 'sessions10',
            name: 'Ritmo constante',
            description: 'Conclua 10 treinos',
            icon: 'medal',
            unlocked: totalSessions.value >= 10
          },
          {
            id: 'fullbody',
            name: 'Corpo inteiro',
            description: 'Conclua a rotina Corpo Inteiro',
            icon: 'star',
            unlocked: completedRoutines.has('corpo-inteiro')
          },
          {
            id: 'levelflex',
            name: 'Nível Flexível',
            description: 'Alcance o nível Flexível',
            icon: 'activity',
            unlocked: xp.value >= 75
          }
        ];
      });

      const unlockedAchievements = computed(function () {
        return achievements.value.filter(function (achievement) {
          return achievement.unlocked;
        }).length;
      });

      const recentSessions = computed(function () {
        return state.sessions
          .slice()
          .sort(function (a, b) { return b.timestamp - a.timestamp; })
          .slice(0, 4);
      });

      const showTabbar = computed(function () {
        return ['home', 'routines', 'profile'].indexOf(view.value) !== -1;
      });

      const currentTab = computed(function () {
        if (view.value === 'detail') return 'routines';
        return view.value;
      });

      const playerExercises = computed(function () {
        return player.routine ? routineExercises(player.routine) : [];
      });

      const currentExercise = computed(function () {
        return playerExercises.value[player.index] || null;
      });

      const nextExercise = computed(function () {
        return playerExercises.value[player.index + 1] || null;
      });

      const timerText = computed(function () {
        return formatTimer(Math.ceil(player.remainingMs / 1000));
      });

      const timerOffset = computed(function () {
        if (!player.exerciseDurationMs) return 0;
        const ratio = Math.max(0, Math.min(1, player.remainingMs / player.exerciseDurationMs));
        return TIMER_CIRCUMFERENCE * (1 - ratio);
      });

      const playerProgress = computed(function () {
        const total = playerExercises.value.length;
        if (!total || !player.exerciseDurationMs) return 0;
        const current = 1 - (player.remainingMs / player.exerciseDurationMs);
        const result = ((player.index + Math.max(0, Math.min(1, current))) / total) * 100;
        return Math.min(100, Math.max(0, result));
      });

      const sessionMinutes = computed(function () {
        if (player.sessionSeconds <= 0) return 0;
        return Math.max(1, Math.round(player.sessionSeconds / 60));
      });

      function ensureAudio() {
        if (!state.sound) return;
        try {
          if (!audioCtx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextClass) return;
            audioCtx = new AudioContextClass();
          }
          if (audioCtx.state === 'suspended') audioCtx.resume();
        } catch (error) {
          audioCtx = null;
        }
      }

      function beep(frequency, duration, volume) {
        if (!state.sound) return;
        ensureAudio();
        if (!audioCtx) return;
        try {
          const oscillator = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          const start = audioCtx.currentTime;
          const length = duration || 0.1;
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(frequency || 880, start);
          gain.gain.setValueAtTime(0.0001, start);
          gain.gain.exponentialRampToValueAtTime(volume || 0.12, start + 0.012);
          gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
          oscillator.connect(gain);
          gain.connect(audioCtx.destination);
          oscillator.start(start);
          oscillator.stop(start + length + 0.03);
        } catch (error) {
          /* o áudio é um extra e pode ser bloqueado pelo navegador */
        }
      }

      function playChime() {
        beep(660, 0.12, 0.12);
        window.setTimeout(function () { beep(990, 0.14, 0.1); }, 110);
      }

      function requestWakeLock() {
        if (!('wakeLock' in navigator) || !player.running) return;
        try {
          if (!wakeLock) {
            navigator.wakeLock.request('screen').then(function (lock) {
              wakeLock = lock;
              lock.addEventListener('release', function () {
                wakeLock = null;
              });
            }).catch(function () {});
          }
        } catch (error) {
          wakeLock = null;
        }
      }

      function releaseWakeLock() {
        try {
          if (wakeLock) wakeLock.release();
        } catch (error) {
          /* ignora navegadores sem Wake Lock */
        }
        wakeLock = null;
      }

      function loadExercise(index, autoStart) {
        const exercise = playerExercises.value[index];
        if (!exercise) return;
        player.index = index;
        player.exerciseDurationMs = exercise.duration * 1000;
        player.remainingMs = player.exerciseDurationMs;
        player.accumulatedMs = 0;
        player.startedAt = Date.now();
        player.running = Boolean(autoStart);
        player.threeBeeped = false;
        if (player.running) requestWakeLock();
      }

      function captureElapsed() {
        if (!player.routine) return;
        if (player.running) {
          player.accumulatedMs += Date.now() - player.startedAt;
          player.running = false;
        }
        player.accumulatedMs = Math.min(player.accumulatedMs, player.exerciseDurationMs);
        player.remainingMs = Math.max(0, player.exerciseDurationMs - player.accumulatedMs);
        player.startedAt = Date.now();
      }

      function addCapturedToSession() {
        const spent = Math.min(player.accumulatedMs, player.exerciseDurationMs);
        if (spent > 0) player.sessionSeconds += Math.round(spent / 1000);
      }

      function pausePlayer() {
        if (!player.running) return;
        captureElapsed();
      }

      function resumePlayer() {
        if (!player.routine || player.running) return;
        ensureAudio();
        if (player.remainingMs <= 0) {
          player.remainingMs = player.exerciseDurationMs;
          player.accumulatedMs = 0;
        }
        player.startedAt = Date.now();
        player.running = true;
        requestWakeLock();
      }

      function tick() {
        if (!player.routine || !player.running) return;
        const elapsed = player.accumulatedMs + (Date.now() - player.startedAt);
        const remaining = player.exerciseDurationMs - elapsed;
        player.remainingMs = Math.max(0, remaining);
        if (remaining <= 3000 && remaining > 0 && !player.threeBeeped) {
          player.threeBeeped = true;
          beep(880, 0.07, 0.11);
        }
        if (remaining <= 0) {
          completeCurrentExercise();
        }
      }

      function completeCurrentExercise() {
        if (!player.routine) return;
        player.sessionSeconds += Math.round(player.exerciseDurationMs / 1000);
        player.completedCount += 1;
        player.accumulatedMs = player.exerciseDurationMs;
        player.remainingMs = 0;
        player.running = false;
        playChime();
        if (player.index >= playerExercises.value.length - 1) {
          finishSession(true);
        } else {
          loadExercise(player.index + 1, true);
        }
      }

      function recordSession(routine, seconds, exercises, completed) {
        const entry = {
          id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
          date: dateKey(),
          timestamp: Date.now(),
          routineId: routine.id,
          routineTitle: routine.title,
          seconds: Math.max(1, Math.round(seconds)),
          exercises: exercises,
          completed: Boolean(completed)
        };
        state.sessions.push(entry);
        if (state.sessions.length > 500) {
          state.sessions.splice(0, state.sessions.length - 500);
        }
        saveState();
      }

      function finishSession(completed) {
        if (!player.routine) return;
        player.running = false;
        releaseWakeLock();
        const routine = player.routine;
        const previousLevel = level.value.name;
        const previousXp = xp.value;
        const seconds = Math.max(0, Math.round(player.sessionSeconds));

        if (!player.recorded && seconds >= 5) {
          recordSession(routine, seconds, player.completedCount, completed);
        }
        player.recorded = true;

        summary.value = {
          routineTitle: routine.title,
          minutes: seconds > 0 ? Math.max(1, Math.round(seconds / 60)) : 0,
          exercises: player.completedCount,
          xp: Math.max(0, xp.value - previousXp),
          streak: streak.value,
          levelUp: level.value.name !== previousLevel
        };
        lastRoutine.value = routine;
        view.value = 'complete';
        scrollTop();
      }

      function startRoutine(routine) {
        if (!routine) return;
        ensureAudio();
        activeRoutine.value = routine;
        lastRoutine.value = routine;
        player.routine = routine;
        player.index = 0;
        player.sessionSeconds = 0;
        player.completedCount = 0;
        player.recorded = false;
        player.threeBeeped = false;
        player.running = false;
        player.accumulatedMs = 0;
        player.remainingMs = 0;
        player.exerciseDurationMs = 0;
        showExitConfirm.value = false;
        loadExercise(0, true);
        view.value = 'player';
        scrollTop();
      }

      function togglePlay() {
        if (!player.routine) return;
        if (player.running) {
          pausePlayer();
        } else {
          resumePlayer();
        }
      }

      function previousExercise() {
        if (!player.routine) return;
        captureElapsed();
        addCapturedToSession();
        beep(520, 0.06, 0.08);
        const target = player.index > 0 ? player.index - 1 : 0;
        loadExercise(target, true);
      }

      function skipExercise() {
        if (!player.routine) return;
        captureElapsed();
        addCapturedToSession();
        beep(520, 0.06, 0.08);
        if (player.index >= playerExercises.value.length - 1) {
          finishSession(false);
        } else {
          loadExercise(player.index + 1, true);
        }
      }

      function requestClosePlayer() {
        if (!player.routine) {
          go('home');
          return;
        }
        resumeAfterExit = player.running;
        captureElapsed();
        showExitConfirm.value = true;
      }

      function cancelExitConfirmation() {
        showExitConfirm.value = false;
        if (resumeAfterExit) resumePlayer();
        resumeAfterExit = false;
      }

      function confirmExitPlayer() {
        showExitConfirm.value = false;
        if (player.routine && !player.recorded) {
          addCapturedToSession();
          if (player.sessionSeconds >= 5) {
            recordSession(player.routine, player.sessionSeconds, player.completedCount, false);
            player.recorded = true;
            showToast('Progresso salvo');
          } else {
            player.recorded = true;
            showToast('Treino encerrado');
          }
        }
        releaseWakeLock();
        player.running = false;
        player.routine = null;
        resumeAfterExit = false;
        view.value = 'home';
        scrollTop();
      }

      function finishToHome() {
        releaseWakeLock();
        player.routine = null;
        player.running = false;
        view.value = 'home';
        scrollTop();
      }

      function repeatRoutine() {
        const routine = lastRoutine.value || routines[0];
        startRoutine(routine);
      }

      function go(target) {
        if (view.value === 'player' && target !== 'player') return;
        view.value = target;
        scrollTop();
      }

      function openRoutine(routine) {
        if (!routine) return;
        activeRoutine.value = routine;
        view.value = 'detail';
        scrollTop();
      }

      function closeDetail() {
        view.value = 'routines';
        scrollTop();
      }

      function toggleSound() {
        state.sound = !state.sound;
        saveState();
        if (state.sound) {
          ensureAudio();
          beep(880, 0.08, 0.08);
          showToast('Som ativado');
        } else {
          showToast('Som desativado');
        }
      }

      function formatSessionDate(timestamp) {
        const date = new Date(timestamp);
        const time = new Intl.DateTimeFormat('pt-BR', {
          hour: '2-digit',
          minute: '2-digit'
        }).format(date);
        const today = dateKey();
        if (dateKey(date) === today) return 'Hoje, ' + time;
        if (dateKey(date) === dateKey(addDays(new Date(), -1))) return 'Ontem, ' + time;
        return capitalize(new Intl.DateTimeFormat('pt-BR', {
          day: '2-digit',
          month: 'short'
        }).format(date).replace('.', '')) + ', ' + time;
      }

      function confirmReset() {
        state.sessions = [];
        saveState();
        showResetConfirm.value = false;
        showToast('Progresso apagado');
      }

      async function installApp() {
        if (!deferredPrompt.value) {
          showToast('Use o menu do navegador para instalar');
          return;
        }
        const prompt = deferredPrompt.value;
        deferredPrompt.value = null;
        canInstall.value = false;
        try {
          await prompt.prompt();
          const choice = await prompt.userChoice;
          if (choice && choice.outcome === 'accepted') {
            showToast('Instalando o Bend');
          }
        } catch (error) {
          showToast('Não foi possível abrir a instalação');
        }
      }

      function confettiStyle(index) {
        const colors = ['#2563eb', '#60a5fa', '#93c5fd', '#ffffff', '#38bdf8', '#c7d2fe'];
        const size = 6 + ((index * 5) % 8);
        return {
          left: ((index * 37) % 100) + '%',
          width: size + 'px',
          height: Math.round(size * 1.7) + 'px',
          background: colors[index % colors.length],
          animationDelay: (((index * 13) % 20) / 10) + 's',
          animationDuration: (2.4 + ((index * 7) % 12) / 10) + 's',
          transform: 'rotate(' + ((index * 29) % 360) + 'deg)'
        };
      }

      function handleVisibilityChange() {
        if (document.visibilityState === 'visible' && view.value === 'player' && player.running) {
          requestWakeLock();
        }
      }

      function handlePageHide() {
        if (view.value === 'player' && player.routine && !player.recorded) {
          captureElapsed();
          addCapturedToSession();
          if (player.sessionSeconds >= 5) {
            recordSession(player.routine, player.sessionSeconds, player.completedCount, false);
            player.recorded = true;
          }
        }
      }

      function handleKeydown(event) {
        if (view.value !== 'player' || showExitConfirm.value) return;
        if (event.code === 'Space') {
          event.preventDefault();
          togglePlay();
        } else if (event.code === 'ArrowRight') {
          event.preventDefault();
          skipExercise();
        } else if (event.code === 'ArrowLeft') {
          event.preventDefault();
          previousExercise();
        } else if (event.code === 'Escape') {
          event.preventDefault();
          requestClosePlayer();
        }
      }

      function handleBeforeInstall(event) {
        event.preventDefault();
        deferredPrompt.value = event;
        canInstall.value = !isStandalone.value;
      }

      function handleInstalled() {
        canInstall.value = false;
        deferredPrompt.value = null;
        showToast('Bend instalado neste dispositivo');
      }

      function registerServiceWorker() {
        if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;
        const register = function () {
          navigator.serviceWorker.register('./sw.js').catch(function () {
            /* o app continua funcionando online sem o service worker */
          });
        };
        if (document.readyState === 'complete') {
          register();
        } else {
          window.addEventListener('load', register, { once: true });
        }
      }

      onMounted(function () {
        isStandalone.value = window.matchMedia('(display-mode: standalone)').matches ||
          window.navigator.standalone === true;
        isIOS.value = /iphone|ipad|ipod/i.test(window.navigator.userAgent) ||
          (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);

        window.addEventListener('beforeinstallprompt', handleBeforeInstall);
        window.addEventListener('appinstalled', handleInstalled);
        window.addEventListener('pagehide', handlePageHide);
        window.addEventListener('keydown', handleKeydown);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        timerHandle = window.setInterval(tick, 200);
        registerServiceWorker();

        const params = new URLSearchParams(window.location.search);
        const routineId = params.get('routine');
        if (routineId && routineMap[routineId]) {
          openRoutine(routineMap[routineId]);
        }
      });

      onUnmounted(function () {
        window.clearInterval(timerHandle);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
        window.removeEventListener('appinstalled', handleInstalled);
        window.removeEventListener('pagehide', handlePageHide);
        window.removeEventListener('keydown', handleKeydown);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        releaseWakeLock();
      });

      return {
        view,
        routines,
        filters,
        activeFilter,
        filteredRoutines,
        activeRoutine,
        activeRoutineExercises,
        player,
        playerExercises,
        currentExercise,
        nextExercise,
        playerProgress,
        timerText,
        timerOffset,
        timerCircumference: TIMER_CIRCUMFERENCE,
        summary,
        showExitConfirm,
        showResetConfirm,
        showInstallHelp,
        toast,
        canInstall,
        isIOS,
        isStandalone,
        showTabbar,
        currentTab,
        soundOn,
        level,
        levelIndex,
        nextLevel,
        levelProgress,
        xp,
        streak,
        bestStreak,
        totalMinutes,
        totalSessions,
        totalTimeLabel,
        activeDays,
        todayMinutes,
        dailyGoal,
        dailyGoalPct,
        weekData,
        achievements,
        unlockedAchievements,
        recentSessions,
        todayLabel,
        greeting,
        recommended,
        dailyTip,
        sessionMinutes,
        go,
        openRoutine,
        closeDetail,
        startRoutine,
        requestClosePlayer,
        cancelExitConfirmation,
        confirmExitPlayer,
        finishToHome,
        repeatRoutine,
        togglePlay,
        previousExercise,
        skipExercise,
        toggleSound,
        installApp,
        confirmReset,
        routineMinutes,
        formatDuration,
        coverImage,
        formatSessionDate,
        minutesFromSeconds,
        pad2,
        confettiStyle,
        showToast
      };
    }
  });

  app.component('app-icon', {
    props: {
      name: { type: String, required: true },
      size: { type: [Number, String], default: 22 }
    },
    template: '<svg class="icon" :width="size" :height="size" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><use :href="\'#i-\' + name"></use></svg>'
  });

  app.mount('#app');
})();
