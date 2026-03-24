export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      agent_context_cache: {
        Row: {
          business_id: string
          context_string: string
          id: string
          updated_at: string | null
        }
        Insert: {
          business_id: string
          context_string: string
          id?: string
          updated_at?: string | null
        }
        Update: {
          business_id?: string
          context_string?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_context_cache_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: true
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      agents: {
        Row: {
          activation_date: string | null
          business_id: string
          id: string
          mode: Database["public"]["Enums"]["agent_mode"]
          status: Database["public"]["Enums"]["agent_status"]
          tone: Database["public"]["Enums"]["agent_tone"]
          total_conversations_handled: number
          total_escalations: number
          total_suggestions_approved: number
          total_suggestions_generated: number
        }
        Insert: {
          activation_date?: string | null
          business_id: string
          id?: string
          mode?: Database["public"]["Enums"]["agent_mode"]
          status?: Database["public"]["Enums"]["agent_status"]
          tone?: Database["public"]["Enums"]["agent_tone"]
          total_conversations_handled?: number
          total_escalations?: number
          total_suggestions_approved?: number
          total_suggestions_generated?: number
        }
        Update: {
          activation_date?: string | null
          business_id?: string
          id?: string
          mode?: Database["public"]["Enums"]["agent_mode"]
          status?: Database["public"]["Enums"]["agent_status"]
          tone?: Database["public"]["Enums"]["agent_tone"]
          total_conversations_handled?: number
          total_escalations?: number
          total_suggestions_approved?: number
          total_suggestions_generated?: number
        }
        Relationships: [
          {
            foreignKeyName: "agents_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: true
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      autonomy_rules: {
        Row: {
          activated_at: string | null
          activated_by:
            | Database["public"]["Enums"]["autonomy_activated_by"]
            | null
          active: boolean
          business_id: string
          id: string
          level: Database["public"]["Enums"]["autonomy_level"]
          topic_id: string
        }
        Insert: {
          activated_at?: string | null
          activated_by?:
            | Database["public"]["Enums"]["autonomy_activated_by"]
            | null
          active?: boolean
          business_id: string
          id?: string
          level?: Database["public"]["Enums"]["autonomy_level"]
          topic_id: string
        }
        Update: {
          activated_at?: string | null
          activated_by?:
            | Database["public"]["Enums"]["autonomy_activated_by"]
            | null
          active?: boolean
          business_id?: string
          id?: string
          level?: Database["public"]["Enums"]["autonomy_level"]
          topic_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "autonomy_rules_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "autonomy_rules_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "competency_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          activated_at: string | null
          address: string | null
          created_at: string
          description: string | null
          id: string
          industry: Database["public"]["Enums"]["industry_type"]
          name: string
          notification_hour: number
          notify_training_alerts: boolean
          owner_id: string
          phone_business: string | null
          quiet_hours_end: number
          quiet_hours_start: number
          schedule: Json | null
          timezone: string
          whatsapp_access_token: string | null
          whatsapp_phone_number_id: string | null
          whatsapp_status: Database["public"]["Enums"]["whatsapp_status"]
          whatsapp_token_expires_at: string | null
          whatsapp_waba_id: string | null
        }
        Insert: {
          activated_at?: string | null
          address?: string | null
          created_at?: string
          description?: string | null
          id?: string
          industry: Database["public"]["Enums"]["industry_type"]
          name: string
          notification_hour?: number
          notify_training_alerts?: boolean
          owner_id: string
          phone_business?: string | null
          quiet_hours_end?: number
          quiet_hours_start?: number
          schedule?: Json | null
          timezone?: string
          whatsapp_access_token?: string | null
          whatsapp_phone_number_id?: string | null
          whatsapp_status?: Database["public"]["Enums"]["whatsapp_status"]
          whatsapp_token_expires_at?: string | null
          whatsapp_waba_id?: string | null
        }
        Update: {
          activated_at?: string | null
          address?: string | null
          created_at?: string
          description?: string | null
          id?: string
          industry?: Database["public"]["Enums"]["industry_type"]
          name?: string
          notification_hour?: number
          notify_training_alerts?: boolean
          owner_id?: string
          phone_business?: string | null
          quiet_hours_end?: number
          quiet_hours_start?: number
          schedule?: Json | null
          timezone?: string
          whatsapp_access_token?: string | null
          whatsapp_phone_number_id?: string | null
          whatsapp_status?: Database["public"]["Enums"]["whatsapp_status"]
          whatsapp_token_expires_at?: string | null
          whatsapp_waba_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "businesses_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: true
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
        ]
      }
      competency_topics: {
        Row: {
          approval_rate_7d: number
          business_id: string
          coverage_percentage: number
          description: string | null
          escalation_rate_7d: number
          id: string
          incident_count_7d: number
          is_default: boolean | null
          knowledge_count: number
          last_updated: string
          name: string
          status: Database["public"]["Enums"]["competency_status"]
        }
        Insert: {
          approval_rate_7d?: number
          business_id: string
          coverage_percentage?: number
          description?: string | null
          escalation_rate_7d?: number
          id?: string
          incident_count_7d?: number
          is_default?: boolean | null
          knowledge_count?: number
          last_updated?: string
          name: string
          status?: Database["public"]["Enums"]["competency_status"]
        }
        Update: {
          approval_rate_7d?: number
          business_id?: string
          coverage_percentage?: number
          description?: string | null
          escalation_rate_7d?: number
          id?: string
          incident_count_7d?: number
          is_default?: boolean | null
          knowledge_count?: number
          last_updated?: string
          name?: string
          status?: Database["public"]["Enums"]["competency_status"]
        }
        Relationships: [
          {
            foreignKeyName: "competency_topics_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          archived_at: string | null
          business_id: string
          client_name: string | null
          client_phone: string
          created_at: string
          first_message_at: string
          id: string
          last_message_at: string | null
          last_message_preview: string | null
          priority: Database["public"]["Enums"]["conversation_priority"]
          resolved_by: Database["public"]["Enums"]["resolved_by_type"]
          status: Database["public"]["Enums"]["conversation_status"]
          total_messages: number
        }
        Insert: {
          archived_at?: string | null
          business_id: string
          client_name?: string | null
          client_phone: string
          created_at?: string
          first_message_at?: string
          id?: string
          last_message_at?: string | null
          last_message_preview?: string | null
          priority?: Database["public"]["Enums"]["conversation_priority"]
          resolved_by?: Database["public"]["Enums"]["resolved_by_type"]
          status?: Database["public"]["Enums"]["conversation_status"]
          total_messages?: number
        }
        Update: {
          archived_at?: string | null
          business_id?: string
          client_name?: string | null
          client_phone?: string
          created_at?: string
          first_message_at?: string
          id?: string
          last_message_at?: string | null
          last_message_preview?: string | null
          priority?: Database["public"]["Enums"]["conversation_priority"]
          resolved_by?: Database["public"]["Enums"]["resolved_by_type"]
          status?: Database["public"]["Enums"]["conversation_status"]
          total_messages?: number
        }
        Relationships: [
          {
            foreignKeyName: "conversations_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_summaries: {
        Row: {
          business_id: string
          created_at: string
          date: string
          escalated: number
          estimated_minutes_saved: number
          id: string
          pending: number
          resolved_autonomous: number
          resolved_owner_approved: number
          total_conversations: number
          type: Database["public"]["Enums"]["summary_type"]
          weak_topics: string[] | null
          whatsapp_content: string | null
          whatsapp_sent_at: string | null
        }
        Insert: {
          business_id: string
          created_at?: string
          date: string
          escalated?: number
          estimated_minutes_saved?: number
          id?: string
          pending?: number
          resolved_autonomous?: number
          resolved_owner_approved?: number
          total_conversations?: number
          type?: Database["public"]["Enums"]["summary_type"]
          weak_topics?: string[] | null
          whatsapp_content?: string | null
          whatsapp_sent_at?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string
          date?: string
          escalated?: number
          estimated_minutes_saved?: number
          id?: string
          pending?: number
          resolved_autonomous?: number
          resolved_owner_approved?: number
          total_conversations?: number
          type?: Database["public"]["Enums"]["summary_type"]
          weak_topics?: string[] | null
          whatsapp_content?: string | null
          whatsapp_sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_summaries_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      escalation_rules: {
        Row: {
          active: boolean
          business_id: string
          description: string
          escalation_level: Database["public"]["Enums"]["escalation_level"]
          id: string
          is_default: boolean
          keywords: string[] | null
          trigger_type: Database["public"]["Enums"]["escalation_trigger_type"]
        }
        Insert: {
          active?: boolean
          business_id: string
          description: string
          escalation_level?: Database["public"]["Enums"]["escalation_level"]
          id?: string
          is_default?: boolean
          keywords?: string[] | null
          trigger_type: Database["public"]["Enums"]["escalation_trigger_type"]
        }
        Update: {
          active?: boolean
          business_id?: string
          description?: string
          escalation_level?: Database["public"]["Enums"]["escalation_level"]
          id?: string
          is_default?: boolean
          keywords?: string[] | null
          trigger_type?: Database["public"]["Enums"]["escalation_trigger_type"]
        }
        Relationships: [
          {
            foreignKeyName: "escalation_rules_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      escalations: {
        Row: {
          attended_at: string | null
          business_id: string
          containment_message_content: string | null
          containment_message_sent: boolean
          conversation_id: string
          created_at: string
          id: string
          level: Database["public"]["Enums"]["escalation_level"]
          metadata: Json | null
          notified_push_at: string | null
          notified_whatsapp_at: string | null
          reason: string
          resolved_at: string | null
          status: Database["public"]["Enums"]["escalation_entry_status"]
          trigger_rule_id: string | null
        }
        Insert: {
          attended_at?: string | null
          business_id: string
          containment_message_content?: string | null
          containment_message_sent?: boolean
          conversation_id: string
          created_at?: string
          id?: string
          level: Database["public"]["Enums"]["escalation_level"]
          metadata?: Json | null
          notified_push_at?: string | null
          notified_whatsapp_at?: string | null
          reason: string
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["escalation_entry_status"]
          trigger_rule_id?: string | null
        }
        Update: {
          attended_at?: string | null
          business_id?: string
          containment_message_content?: string | null
          containment_message_sent?: boolean
          conversation_id?: string
          created_at?: string
          id?: string
          level?: Database["public"]["Enums"]["escalation_level"]
          metadata?: Json | null
          notified_push_at?: string | null
          notified_whatsapp_at?: string | null
          reason?: string
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["escalation_entry_status"]
          trigger_rule_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "escalations_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escalations_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escalations_trigger_rule_id_fkey"
            columns: ["trigger_rule_id"]
            isOneToOne: false
            referencedRelation: "escalation_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      industry_templates: {
        Row: {
          default_escalation_rules: Json
          default_topics: Json
          id: string
          industry: Database["public"]["Enums"]["industry_type"]
          name: string
          sample_questions: Json
        }
        Insert: {
          default_escalation_rules?: Json
          default_topics?: Json
          id?: string
          industry: Database["public"]["Enums"]["industry_type"]
          name: string
          sample_questions?: Json
        }
        Update: {
          default_escalation_rules?: Json
          default_topics?: Json
          id?: string
          industry?: Database["public"]["Enums"]["industry_type"]
          name?: string
          sample_questions?: Json
        }
        Relationships: []
      }
      knowledge_items: {
        Row: {
          active: boolean
          business_id: string
          confirmed_by_owner: boolean
          content: string
          created_at: string
          id: string
          layer: Database["public"]["Enums"]["knowledge_layer"]
          source_id: string | null
          topic_id: string | null
          updated_at: string
          valid_until: string | null
          validity: Database["public"]["Enums"]["knowledge_validity"]
        }
        Insert: {
          active?: boolean
          business_id: string
          confirmed_by_owner?: boolean
          content: string
          created_at?: string
          id?: string
          layer: Database["public"]["Enums"]["knowledge_layer"]
          source_id?: string | null
          topic_id?: string | null
          updated_at?: string
          valid_until?: string | null
          validity?: Database["public"]["Enums"]["knowledge_validity"]
        }
        Update: {
          active?: boolean
          business_id?: string
          confirmed_by_owner?: boolean
          content?: string
          created_at?: string
          id?: string
          layer?: Database["public"]["Enums"]["knowledge_layer"]
          source_id?: string | null
          topic_id?: string | null
          updated_at?: string
          valid_until?: string | null
          validity?: Database["public"]["Enums"]["knowledge_validity"]
        }
        Relationships: [
          {
            foreignKeyName: "fk_knowledge_items_topic"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "competency_topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_items_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_items_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "knowledge_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_sources: {
        Row: {
          business_id: string
          created_at: string
          id: string
          processed_by: string | null
          raw_content: string | null
          type: Database["public"]["Enums"]["knowledge_source_type"]
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          processed_by?: string | null
          raw_content?: string | null
          type: Database["public"]["Enums"]["knowledge_source_type"]
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          processed_by?: string | null
          raw_content?: string | null
          type?: Database["public"]["Enums"]["knowledge_source_type"]
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_sources_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string | null
          conversation_id: string
          created_at: string
          direction: Database["public"]["Enums"]["message_direction"]
          id: string
          media_type: Database["public"]["Enums"]["media_type"] | null
          media_url: string | null
          sender_type: Database["public"]["Enums"]["sender_type"]
          sent_at: string | null
          status: Database["public"]["Enums"]["message_delivery_status"] | null
          whatsapp_message_id: string | null
        }
        Insert: {
          content?: string | null
          conversation_id: string
          created_at?: string
          direction: Database["public"]["Enums"]["message_direction"]
          id?: string
          media_type?: Database["public"]["Enums"]["media_type"] | null
          media_url?: string | null
          sender_type: Database["public"]["Enums"]["sender_type"]
          sent_at?: string | null
          status?: Database["public"]["Enums"]["message_delivery_status"] | null
          whatsapp_message_id?: string | null
        }
        Update: {
          content?: string | null
          conversation_id?: string
          created_at?: string
          direction?: Database["public"]["Enums"]["message_direction"]
          id?: string
          media_type?: Database["public"]["Enums"]["media_type"] | null
          media_url?: string | null
          sender_type?: Database["public"]["Enums"]["sender_type"]
          sent_at?: string | null
          status?: Database["public"]["Enums"]["message_delivery_status"] | null
          whatsapp_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          body: string | null
          business_id: string
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at: string
          id: string
          opened_at: string | null
          owner_id: string
          related_entity_id: string | null
          related_entity_type: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["notification_status"]
          title: string
          type: string
        }
        Insert: {
          action_url?: string | null
          body?: string | null
          business_id: string
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          id?: string
          opened_at?: string | null
          owner_id: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["notification_status"]
          title: string
          type: string
        }
        Update: {
          action_url?: string | null
          body?: string | null
          business_id?: string
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          id?: string
          opened_at?: string | null
          owner_id?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["notification_status"]
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_progress: {
        Row: {
          activated: boolean
          business_id: string
          completed_at: string | null
          current_step: Database["public"]["Enums"]["onboarding_step"]
          escalation_rules_completed: boolean
          id: string
          industry_completed: boolean
          knowledge_completed: boolean
          knowledge_completeness: number
          last_updated: string
          test_completed: boolean
          test_messages_sent: number
          whatsapp_completed: boolean
          whatsapp_skipped: boolean
        }
        Insert: {
          activated?: boolean
          business_id: string
          completed_at?: string | null
          current_step?: Database["public"]["Enums"]["onboarding_step"]
          escalation_rules_completed?: boolean
          id?: string
          industry_completed?: boolean
          knowledge_completed?: boolean
          knowledge_completeness?: number
          last_updated?: string
          test_completed?: boolean
          test_messages_sent?: number
          whatsapp_completed?: boolean
          whatsapp_skipped?: boolean
        }
        Update: {
          activated?: boolean
          business_id?: string
          completed_at?: string | null
          current_step?: Database["public"]["Enums"]["onboarding_step"]
          escalation_rules_completed?: boolean
          id?: string
          industry_completed?: boolean
          knowledge_completed?: boolean
          knowledge_completeness?: number
          last_updated?: string
          test_completed?: boolean
          test_messages_sent?: number
          whatsapp_completed?: boolean
          whatsapp_skipped?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_progress_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: true
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      owners: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          last_active_at: string
          onesignal_id: string | null
          phone_personal: string | null
          phone_verified: boolean
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id: string
          last_active_at?: string
          onesignal_id?: string | null
          phone_personal?: string | null
          phone_verified?: boolean
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          last_active_at?: string
          onesignal_id?: string | null
          phone_personal?: string | null
          phone_verified?: boolean
        }
        Relationships: []
      }
      suggestions: {
        Row: {
          business_id: string
          confidence: number
          confidence_tier: Database["public"]["Enums"]["confidence_tier"]
          content: string
          conversation_id: string
          correction_valid_until: string | null
          correction_validity:
            | Database["public"]["Enums"]["knowledge_validity"]
            | null
          created_at: string
          detected_intent: string | null
          detected_intent_label: string | null
          final_content: string | null
          id: string
          knowledge_items_used: string[] | null
          metadata: Json | null
          resolved_at: string | null
          resolved_by_owner: boolean | null
          status: Database["public"]["Enums"]["suggestion_status"]
        }
        Insert: {
          business_id: string
          confidence: number
          confidence_tier: Database["public"]["Enums"]["confidence_tier"]
          content: string
          conversation_id: string
          correction_valid_until?: string | null
          correction_validity?:
            | Database["public"]["Enums"]["knowledge_validity"]
            | null
          created_at?: string
          detected_intent?: string | null
          detected_intent_label?: string | null
          final_content?: string | null
          id?: string
          knowledge_items_used?: string[] | null
          metadata?: Json | null
          resolved_at?: string | null
          resolved_by_owner?: boolean | null
          status?: Database["public"]["Enums"]["suggestion_status"]
        }
        Update: {
          business_id?: string
          confidence?: number
          confidence_tier?: Database["public"]["Enums"]["confidence_tier"]
          content?: string
          conversation_id?: string
          correction_valid_until?: string | null
          correction_validity?:
            | Database["public"]["Enums"]["knowledge_validity"]
            | null
          created_at?: string
          detected_intent?: string | null
          detected_intent_label?: string | null
          final_content?: string | null
          id?: string
          knowledge_items_used?: string[] | null
          metadata?: Json | null
          resolved_at?: string | null
          resolved_by_owner?: boolean | null
          status?: Database["public"]["Enums"]["suggestion_status"]
        }
        Relationships: [
          {
            foreignKeyName: "suggestions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suggestions_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      system_logs: {
        Row: {
          actor: Database["public"]["Enums"]["log_actor"]
          business_id: string | null
          conversation_id: string | null
          created_at: string
          error_message: string | null
          error_type: string | null
          escalation_id: string | null
          event_type: string
          id: string
          llm_latency_ms: number | null
          llm_model: string | null
          llm_provider: string | null
          llm_tokens_input: number | null
          llm_tokens_output: number | null
          message_id: string | null
          metadata: Json | null
          outcome: Database["public"]["Enums"]["log_outcome"]
          suggestion_id: string | null
          trace_id: string
        }
        Insert: {
          actor?: Database["public"]["Enums"]["log_actor"]
          business_id?: string | null
          conversation_id?: string | null
          created_at?: string
          error_message?: string | null
          error_type?: string | null
          escalation_id?: string | null
          event_type: string
          id?: string
          llm_latency_ms?: number | null
          llm_model?: string | null
          llm_provider?: string | null
          llm_tokens_input?: number | null
          llm_tokens_output?: number | null
          message_id?: string | null
          metadata?: Json | null
          outcome?: Database["public"]["Enums"]["log_outcome"]
          suggestion_id?: string | null
          trace_id: string
        }
        Update: {
          actor?: Database["public"]["Enums"]["log_actor"]
          business_id?: string | null
          conversation_id?: string | null
          created_at?: string
          error_message?: string | null
          error_type?: string | null
          escalation_id?: string | null
          event_type?: string
          id?: string
          llm_latency_ms?: number | null
          llm_model?: string | null
          llm_provider?: string | null
          llm_tokens_input?: number | null
          llm_tokens_output?: number | null
          message_id?: string | null
          metadata?: Json | null
          outcome?: Database["public"]["Enums"]["log_outcome"]
          suggestion_id?: string | null
          trace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "system_logs_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "system_logs_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "system_logs_escalation_id_fkey"
            columns: ["escalation_id"]
            isOneToOne: false
            referencedRelation: "escalations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "system_logs_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "system_logs_suggestion_id_fkey"
            columns: ["suggestion_id"]
            isOneToOne: false
            referencedRelation: "suggestions"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_queue: {
        Row: {
          attempts: number
          created_at: string
          error_message: string | null
          id: string
          payload: Json
          status: Database["public"]["Enums"]["webhook_status"]
          updated_at: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          error_message?: string | null
          id?: string
          payload: Json
          status?: Database["public"]["Enums"]["webhook_status"]
          updated_at?: string
        }
        Update: {
          attempts?: number
          created_at?: string
          error_message?: string | null
          id?: string
          payload?: Json
          status?: Database["public"]["Enums"]["webhook_status"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_owner_exists: { Args: { p_auth_id: string }; Returns: boolean }
      create_owner_with_business: {
        Args: {
          p_auth_id: string
          p_email: string
          p_full_name: string
          p_phone_personal?: string
        }
        Returns: Json
      }
      get_business_id: { Args: never; Returns: string }
      process_escalation_fallbacks: { Args: never; Returns: undefined }
      refresh_competency_coverage: {
        Args: { p_business_id: string }
        Returns: undefined
      }
      seed_industry_data: {
        Args: { p_business_id: string; p_industry: string }
        Returns: Json
      }
      trigger_daily_summaries: { Args: never; Returns: undefined }
      verify_owner_phone: { Args: never; Returns: undefined }
    }
    Enums: {
      agent_mode: "collaborator" | "autonomous_partial" | "autonomous_full"
      agent_status: "inactive" | "sandbox" | "active" | "paused" | "error"
      agent_tone: "friendly" | "professional" | "formal"
      autonomy_activated_by: "owner_manual" | "system_suggestion_accepted"
      autonomy_level: "collaborator" | "autonomous_with_guardrails"
      competency_status: "strong" | "partial" | "weak"
      confidence_tier: "high" | "medium" | "low"
      conversation_priority: "normal" | "elevated" | "urgent"
      conversation_status:
        | "active"
        | "pending_approval"
        | "escalated_informative"
        | "escalated_sensitive"
        | "escalated_urgent"
        | "waiting"
        | "resolved"
        | "archived"
      escalation_entry_status: "active" | "attended" | "resolved"
      escalation_level: "informative" | "sensitive" | "urgent"
      escalation_trigger_type:
        | "missing_info"
        | "sensitive_topic"
        | "keyword_match"
        | "emergency_keyword"
      industry_type:
        | "restaurant"
        | "clinic"
        | "salon"
        | "retail"
        | "gym"
        | "professional_services"
        | "other"
      knowledge_layer: "structured" | "operational" | "narrative" | "learned"
      knowledge_source_type:
        | "onboarding"
        | "quick_instruct"
        | "voice_note"
        | "image_ocr"
        | "link_extraction"
        | "correction"
      knowledge_validity: "permanent" | "temporary" | "one_time"
      log_actor: "owner" | "system" | "client" | "meta_webhook"
      log_outcome: "success" | "error" | "timeout" | "fallback"
      media_type: "text" | "image" | "audio" | "document"
      message_delivery_status: "sent" | "delivered" | "read" | "failed"
      message_direction: "inbound" | "outbound"
      notification_channel: "push" | "whatsapp" | "in_app"
      notification_status:
        | "pending"
        | "sent"
        | "delivered"
        | "opened"
        | "failed"
      onboarding_step:
        | "industry"
        | "knowledge"
        | "escalation_rules"
        | "whatsapp"
        | "test"
        | "activation"
        | "complete"
      resolved_by_type:
        | "agent_autonomous"
        | "owner_approved"
        | "owner_manual"
        | "pending"
      sender_type: "client" | "agent" | "owner" | "system"
      suggestion_status:
        | "pending"
        | "approved"
        | "edited"
        | "rejected"
        | "expired"
        | "auto_sent"
      summary_type: "daily" | "weekly" | "first_week"
      webhook_status: "pending" | "processing" | "completed" | "error"
      whatsapp_status:
        | "disconnected"
        | "connecting"
        | "connected"
        | "expired"
        | "error"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      agent_mode: ["collaborator", "autonomous_partial", "autonomous_full"],
      agent_status: ["inactive", "sandbox", "active", "paused", "error"],
      agent_tone: ["friendly", "professional", "formal"],
      autonomy_activated_by: ["owner_manual", "system_suggestion_accepted"],
      autonomy_level: ["collaborator", "autonomous_with_guardrails"],
      competency_status: ["strong", "partial", "weak"],
      confidence_tier: ["high", "medium", "low"],
      conversation_priority: ["normal", "elevated", "urgent"],
      conversation_status: [
        "active",
        "pending_approval",
        "escalated_informative",
        "escalated_sensitive",
        "escalated_urgent",
        "waiting",
        "resolved",
        "archived",
      ],
      escalation_entry_status: ["active", "attended", "resolved"],
      escalation_level: ["informative", "sensitive", "urgent"],
      escalation_trigger_type: [
        "missing_info",
        "sensitive_topic",
        "keyword_match",
        "emergency_keyword",
      ],
      industry_type: [
        "restaurant",
        "clinic",
        "salon",
        "retail",
        "gym",
        "professional_services",
        "other",
      ],
      knowledge_layer: ["structured", "operational", "narrative", "learned"],
      knowledge_source_type: [
        "onboarding",
        "quick_instruct",
        "voice_note",
        "image_ocr",
        "link_extraction",
        "correction",
      ],
      knowledge_validity: ["permanent", "temporary", "one_time"],
      log_actor: ["owner", "system", "client", "meta_webhook"],
      log_outcome: ["success", "error", "timeout", "fallback"],
      media_type: ["text", "image", "audio", "document"],
      message_delivery_status: ["sent", "delivered", "read", "failed"],
      message_direction: ["inbound", "outbound"],
      notification_channel: ["push", "whatsapp", "in_app"],
      notification_status: ["pending", "sent", "delivered", "opened", "failed"],
      onboarding_step: [
        "industry",
        "knowledge",
        "escalation_rules",
        "whatsapp",
        "test",
        "activation",
        "complete",
      ],
      resolved_by_type: [
        "agent_autonomous",
        "owner_approved",
        "owner_manual",
        "pending",
      ],
      sender_type: ["client", "agent", "owner", "system"],
      suggestion_status: [
        "pending",
        "approved",
        "edited",
        "rejected",
        "expired",
        "auto_sent",
      ],
      summary_type: ["daily", "weekly", "first_week"],
      webhook_status: ["pending", "processing", "completed", "error"],
      whatsapp_status: [
        "disconnected",
        "connecting",
        "connected",
        "expired",
        "error",
      ],
    },
  },
} as const
