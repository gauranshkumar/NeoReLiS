import app from './index'

const port = Number(process.env.PORT) || 3000

console.log(`🚀 Server starting on port ${port}...`)

Bun.serve({
  fetch: app.fetch,
  port,
  hostname: '0.0.0.0',
})

console.log(`✅ Server is running on http://localhost:${port}`)
console.log(`📋 Health check: http://localhost:${port}/health`)
console.log(`🔌 API base: http://localhost:${port}/api/v1`)
