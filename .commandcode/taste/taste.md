# workflow
- Always present a plan first and wait for explicit approval before making code changes. Confidence: 0.85
- When implementing, mark todos as in_progress and don't stop until all todos are completed. Confidence: 0.80
- When asked to just analyze, provide analysis only without making any code changes. Confidence: 0.70
- Always ask the user for clearity, don't assume things that are ambiguous dont just assume things. Confidence: 0.95

# database
- Use batch operations (Prisma createMany) instead of line-by-line/single-row inserts to reduce I/O overhead and avoid timeouts. Confidence: 0.80
