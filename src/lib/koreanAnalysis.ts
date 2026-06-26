export type WordAnalysis = {
  word: string;
  root: string;
  particle?: string;
  explanationZh: string;
};

export type SentenceAnalysis = {
  id: string;
  sentence: string;
  translationZh: string;
  grammarPoints: string[];
  words: WordAnalysis[];
};

const PARTICLE_MAP: Record<string, string> = {
  은: "主题助词（表示主题）",
  는: "主题助词（表示主题）",
  이: "主格助词（表示主语）",
  가: "主格助词（表示主语）",
  을: "宾格助词（表示宾语）",
  를: "宾格助词（表示宾语）",
  에: "地点/时间助词（在、到）",
  에서: "地点助词（在……进行动作）",
  와: "连接助词（和）",
  과: "连接助词（和）",
  도: "补助助词（也）",
  의: "所属助词（的）",
  로: "方向/工具助词（往、用）",
  으로: "方向/工具助词（往、用）",
  한테: "对象助词（对、给）",
  에게: "对象助词（对、给）",
  한테서: "来源助词（从……）",
  에게서: "来源助词（从……）",
  까지: "范围助词（直到）",
  부터: "起点助词（从）",
};

const PARTICLES_BY_LENGTH = Object.keys(PARTICLE_MAP).sort(
  (a, b) => b.length - a.length,
);

const ENDING_RULES: Array<{ pattern: RegExp; note: string }> = [
  { pattern: /습니다\.?$/, note: "正式敬语终结词尾（陈述句）" },
  { pattern: /습니까\??$/, note: "正式敬语疑问终结词尾" },
  { pattern: /어요\.?$/, note: "非正式敬语终结词尾" },
  { pattern: /아요\.?$/, note: "非正式敬语终结词尾" },
  { pattern: /해요\.?$/, note: "‘하다’活用的敬语形式" },
  { pattern: /했어요\.?$/, note: "过去时 + 敬语终结" },
  { pattern: /했다\.?$/, note: "过去时终结（口语/书面）" },
  { pattern: /고 있다\.?$/, note: "进行时表达（正在……）" },
  { pattern: /고 싶다\.?$/, note: "愿望表达（想要……）" },
  { pattern: /지 않다\.?$/, note: "否定表达（不……）" },
  { pattern: /(ㄹ|을) 거예요\.?$/, note: "将来时表达（将要……）" },
];

const WORD_DICT_ZH: Record<string, string> = {
  안녕하세요: "你好（敬语）",
  안녕: "你好/平安",
  저: "我（谦称）",
  나: "我",
  우리: "我们",
  너: "你",
  당신: "你",
  학생: "学生",
  선생님: "老师",
  친구: "朋友",
  학교: "学校",
  교실: "教室",
  집: "家",
  회사: "公司",
  병원: "医院",
  오늘: "今天",
  내일: "明天",
  어제: "昨天",
  지금: "现在",
  한국어: "韩语",
  중국어: "中文",
  영어: "英语",
  책: "书",
  영화: "电影",
  음악: "音乐",
  물: "水",
  밥: "饭",
  커피: "咖啡",
  시간: "时间",
  사람: "人",
  이름: "名字",
  질문: "问题/提问",
  답: "回答",
  전화: "电话",
  것: "事物/东西",
  거: "东西（것口语）",
  날씨: "天气",
  공부: "学习",
  사랑: "爱",
  이야기: "故事/聊天",
  생각: "想法",
  수업: "课程",
  시험: "考试",
  숙제: "作业",
  음식: "食物",
  공부하다: "学习",
  질문하다: "提问",
  대답하다: "回答",
  이야기하다: "聊天/叙述",
  시작하다: "开始",
  좋아하다: "喜欢",
  필요하다: "需要",
  이해하다: "理解",
  하다: "做/进行",
  가다: "去",
  오다: "来",
  먹다: "吃",
  마시다: "喝",
  읽다: "读",
  쓰다: "写",
  보다: "看",
  듣다: "听",
  말하다: "说",
  배우다: "学习（向他人学）",
  만나다: "见面",
  자다: "睡觉",
  일어나다: "起床",
  일하다: "工作",
  좋아지다: "变好",
  있다: "有/在",
  없다: "没有/不在",
  좋다: "好",
  크다: "大",
  작다: "小",
  빠르다: "快",
  느리다: "慢",
  많다: "多",
  적다: "少",
  어렵다: "难",
  쉽다: "容易",
  주세요: "请给我……",
};

