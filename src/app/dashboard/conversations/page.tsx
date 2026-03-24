import { Icon } from "@/components/ui/Icon";

export default function ConversationsEmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center flex-col text-slate-400">
      <Icon name="solar:chat-round-dots-linear" size={40} className="mb-3 opacity-50" />
      <p className="text-sm font-medium">Selecciona una conversación</p>
    </div>
  );
}
