# AI Governance Contract

Risk model:
- L0-L3: low-risk assistance may be automated under policy.
- L4: recommendation/simulation territory; policy controls execution.
- L5: human approval required.
- L6: human decision required for high-impact safety/security actions.

Controls:
- unknown action => BLOCK
- requested risk above policy => BLOCK
- high-risk policy => HUMAN_GATE
- allowed low-risk action => AUTONOMOUS_ALLOWED
- material AI actions have task, step, execution and orchestration records
- model/provider selection is allowlisted
- model output is not authority; policy and human authorization remain authoritative
