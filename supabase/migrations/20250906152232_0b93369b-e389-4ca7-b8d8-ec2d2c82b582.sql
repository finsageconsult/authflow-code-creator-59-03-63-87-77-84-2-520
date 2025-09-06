-- Deduplicate existing sessions by coach+client+scheduled_at, keep the most recently updated
WITH ranked AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY coach_id, client_id, scheduled_at
           ORDER BY updated_at DESC, created_at DESC
         ) AS rn
  FROM public.coaching_sessions
)
DELETE FROM public.coaching_sessions cs
USING ranked r
WHERE cs.id = r.id AND r.rn > 1;

-- Enforce uniqueness so upsert works and duplicates can't be created again
ALTER TABLE public.coaching_sessions
ADD CONSTRAINT coaching_sessions_unique_coach_client_time
UNIQUE (coach_id, client_id, scheduled_at);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_coaching_sessions_coach ON public.coaching_sessions (coach_id);
CREATE INDEX IF NOT EXISTS idx_coaching_sessions_client ON public.coaching_sessions (client_id);