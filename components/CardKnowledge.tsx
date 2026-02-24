// components/CardKnowledge.tsx
import Link from "next/link";
import {
    FaLightbulb,
    FaCheckCircle,
    FaExpand,
    FaArrowRight,
} from "react-icons/fa";
import type { CardKnowledge as CardKnowledgeType } from "@/lib/datasets/card-knowledge";

type Props = {
    knowledge: CardKnowledgeType;
    /** Map of datasetSlug → { cardSlug, cardTitle } for rendering related links */
    relatedCards: Array<{ slug: string; title: string }>;
};

export default function CardKnowledge({ knowledge, relatedCards }: Props) {
    return (
        <div className="rounded-xl bg-surface border border-border overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5">
                <h3 className="font-mono text-xs tracking-wider uppercase text-muted-foreground mb-2">
                    <span className="text-gradient">About This Card</span>
                </h3>
                <p className="text-lg md:text-xl font-bold text-foreground leading-snug">
                    {knowledge.headline}
                </p>
            </div>

            <div className="p-6 space-y-6">
                {/* Explanation */}
                <div>
                    <h4 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">
                        What this shows
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {knowledge.explanation}
                    </p>
                </div>

                {/* Why it matters */}
                <div>
                    <h4 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                        <FaLightbulb className="w-3 h-3 text-amber-400" />
                        Why it matters
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {knowledge.whyItMatters}
                    </p>
                </div>

                {/* Key Insights */}
                <div>
                    <h4 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">
                        Key Insights
                    </h4>
                    <ul className="space-y-2.5">
                        {knowledge.keyInsights.map((insight, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                                <FaCheckCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-emerald-400" />
                                <span className="leading-relaxed">{insight}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Scale comparison */}
                <div className="rounded-lg bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/10 p-4">
                    <div className="flex items-start gap-3">
                        <FaExpand className="w-4 h-4 mt-0.5 shrink-0 text-indigo-400" />
                        <div>
                            <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 block mb-1">
                                Feel the scale
                            </span>
                            <p className="text-sm text-foreground font-medium leading-relaxed">
                                {knowledge.scale}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Related cards */}
                {relatedCards.length > 0 && (
                    <div>
                        <h4 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">
                            Related Cards
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {relatedCards.map((card) => (
                                <Link
                                    key={card.slug}
                                    href={`/v/${card.slug}`}
                                    className="inline-flex items-center gap-1.5 text-xs font-mono text-indigo-400 hover:text-indigo-300 transition-colors bg-indigo-500/5 border border-indigo-500/10 rounded-lg px-3 py-1.5 hover:bg-indigo-500/10"
                                >
                                    {card.title}
                                    <FaArrowRight className="w-2.5 h-2.5" />
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
