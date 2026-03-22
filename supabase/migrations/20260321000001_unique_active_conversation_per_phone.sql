-- Fix B2: Prevent duplicate active conversations per phone number
-- Root cause: No unique constraint allowed race conditions to create multiple
-- conversations for the same client phone when messages arrived simultaneously.

-- Step 1: Archive older duplicate conversations (keep newest per business+phone)
-- We archive instead of delete to preserve message history.
WITH ranked_convs AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY business_id, client_phone
      ORDER BY created_at DESC
    ) AS rn
  FROM conversations
  WHERE status != 'archived'
)
UPDATE conversations
SET status = 'archived'
WHERE id IN (
  SELECT id FROM ranked_convs WHERE rn > 1
);

-- Step 2: Add partial unique index — only one non-archived conversation per phone per business
CREATE UNIQUE INDEX idx_conv_unique_active_phone
  ON conversations(business_id, client_phone)
  WHERE status != 'archived';
