-- Drop existing policies
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON chat_messages;

-- Create new policy for chat_messages
CREATE POLICY "Enable insert for session owners" ON chat_messages
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM chat_sessions
            WHERE chat_sessions.id = chat_messages.session_id
            AND chat_sessions.user_id = auth.uid()
        )
    );

CREATE POLICY "Enable select for session owners" ON chat_messages
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM chat_sessions
            WHERE chat_sessions.id = chat_messages.session_id
            AND chat_sessions.user_id = auth.uid()
        )
    );