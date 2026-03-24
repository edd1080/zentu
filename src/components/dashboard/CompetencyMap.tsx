"use client";

import * as React from "react";
import { Icon } from "@/components/ui/Icon";
import { TopicCard, type Topic } from "./TopicCard";

interface CompetencyMapProps {
  topics: Topic[];
  onTopicClick?: (topicId: string) => void;
}

export function CompetencyMap({ topics, onTopicClick }: CompetencyMapProps) {
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [additionalExpanded, setAdditionalExpanded] = React.useState(false);

  const coreTopics = topics.filter(t => t.is_default);
  const additionalTopics = topics.filter(t => !t.is_default);

  const handleClick = (topicId: string) => {
    setExpandedId(prev => prev === topicId ? null : topicId);
    onTopicClick?.(topicId);
  };

  if (coreTopics.length === 0 && additionalTopics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 bg-white border border-dashed border-slate-200 rounded-2xl">
        <Icon name="solar:brain-linear" size={32} className="text-slate-300" />
        <p className="text-sm text-slate-400 text-center max-w-xs">
          Aún no hay áreas definidas. Completa el onboarding para verlas aquí.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {coreTopics.map(topic => (
        <TopicCard
          key={topic.id}
          topic={topic}
          isExpanded={expandedId === topic.id}
          onClick={() => handleClick(topic.id)}
        />
      ))}

      {coreTopics.some(t => t.knowledge_count === 0) && (
        <div className="flex items-start gap-2.5 p-3 bg-slate-50 border border-slate-200/60 rounded-xl">
          <Icon name="solar:info-circle-linear" size={14} className="text-slate-400 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-500">
            Usa <span className="font-semibold text-slate-700">Enseñar algo nuevo</span> para cubrir las áreas marcadas sin conocimiento.
          </p>
        </div>
      )}

      {additionalTopics.length > 0 && (
        <div className="mt-1">
          <button
            onClick={() => setAdditionalExpanded(p => !p)}
            className="flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors mb-2"
          >
            <Icon
              name={additionalExpanded ? "solar:alt-arrow-up-linear" : "solar:alt-arrow-down-linear"}
              size={13}
            />
            <span>Conocimiento adicional</span>
            <span className="bg-slate-100 border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full text-[10px] font-semibold">
              {additionalTopics.length}
            </span>
          </button>

          {additionalExpanded && (
            <div className="flex flex-col gap-2 pl-3 border-l-2 border-slate-100 ml-1">
              {additionalTopics.map(topic => (
                <TopicCard
                  key={topic.id}
                  topic={topic}
                  isExpanded={expandedId === topic.id}
                  onClick={() => handleClick(topic.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
