import { useEffect, useState } from "react";
import { BookOpenCheck, Languages, Loader2, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { AnalysisResult } from "@/components/AnalysisResult";
import { analyzeKoreanText, type SentenceAnalysis } from "@/lib/koreanAnalysis";

const SAMPLE_TEXT = `저는 오늘 한국어를 공부해요.\n친구와 학교에서 책을 읽었어요.\n내일은 선생님에게 질문을 할 거예요.`;

function App() {
  const [inputText, setInputText] = useState(SAMPLE_TEXT);
  const [notice, setNotice] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<SentenceAnalysis[]>([]);

  useEffect(() => {
    const cleaned = inputText.trim();
    if (!cleaned) {
      setResults([]);
      return;
    }

    const controller = new AbortController();

    const timer = window.setTimeout(async () => {
      setIsAnalyzing(true);
      try {
        const analyzed = await analyzeKoreanText(cleaned, controller.signal);
        if (!controller.signal.aborted) {
          setResults(analyzed);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsAnalyzing(false);
        }
      }
    }, 320);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [inputText]);

  const speakWord = (word: string) => {
    if (!word.trim()) {
      return;
    }

    if (!("speechSynthesis" in window)) {
      setNotice("当前浏览器不支持语音朗读，请换 Chrome 或 Edge。");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "ko-KR";
    utterance.rate = 0.9;
    utterance.pitch = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setNotice(`正在朗读：${word}`);
  };

  return (
    <main className="min-h-screen bg-[#EEF2FF] px-4 py-8 font-['Noto_Sans_KR'] text-[#312E81] md:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <Card className="rounded-[28px] border-2 border-[#C7D2FE] bg-white shadow-[0_10px_0_#C7D2FE,0_18px_35px_rgba(79,70,229,0.14)]">
          <CardHeader className="space-y-3">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#C7D2FE] bg-[#EEF2FF] px-3 py-1 text-xs text-[#4338CA]">
              <BookOpenCheck className="h-4 w-4" />
              Korean Sentence Analyzer
            </div>
            <CardTitle className="text-2xl font-bold text-[#1E1B4B] md:text-3xl">
              韩语文章逐句语法分析 + 中文解释 + 点击单词发音
            </CardTitle>
            <p className="text-sm text-[#4338CA] md:text-base">
              已升级为“本地词典 + 活用还原 + 在线自动翻译兜底”，不需要你再逐个反馈缺词。
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            <label htmlFor="korean-text" className="text-sm font-semibold text-[#4338CA]">
              韩语原文
            </label>
            <Textarea
              id="korean-text"
              value={inputText}
              onChange={(event) => setInputText(event.target.value)}
              placeholder="请粘贴韩语文章..."
              className="min-h-[140px] resize-y rounded-2xl border-2 border-[#C7D2FE] bg-[#EEF2FF] text-[#1E1B4B] placeholder:text-[#818CF8] focus-visible:ring-[#4F46E5]"
            />

            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                onClick={() => setInputText(SAMPLE_TEXT)}
                className="cursor-pointer rounded-2xl border-2 border-[#4F46E5] bg-[#4F46E5] text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#4338CA] focus-visible:ring-[#4F46E5]"
              >
                <Languages className="mr-2 h-4 w-4" />
                加载示例文本
              </Button>

              <Button
                type="button"
                onClick={() => speakWord("안녕하세요")}
                variant="outline"
                aria-label="试听韩语发音"
                className="cursor-pointer rounded-2xl border-2 border-[#C7D2FE] bg-white text-[#312E81] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#16A34A] hover:bg-[#EEF2FF]"
              >
                <Volume2 className="mr-2 h-4 w-4 text-[#16A34A]" />
                试听发音
              </Button>
            </div>

            {isAnalyzing ? (
              <p className="inline-flex items-center gap-2 rounded-xl border border-[#C7D2FE] bg-[#EEF2FF] px-3 py-2 text-sm text-[#312E81]">
                <Loader2 className="h-4 w-4 animate-spin text-[#4F46E5]" />
                正在自动补全翻译...
              </p>
            ) : null}

            {notice ? (
              <p className="rounded-xl border border-[#C7D2FE] bg-[#EEF2FF] px-3 py-2 text-sm text-[#312E81]">
                {notice}
              </p>
            ) : null}
          </CardContent>
        </Card>

        <AnalysisResult results={results} onSpeakWord={speakWord} />
      </div>
    </main>
  );
}

export default App;
