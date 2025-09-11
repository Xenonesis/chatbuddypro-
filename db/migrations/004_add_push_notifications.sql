-- Add push notifications and PWA support tables

-- Table for storing push notification subscriptions
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_data JSONB NOT NULL,
    device_info JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for notification preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    push_enabled BOOLEAN DEFAULT true,
    email_enabled BOOLEAN DEFAULT true,
    chat_messages BOOLEAN DEFAULT true,
    system_updates BOOLEAN DEFAULT true,
    security_alerts BOOLEAN DEFAULT true,
    marketing BOOLEAN DEFAULT false,
    quiet_hours_start TIME DEFAULT '22:00',
    quiet_hours_end TIME DEFAULT '08:00',
    timezone VARCHAR(50) DEFAULT 'UTC',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for notification history/queue
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'push', 'email', 'in_app'
    category VARCHAR(50) NOT NULL, -- 'chat', 'system', 'security', 'marketing'
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'failed', 'read'
    scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for PWA installation tracking
CREATE TABLE IF NOT EXISTS pwa_installations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    device_info JSONB NOT NULL,
    platform VARCHAR(50),
    user_agent TEXT,
    installed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_active ON push_subscriptions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON push_subscriptions((subscription_data->>'endpoint'));

-- Add unique constraint for user_id and endpoint combination
CREATE UNIQUE INDEX IF NOT EXISTS idx_push_subscriptions_user_endpoint 
ON push_subscriptions(user_id, (subscription_data->>'endpoint'));
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_scheduled ON notifications(scheduled_for) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_notifications_category ON notifications(category);
CREATE INDEX IF NOT EXISTS idx_pwa_installations_user_id ON pwa_installations(user_id);

-- RLS Policies
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE pwa_installations ENABLE ROW LEVEL SECURITY;

-- Push subscriptions policies
CREATE POLICY "Users can view their own push subscriptions" ON push_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own push subscriptions" ON push_subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own push subscriptions" ON push_subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own push subscriptions" ON push_subscriptions
    FOR DELETE USING (auth.uid() = user_id);

-- Notification preferences policies
CREATE POLICY "Users can view their own notification preferences" ON notification_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification preferences" ON notification_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification preferences" ON notification_preferences
    FOR UPDATE USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- PWA installations policies
CREATE POLICY "Users can view their own PWA installations" ON pwa_installations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own PWA installations" ON pwa_installations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own PWA installations" ON pwa_installations
    FOR UPDATE USING (auth.uid() = user_id);

-- Functions for notification management

-- Function to create default notification preferences for new users
CREATE OR REPLACE FUNCTION create_default_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notification_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default preferences for new users
DROP TRIGGER IF EXISTS create_notification_preferences_trigger ON auth.users;
CREATE TRIGGER create_notification_preferences_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_default_notification_preferences();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers
CREATE TRIGGER update_push_subscriptions_updated_at
    BEFORE UPDATE ON push_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at
    BEFORE UPDATE ON notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up old notifications
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void AS $$
BEGIN
    -- Delete notifications older than 30 days that are read or failed
    DELETE FROM notifications 
    WHERE created_at < NOW() - INTERVAL '30 days'
    AND status IN ('read', 'failed');
    
    -- Delete very old notifications (90+ days) regardless of status
    DELETE FROM notifications 
    WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user notification preferences with quiet hours check
CREATE OR REPLACE FUNCTION should_send_notification(
    p_user_id UUID,
    p_category VARCHAR(50),
    p_type VARCHAR(50) DEFAULT 'push'
)
RETURNS BOOLEAN AS $$
DECLARE
    prefs notification_preferences%ROWTYPE;
    current_time_in_tz TIME;
    is_quiet_hours BOOLEAN := false;
BEGIN
    -- Get user preferences
    SELECT * INTO prefs
    FROM notification_preferences
    WHERE user_id = p_user_id;
    
    -- If no preferences found, use defaults (allow notifications)
    IF NOT FOUND THEN
        RETURN true;
    END IF;
    
    -- Check if notifications are enabled for this type
    IF p_type = 'push' AND NOT prefs.push_enabled THEN
        RETURN false;
    END IF;
    
    IF p_type = 'email' AND NOT prefs.email_enabled THEN
        RETURN false;
    END IF;
    
    -- Check category-specific preferences
    CASE p_category
        WHEN 'chat' THEN
            IF NOT prefs.chat_messages THEN
                RETURN false;
            END IF;
        WHEN 'system' THEN
            IF NOT prefs.system_updates THEN
                RETURN false;
            END IF;
        WHEN 'security' THEN
            IF NOT prefs.security_alerts THEN
                RETURN false;
            END IF;
        WHEN 'marketing' THEN
            IF NOT prefs.marketing THEN
                RETURN false;
            END IF;
    END CASE;
    
    -- Check quiet hours (only for non-security notifications)
    IF p_category != 'security' THEN
        -- Convert current time to user's timezone
        current_time_in_tz := (NOW() AT TIME ZONE prefs.timezone)::TIME;
        
        -- Check if we're in quiet hours
        IF prefs.quiet_hours_start <= prefs.quiet_hours_end THEN
            -- Same day quiet hours (e.g., 22:00 to 08:00 next day)
            is_quiet_hours := current_time_in_tz >= prefs.quiet_hours_start 
                           OR current_time_in_tz <= prefs.quiet_hours_end;
        ELSE
            -- Overnight quiet hours (e.g., 22:00 to 08:00)
            is_quiet_hours := current_time_in_tz >= prefs.quiet_hours_start 
                           AND current_time_in_tz <= prefs.quiet_hours_end;
        END IF;
        
        IF is_quiet_hours THEN
            RETURN false;
        END IF;
    END IF;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;