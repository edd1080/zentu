-- Migration: Add description and is_default to competency_topics
-- Allows distinguishing default industry topics from custom topics and storing their specific descriptions.

ALTER TABLE public.competency_topics
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS is_default boolean DEFAULT false;
