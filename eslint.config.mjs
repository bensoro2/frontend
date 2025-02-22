import nextPlugin from '@next/eslint-plugin-next'

export default [
  {
    plugins: {
      next: nextPlugin
    },
    extends: [
      'next/core-web-vitals'
    ]
  }
]
