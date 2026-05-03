# Sessions And Historical Practice Context

Sessions are modeled in the legacy app but active Vue pages currently render placeholders. The rewrite should restore the intended behavior unless product direction explicitly removes sessions. These tasks assume sessions are restored.

Sessions are owned, named collections of step IDs. Historical practice is derived from step `practiceRecords` grouped by `startOfDay`.

