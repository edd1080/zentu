"use client";

import * as React from "react";
import { ChevronDown, ChevronRight, Brain, Plus } from "lucide-react";
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
      <div className="flex flex-col items-center justify-center py-12 gap-3 bg-white border border-dashed border-(--surface-border) rounded-2xl">
        <Brain className="h-8 w-8 text-(--text-disabled)" />
        <p className="text-sm text-(--text-tertiary)">
          Aún no hay áreas definidas. Completa el onboarding para verlas aquí.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        {coreTopics.map(topic => (
          <TopicCard
            key={topic.id}
            topic={topic}
            isExpanded={expandedId === topic.id}
            onClick={() => handleClick(topic.id)}
          />
        ))}
      </div>

      {coreTopics.some(t => t.knowledge_count === 0) && (
        <div className="flex items-center gap-3 p-3 bg-(--surface-muted) border border-(--surface-border) rounded-xl">
          <Plus className="h-4 w-4 text-(--text-tertiary) shrink-0" />
          <p className="text-xs text-(--text-secondary)">
            Usa <span className="font-semibold text-(--text-primary)">Instrucción rápida</span> para cubrir las áreas sin conocimiento.
          </p>
        </div>
      )}

      {additionalTopics.length > 0 && (
        <div className="flex flex-col gap-2 mt-1">
          <button
            onClick={() => setAdditionalExpanded(p => !p)}
            className="flex items-center gap-2 text-sm text-(--text-tertiary) hover:text-(--text-secondary) transition-colors self-start"
          >
            {additionalExpanded
              ? <ChevronDown className="h-4 w-4" />
              : <ChevronRight className="h-4 w-4" />
            }
            <span className="font-medium">Conocimiento adicional</span>
            <span className="text-xs bg-(--surface-muted) border border-(--surface-border) px-1.5 py-0.5 rounded-full">
              {additionalTopics.length}
            </span>
          </button>

          {additionalExpanded && (
            <div className="flex flex-col gap-2 pl-2 border-l-2 border-(--surface-border) ml-1">
              {additionalTopics.map(topic => (
                <TopicCard
                  key={topic.id}
                  topic={topic}
                  isExpanded={expandedId === topic.id}
                  onClick={() => handleClick(topic.id)}
                  compact
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
