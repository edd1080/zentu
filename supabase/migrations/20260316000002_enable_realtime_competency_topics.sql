-- Enable Realtime for competency_topics so coverage/status updates
-- broadcast to subscribed clients without requiring a page refresh.
ALTER publication supabase_realtime ADD TABLE public.competency_topics;
