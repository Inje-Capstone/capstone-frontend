import { useState } from 'react'
import { apiRequest } from '../api/apiClient'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

function ApiTestPage() {
  const [method, setMethod] = useState<HttpMethod>('GET')
  const [endpoint, setEndpoint] = useState('/')
  const [requestBody, setRequestBody] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)

  const sendRequest = async () => {
    setLoading(true)
    setResponse('')

    try {
      let body: string | undefined

      if (method !== 'GET' && requestBody.trim()) {
        JSON.parse(requestBody)
        body = requestBody
      }

      const result = await apiRequest<unknown>(endpoint, {
        method,
        body,
      })

      setResponse(
        `HTTP ${result.status}\n\n${
          result.data === null
            ? '(No response body)'
            : JSON.stringify(result.data, null, 2)
        }`,
      )
    } catch (error) {
      if (error instanceof SyntaxError) {
        setResponse('Request body must be valid JSON.')
      } else if (error instanceof Error) {
        setResponse(error.message)
      } else {
        setResponse('Unknown error occurred.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ maxWidth: '900px', margin: '40px auto', padding: '20px' }}>
      <h1>Backend API Test</h1>

      <p>API Base URL: {import.meta.env.VITE_API_BASE_URL}</p>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <select
          value={method}
          onChange={(event) => setMethod(event.target.value as HttpMethod)}
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="PATCH">PATCH</option>
          <option value="DELETE">DELETE</option>
        </select>

        <input
          style={{ flex: 1 }}
          value={endpoint}
          onChange={(event) => setEndpoint(event.target.value)}
          placeholder="/api/example"
        />

        <button onClick={sendRequest} disabled={loading}>
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>

      {method !== 'GET' && (
        <>
          <h2>Request Body</h2>

          <textarea
            style={{ width: '100%', minHeight: '160px' }}
            value={requestBody}
            onChange={(event) => setRequestBody(event.target.value)}
            placeholder={'{\n  "key": "value"\n}'}
          />
        </>
      )}

      <h2>Response</h2>

      <pre
        style={{
          minHeight: '200px',
          padding: '16px',
          background: '#f4f4f4',
          overflow: 'auto',
          whiteSpace: 'pre-wrap',
        }}
      >
        {response || 'No request sent yet.'}
      </pre>
    </main>
  )
}

export default ApiTestPage