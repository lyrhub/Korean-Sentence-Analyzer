import { Volume2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SentenceAnalysis } from "@/lib/koreanAnalysis";

type AnalysisResultProps = {
  results: SentenceAnalysis[];
  onSpeakWord: (word: string) => void;
};

export function AnalysisResult({ results, onSpeakWord }: AnalysisResultProps) {
  if (results.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4" aria-label="韩语逐句分析结果">
      {results.map((item, idx) => (
        <Card
          key={item.id}
          className="rounded-3xl border-2 border-[#C7D2FE] bg-white shadow-[0_8px_0_#C7D2FE,0_14px_30px_rgba(79,70,229,0.12)]"
        >
          <CardHeader className="pb-3">
            <CardTitle className="font-['Noto_Sans_KR'] text-lg text-[#312E81]">
              第 {idx + 1} 句
            </CardTitle>
            <p className="rounded-2xl border border-[#C7D2FE] bg-[#EEF2FF] px-4 py-3 text-base text-[#1E1B4B]">
              {item.sentence}
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <h3 className="mb-2 text-sm font-semibold text-[#4338CA]">中文翻译说明</h3>
              <p className="rounded-2xl bg-[#EBEEF8] px-4 py-3 text-sm text-[#312E81]">
                {item.translationZh}
              </p>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-[#4338CA]">语法点</h3>
              <ul className="space-y-2">
                {item.grammarPoints.map((point) => (
                  <li
                    key={point}
                    className="rounded-xl border border-[#C7D2FE] bg-[#EEF2FF] px-3 py-2 text-sm text-[#312E81]"
                  >
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-[#4338CA]">单词点击发音 + 释义</h3>
              <div className="flex flex-wrap gap-2">
                {item.words.map((wordItem) => (
                  <button
                    key={`${item.id}-${wordItem.word}`}
                    type="button"
                    onClick={() => onSpeakWord(wordItem.word)}
                    aria-label={`朗读单词 ${wordItem.word}`}
                    title={wordItem.explanationZh}
                    className="group cursor-pointer rounded-2xl border-2 border-[#C7D2FE] bg-[#EEF2FF] px-3 py-2 text-left text-sm text-[#1E1B4B] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#4F46E5] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]"
                  >
                    <span className="mr-2 inline-flex items-center gap-1 font-medium">
                      <Volume2 className="h-3.5 w-3.5 text-[#16A34A]" />
                      {wordItem.word}
                    </span>
                    <span className="block text-xs text-[#4338CA]">{wordItem.explanationZh}</span>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