const WORD_TRANSLATION_CACHE = new Map<string, string>();
const SENTENCE_TRANSLATION_CACHE = new Map<string, string>();

const ENDING_CANDIDATES = [
  "했습니다",
  "했어요",
  "합니다",
  "합니다",
  "해요",
  "합니다",
  "습니까",
  "습니다",
  "였어요",
  "이었어요",
  "았어요",
  "었어요",
  "거예요",
  "예요",
  "이에요",
  "아요",
  "어요",
  "니다",
  "다",
];

type LocalWordParse = {
  word: string;
  root: string;
  particle?: string;
  particleNote?: string;
  localMeaning?: string;
  needsRemoteMeaning: boolean;
};

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?。！？])\s+|\n+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function getGrammarPoints(sentence: string): string[] {
  const points: string[] = [];

  ENDING_RULES.forEach((rule) => {
    if (rule.pattern.test(sentence)) {
      points.push(rule.note);
    }
  });

  if (/그리고|하지만|그래서/.test(sentence)) {
    points.push("连接副词（并且/但是/所以）");
  }

  if (/\b못\b|안\s*[가-힣]+/.test(sentence)) {
    points.push("否定副词结构（못/안）");
  }

  return points.length > 0 ? points : ["基础陈述句结构（主语 + 谓语）"];
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function getBaseFormCandidates(word: string): string[] {
  const normalized = word.trim();
  if (!normalized) {
    return [];
  }

  const candidates = new Set<string>([normalized]);

  if (normalized.endsWith("해요")) {
    const noun = normalized.slice(0, -2);
    candidates.add(`${noun}하다`);
    candidates.add(noun);
  }

  if (normalized.endsWith("했어요") || normalized.endsWith("했다")) {
    const noun = normalized.replace(/했어요$|했다$/, "");
    candidates.add(`${noun}하다`);
    candidates.add(noun);
  }

  ENDING_CANDIDATES.forEach((ending) => {
    if (normalized.length <= ending.length + 1 || !normalized.endsWith(ending)) {
      return;
    }

    const stem = normalized.slice(0, -ending.length);
    candidates.add(stem);
    candidates.add(`${stem}다`);
  });

  return unique([...candidates]);
}

function findLocalMeaning(word: string): { base: string; meaning: string } | null {
  const candidates = getBaseFormCandidates(word);

  for (const candidate of candidates) {
    if (WORD_DICT_ZH[candidate]) {
      return { base: candidate, meaning: WORD_DICT_ZH[candidate] };
    }
  }

  return null;
}

function parseWordLocal(word: string): LocalWordParse {
  for (const particle of PARTICLES_BY_LENGTH) {
    if (word.length > particle.length && word.endsWith(particle)) {
      const root = word.slice(0, -particle.length);
      const local = findLocalMeaning(root);

      return {
        word,
        root: local?.base ?? root,
        particle,
        particleNote: PARTICLE_MAP[particle],
        localMeaning: local?.meaning,
        needsRemoteMeaning: !local,
      };
    }
  }

  const local = findLocalMeaning(word);

  return {
    word,
    root: local?.base ?? word,
    localMeaning: local?.meaning,
    needsRemoteMeaning: !local,
  };
}

async function fetchTranslation(
  text: string,
  signal?: AbortSignal,
): Promise<string | null> {
  const value = text.trim();
  if (!value) {
    return null;
  }

  try {
    const endpoint =
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(value)}&langpair=ko|zh-CN`;

    const response = await fetch(endpoint, { signal });
    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as {
      responseData?: { translatedText?: string };
    };

    const translated = payload.responseData?.translatedText?.trim();

    if (!translated || translated.toLowerCase() === value.toLowerCase()) {
      return null;
    }

    return translated;
  } catch {
    return null;
  }
}

async function resolveUnknownWords(
  unknownRoots: string[],
  signal?: AbortSignal,
): Promise<Map<string, string>> {
  const map = new Map<string, string>();

  const jobs = unknownRoots.map(async (root) => {
    if (WORD_TRANSLATION_CACHE.has(root)) {
      map.set(root, WORD_TRANSLATION_CACHE.get(root) ?? "");
      return;
    }

    const translated = await fetchTranslation(root, signal);
    if (translated) {
      WORD_TRANSLATION_CACHE.set(root, translated);
      map.set(root, translated);
    }
  });

  await Promise.all(jobs);
  return map;
}

async function resolveSentenceTranslations(
  sentences: string[],
  signal?: AbortSignal,
): Promise<Map<string, string>> {
  const map = new Map<string, string>();

  const jobs = sentences.map(async (sentence) => {
    if (SENTENCE_TRANSLATION_CACHE.has(sentence)) {
      map.set(sentence, SENTENCE_TRANSLATION_CACHE.get(sentence) ?? "");
      return;
    }

    const translated = await fetchTranslation(sentence, signal);
    if (translated) {
      SENTENCE_TRANSLATION_CACHE.set(sentence, translated);
      map.set(sentence, translated);
    }
  });

  await Promise.all(jobs);
  return map;
}

function buildFallbackTranslation(words: WordAnalysis[]): string {
  if (words.length === 0) {
    return "（未检测到可分析词汇）";
  }

  const translated = words.map((item) => {
    const fromLocal = WORD_DICT_ZH[item.root];
    if (fromLocal) {
      return fromLocal;
    }

    const cleanMeaning = item.explanationZh.split("：")[1]?.trim();
    return cleanMeaning || item.word;
  });

  return `参考直译：${translated.join(" ")}`;
}

function formatWordExplanation(
  parsed: LocalWordParse,
  remoteMeaningMap: Map<string, string>,
): WordAnalysis {
  const remoteMeaning = remoteMeaningMap.get(parsed.root);
  const finalMeaning = parsed.localMeaning ?? remoteMeaning;

  if (parsed.particle && parsed.particleNote) {
    return {
      word: parsed.word,
      root: parsed.root,
      particle: parsed.particle,
      explanationZh: finalMeaning
        ? `${parsed.root}（${finalMeaning}） + ${parsed.particle}：${parsed.particleNote}`
        : `${parsed.root} + ${parsed.particle}：${parsed.particleNote}`,
    };
  }

  return {
    word: parsed.word,
    root: parsed.root,
    explanationZh: finalMeaning
      ? `${parsed.word}（词干 ${parsed.root}）：${finalMeaning}`
      : `${parsed.word}：自动翻译暂不可用，请稍后重试`,
  };
}

export async function analyzeKoreanText(
  text: string,
  signal?: AbortSignal,
): Promise<SentenceAnalysis[]> {
  const cleaned = text.trim();
  if (!cleaned) {
    return [];
  }

  const sentences = splitSentences(cleaned);
  const parsedSentences = sentences.map((sentence) => {
    const words = (sentence.match(/[가-힣]+/g) ?? []).map(parseWordLocal);
    return { sentence, words };
  });

  const unknownRoots = unique(
    parsedSentences
      .flatMap((item) => item.words)
      .filter((word) => word.needsRemoteMeaning)
      .map((word) => word.root),
  );

  const [remoteWordMeanings, sentenceTranslations] = await Promise.all([
    resolveUnknownWords(unknownRoots, signal),
    resolveSentenceTranslations(sentences, signal),
  ]);

  return parsedSentences.map((item, index) => {
    const words = item.words.map((word) =>
      formatWordExplanation(word, remoteWordMeanings),
    );

    const translated = sentenceTranslations.get(item.sentence);

    return {
      id: `${index}-${item.sentence}`,
      sentence: item.sentence,
      translationZh: translated
        ? `参考整句翻译：${translated}`
        : buildFallbackTranslation(words),
      grammarPoints: getGrammarPoints(item.sentence),
      words,
    };
  });
}
